import { useTimelineEditorAPI } from '@vxengine/managers/TimelineManager';
import { parserTimeToPixel, parserPixelToTime } from '@vxengine/managers/TimelineManager/utils/deal_data';
import { selectKeyframeSTATIC as selectKeyframe, truncateToDecimals } from '@vxengine/managers/TimelineManager/store';
import { keyframesRef } from '@vxengine/utils/useRefStore';
import { isEqual } from 'lodash';
import { TimelineEditorStoreProps } from '@vxengine/managers/TimelineManager/types/store';
import { produce } from 'immer';
import { getVXEngineState } from '@vxengine/engine';
import { segmentStartLeft } from '../Track/TrackSegment';
import { keyframeStartLeft } from '.';
import { handleTrackSegmentMutation } from '../Track/utils';

export const selectAllKeyframesAfter = (trackKey: string, keyframeKey: string) => {
    const state = useTimelineEditorAPI.getState();
    const track = state.tracks[trackKey];
    const orderedKeyframeKeys = track.orderedKeyframeKeys;
    const selectKeyframe = state.selectKeyframe;

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
    const state = useTimelineEditorAPI.getState();
    const track = state.tracks[trackKey];
    const orderedKeyframeKeys = track.orderedKeyframeKeys;
    const selectKeyframe = state.selectKeyframe;

    for (const kfKey of orderedKeyframeKeys) {
        if (kfKey === keyframeKey) {
            break; // Stop iteration once we reach the specified keyframe
        }
        selectKeyframe(trackKey, kfKey);
    }
}

export const selectAllKeyframesOnTrack = (trackKey: string) => {
    const state = useTimelineEditorAPI.getState();
    const selectKeyframe = state.selectKeyframe;
    const track = state.tracks[trackKey];

    const orderedKeyframeKeys = track.orderedKeyframeKeys;

    for (const kfKey of orderedKeyframeKeys) {
        selectKeyframe(trackKey, kfKey);
    }
}

export const selectAllKeyframesOnObject = (trackKey: string) => {
    const state = useTimelineEditorAPI.getState();

    const vxkey = trackKey.split(".")[0];
    const edObject = state.editorObjects[vxkey];
    if (edObject) {
        edObject.trackKeys.forEach((_trackKey) => {
            selectAllKeyframesOnTrack(_trackKey);
        })
    }
}




export const handleKeyframeDrag = (
    newLeft: number,
    prevLeft: number,
    trackKey: string,
    keyframeKey: string,
    mutateUI = true,
    hydrateKeyframeOrder = true
) => {
    const { selectedKeyframesFlatMap, setKeyframeTime, scale, addChange } = useTimelineEditorAPI.getState();

    if (selectedKeyframesFlatMap.length === 0)
        selectKeyframe(trackKey, keyframeKey)
    // Single Keyframe Drag
    else if (selectedKeyframesFlatMap.length === 1) {
        const newTime = parserPixelToTime(newLeft, keyframeStartLeft, true, scale)
        setKeyframeTime(keyframeKey, trackKey, newTime, true, mutateUI);
    }
    // Multiple Keyframe Drag
    else if (selectedKeyframesFlatMap.length > 1) {
        const lastTime = parserPixelToTime(prevLeft, keyframeStartLeft)
        const newTime = parserPixelToTime(newLeft, keyframeStartLeft)
        const deltaTime = newTime - lastTime;

        const animationEngine = getVXEngineState().getState().animationEngine;

        selectedKeyframesFlatMap.forEach((selectedKeyframeFlat, index) => {
            const isFinal = selectedKeyframesFlatMap.length - 1 === index;
            const { keyframeKey: _kfKey, trackKey: _trackKey } = selectedKeyframeFlat;
            const kfDataset = keyframesRef.get(_kfKey).dataset;
            let _newTime = parseFloat(kfDataset.time) + deltaTime;
            _newTime = truncateToDecimals(_newTime)

            // Handle Raw Timeline Update
            animationEngine.hydrateKeyframe(_trackKey, "updateTime", _kfKey, isFinal, _newTime);

            // Handle UI Mutation
            if (mutateUI)
                handleKeyframeMutation(_kfKey, _newTime, true)
        })

        // Handle Keyframe Order in track
        if (hydrateKeyframeOrder)
            hydrateKeyframeKeysOrder()
    }

    addChange();
}

export const hydrateKeyframeKeysOrder = () => {
    useTimelineEditorAPI.setState(
        produce((state: TimelineEditorStoreProps) => {
            Object.keys(state.selectedKeyframeKeys).forEach((_trackKey) => {
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

export const handleKeyframeMutation = (
    keyframeKey: string,
    newTime: number,
    mutateTrackSegments: boolean
) => {
    const keyframeElement = keyframesRef.get(keyframeKey);
    const timelineEditorState = useTimelineEditorAPI.getState();
    const { scale } = timelineEditorState;

    let newKfLeft = parserTimeToPixel(newTime, keyframeStartLeft, scale)

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

