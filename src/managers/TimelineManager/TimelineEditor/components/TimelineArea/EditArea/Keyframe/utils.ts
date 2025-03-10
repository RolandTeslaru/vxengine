import { useTimelineManagerAPI } from '@vxengine/managers/TimelineManager';
import { parserTimeToPixel, parserPixelToTime } from '@vxengine/managers/TimelineManager/utils/deal_data';
import { selectKeyframeSTATIC as selectKeyframe, useTimelineEditorAPI } from '@vxengine/managers/TimelineManager/TimelineEditor/store';
import { keyframesRef } from '@vxengine/utils/useRefStore';
import { isEqual } from 'lodash';
import { produce } from 'immer';
import { segmentStartLeft } from '../Track/TrackSegment';
import { keyframeStartLeft } from '.';
import { handleTrackSegmentMutation } from '../Track/utils';
import { invalidate } from '@react-three/fiber';
import { truncateToDecimals } from '@vxengine/managers/TimelineManager/store';
import { TimelineMangerAPIProps } from '@vxengine/managers/TimelineManager/types/store';
import animationEngineInstance from '@vxengine/singleton';
import { extractDataFromTrackKey } from '@vxengine/managers/TimelineManager/utils/trackDataProcessing';
import { DEFAULT_SCALE_WIDTH } from '@vxengine/AnimationEngine/interface/const';

export const selectAllKeyframesAfter = (trackKey: string, keyframeKey: string) => {
    const state = useTimelineManagerAPI.getState();
    const track = state.tracks[trackKey];
    const orderedKeyframeKeys = track.orderedKeyframeKeys;

    let found = false;
    for (const kfKey of orderedKeyframeKeys) {
        if (kfKey === keyframeKey) {
            found = true;
        }
        if (found) {
            selectKeyframe(trackKey, kfKey);
        }
    }

}
export const selectAllKeyframesBefore = (trackKey: string, keyframeKey: string) => {
    const state = useTimelineManagerAPI.getState();
    const track = state.tracks[trackKey];
    const orderedKeyframeKeys = track.orderedKeyframeKeys;

    for (const kfKey of orderedKeyframeKeys) {
        if (kfKey === keyframeKey) {
            break; // Stop iteration once we reach the specified keyframe
        }
        selectKeyframe(trackKey, kfKey);
    }
}

export const selectAllKeyframesOnTrack = (trackKey: string) => {
    const state = useTimelineManagerAPI.getState();
    const track = state.tracks[trackKey];

    const orderedKeyframeKeys = track.orderedKeyframeKeys;

    for (const kfKey of orderedKeyframeKeys) {
        selectKeyframe(trackKey, kfKey);
    }
}

export const selectAllKeyframesOnObject = (trackKey: string) => {
    const state = useTimelineManagerAPI.getState();

    const vxkey = trackKey.split(".")[0];
    const edObject = state.editorObjects[vxkey];
    if (edObject) {
        debugger
        edObject.trackKeys.forEach((_trackKey) => {
            selectAllKeyframesOnTrack(_trackKey);
        })
    }
}




const boundsLeft = keyframeStartLeft;

const isOutsideBoundry = (mostOnLeft, mostOnRight) => {
    const currentTimelineLength = useTimelineManagerAPI.getState().currentTimelineLength;
    const scale = useTimelineEditorAPI.getState().scale;  
    const boundsRight = currentTimelineLength * DEFAULT_SCALE_WIDTH / scale - keyframeStartLeft

    let isOutside = false

    if (mostOnLeft < boundsLeft)
        isOutside = true;
    else if (boundsRight < mostOnRight)
        isOutside = true

    console.log("boundryLeft:",boundsLeft, "mostOnLeft:", mostOnLeft, "mostOnRight:", mostOnRight, "boundryRight:", boundsRight)

    console.log("Is Outside:", isOutside)

    return isOutside
}

const getRightBounds = () => {
    const currentTimelineLength = useTimelineManagerAPI.getState().currentTimelineLength;
    const scale = useTimelineEditorAPI.getState().scale;  
    return currentTimelineLength * DEFAULT_SCALE_WIDTH / scale + keyframeStartLeft
}


export const handleKeyframeDrag = (
    newLeft: number,
    prevLeft: number,
    trackKey: string,
    keyframeKey: string,
    mutateUI = true,
    hydrateKeyframeOrder = true
) => {
    const { selectedKeyframesFlatMap, scale } = useTimelineEditorAPI.getState();
    const setKeyframeTime = useTimelineManagerAPI.getState().setKeyframeTime

    const boundsRight = getRightBounds();

    if (selectedKeyframesFlatMap.length === 0)
        selectKeyframe(trackKey, keyframeKey)
    // Single Keyframe Drag
    else if (selectedKeyframesFlatMap.length === 1) {
        if(newLeft < boundsLeft){
            newLeft = boundsLeft;
        }
        if(newLeft > boundsRight){
            newLeft = boundsRight;
        }
        const newTime = parserPixelToTime(newLeft, keyframeStartLeft, true, scale)
        setKeyframeTime(keyframeKey, trackKey, newTime, true, mutateUI);
    }
    // Multiple Keyframe Drag
    else if (selectedKeyframesFlatMap.length > 1) {
        // const unsafeDeltaLeft = newLeft - prevLeft;
        // let mostOnLeft = newLeft;
        // let mostOnRight = newLeft;

        // let safeDeltaLeft = unsafeDeltaLeft;
        // // let firstKfTime = parserPixelToTime(newLeft, keyframeStartLeft, true, scale);
        // // let

        // let firstKf: HTMLElement;
        // let lastKf: HTMLElement;

        // selectedKeyframesFlatMap.forEach((_kf) => {
        //     const keyframeElement = keyframesRef.get(_kf.keyframeKey);
        //     const kfLeft = parseFloat(keyframeElement.dataset.left);

        //     if (kfLeft < mostOnLeft){
        //         firstKf = keyframeElement;
        //     }
        //     if (mostOnRight < kfLeft){
        //         lastKf = keyframeElement
        //     }
        // })

        // let firstKfTime = parseFloat(firstKf.dataset.time)
        // let lastKfTime = parseFloat(lastKf.dataset.time)
        // let safeDeltaTime = 0;

        // if(mostOnLeft + unsafeDeltaLeft < boundsLeft){
        //     const deltaOutLeft = boundsLeft - mostOnLeft;
        //     const previousMostOnLeft = mostOnLeft;
        //     mostOnLeft = boundsLeft;
        //     safeDeltaLeft = previousMostOnLeft - mostOnLeft;
            
        //     firstKfTime = 0;
        //     safeDeltaTime = 
        // }
        // if(mostOnRight + unsafeDeltaLeft > boundsRight){
        //     const deltaOutRight = boundsRight - mostOnRight;

        //     lastKfTime = useTimelineManagerAPI.getState().currentTimelineLength;
        //     // newLeft += deltaOutRight;
        // }
        
        const lastTime = parserPixelToTime(prevLeft, keyframeStartLeft)
        const newTime = parserPixelToTime(newLeft, keyframeStartLeft)
        const deltaTime = newTime - lastTime;

        selectedKeyframesFlatMap.forEach((selectedKeyframeFlat, index) => {
            const isFinal = selectedKeyframesFlatMap.length - 1 === index;
            const { keyframeKey: _kfKey, trackKey: _trackKey } = selectedKeyframeFlat;
            const kfDataset = keyframesRef.get(_kfKey).dataset;
            let _newTime = parseFloat(kfDataset.time) + deltaTime;
            _newTime = truncateToDecimals(_newTime)

            const { vxkey: _vxkey, propertyPath: _propertyPath } = extractDataFromTrackKey(_trackKey)

            // Handle Raw Timeline Update
            animationEngineInstance.hydrationService.hydrateKeyframe({
                vxkey: _vxkey, 
                propertyPath: _propertyPath, 
                action: "updateTime", 
                keyframeKey: _kfKey, 
                newTime: _newTime
            });

            if(isFinal)
                animationEngineInstance.reRender({force: true})

            // Handle UI Mutation
            if (mutateUI)
                handleKeyframeMutationByTime(_kfKey, _newTime, true)
        })

        // Handle Keyframe Order in track
        if (hydrateKeyframeOrder)
            hydrateKeyframeKeysOrder()
    }

    useTimelineManagerAPI.getState().addChange()
}

export const hydrateKeyframeKeysOrder = () => {
    const selectedKeyframeKeys = useTimelineEditorAPI.getState().selectedKeyframeKeys
    useTimelineManagerAPI.setState(
        produce((state: TimelineMangerAPIProps) => {
            Object.keys(selectedKeyframeKeys).forEach((_trackKey) => {
                const track = state.tracks[_trackKey];
                const staleOrderedKeyframeKeys = track?.orderedKeyframeKeys;

                const hydratedKeyframeDataset: Record<string, DOMStringMap> = {};
                staleOrderedKeyframeKeys.forEach((_keyframeKey) => {
                    const keyframeDataset = keyframesRef.get(_keyframeKey)?.dataset;
                    hydratedKeyframeDataset[_keyframeKey] = keyframeDataset;
                })
                const hydratedSortedKeys = Object.keys(hydratedKeyframeDataset).sort(
                    (a, b) => parseFloat(hydratedKeyframeDataset[a].time) - parseFloat(hydratedKeyframeDataset[b].time)
                )

                if (!isEqual(hydratedSortedKeys, staleOrderedKeyframeKeys)) {
                    state.tracks[_trackKey].orderedKeyframeKeys = hydratedSortedKeys
                }
            })
        })
    )
}

export const handleKeyframeMutationByTime = (
    keyframeKey: string,
    newTime: number,
    mutateTrackSegments: boolean
) => {
    const scale = useTimelineEditorAPI.getState().scale
    const newKfLeft = parserTimeToPixel(newTime, keyframeStartLeft, scale)

    handleKeyframeMutation(keyframeKey, newKfLeft, newTime, scale, mutateTrackSegments)
}

export const handleKeyframeMutationByPixel = (
    keyframeKey: string,
    newKfLeft: number,
    mutateTrackSegments: boolean
) => {
    const scale = useTimelineEditorAPI.getState().scale;
    const newTime = parserPixelToTime(newKfLeft, keyframeStartLeft)
    handleKeyframeMutation(keyframeKey, newKfLeft, newTime, scale, mutateTrackSegments)
}

export const handleKeyframeMutation = (
    keyframeKey: string,
    newKfLeft: number,
    newTime: number,
    scale: number,
    mutateTrackSegments: boolean
) => {
    const keyframeElement = keyframesRef.get(keyframeKey);

    // Handle Keyframe Mutation
    keyframeElement.style.left = `${newKfLeft}px`
    Object.assign(keyframeElement.dataset, { left: newKfLeft, time: newTime })

    // Handle Track Segment Mutation
    if (mutateTrackSegments) {
        // firstKf <--- kf
        if (keyframeElement.dataset.prevKeyframeKey !== "undefined") {
            const firstKfKey = keyframeElement.dataset.prevKeyframeKey
            const secondKfKey = keyframeKey;
            const secondKfLeft = newKfLeft

            const firstKf = keyframesRef.get(firstKfKey)
            const firstKfLeft = parseFloat(firstKf.dataset.left)

            const newWidth = secondKfLeft - firstKfLeft

            handleTrackSegmentMutation({
                firstKeyframeKey: firstKfKey,
                secondKeyframeKey: secondKfKey,
                newWidth
            })
        }
        // kf ---> secondKf
        if (keyframeElement.dataset.nextKeyframeKey !== "undefined") {
            const firstKfKey = keyframeKey;
            const newSgLeft = parserTimeToPixel(newTime, segmentStartLeft, scale)
            const secondKfKey = keyframeElement.dataset.nextKeyframeKey;

            const secondKf = keyframesRef.get(secondKfKey);
            const secondKfLeft = parseFloat(secondKf.dataset.left);

            const newWidth = secondKfLeft - newKfLeft;

            handleTrackSegmentMutation({
                firstKeyframeKey: firstKfKey,
                secondKeyframeKey: secondKfKey,
                newWidth,
                newLeft: newSgLeft
            })
        }
    }
}
