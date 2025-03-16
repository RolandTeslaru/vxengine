import { useTimelineManagerAPI } from '@vxengine/managers/TimelineManager';
import { parserTimeToPixel, parserPixelToTime } from '@vxengine/managers/TimelineManager/utils/deal_data';
import { selectKeyframeSTATIC as selectKeyframe, useTimelineEditorAPI } from '@vxengine/managers/TimelineManager/TimelineEditor/store';
import { keyframesRef } from '@vxengine/utils/useRefStore';
import { isEqual } from 'lodash';
import { produce } from 'immer';
import { segmentStartLeft } from '../Track/TrackSegment';
import { keyframeStartLeft } from '.';
import { handleTrackSegmentMutation } from '../Track/utils';
import animationEngineInstance from '@vxengine/singleton';
import { extractDataFromTrackKey } from '@vxengine/managers/TimelineManager/utils/trackDataProcessing';
import { DEFAULT_SCALE_WIDTH } from '@vxengine/AnimationEngine/interface/const';
import { TimelineManagerAPIProps } from '@vxengine/managers/TimelineManager/types/store';
import { truncateToDecimals } from '@vxengine/managers/TimelineManager/store';

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
        edObject.trackKeys.forEach((_trackKey) => {
            selectAllKeyframesOnTrack(_trackKey);
        })
    }
}




const boundsLeft = keyframeStartLeft;

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

    const boundsRight = getRightBounds();

    if (selectedKeyframesFlatMap.length === 0)
        selectKeyframe(trackKey, keyframeKey)
    // Single Keyframe Drag
    else if (selectedKeyframesFlatMap.length === 1) {
        const {vxkey, propertyPath} = extractDataFromTrackKey(trackKey);
        if (newLeft < boundsLeft) {
            newLeft = boundsLeft;
        }
        if (newLeft > boundsRight) {
            newLeft = boundsRight;
        }
        const newSafeTime = truncateToDecimals(parserPixelToTime(newLeft, keyframeStartLeft, true, scale))
        animationEngineInstance.hydrationService.hydrateKeyframe({
            vxkey,
            propertyPath,
            action: "updateTime",
            keyframeKey,
            newTime: newSafeTime
        })
        animationEngineInstance.reRender({force: true})

        if(mutateUI)
            handleKeyframeMutation(keyframeKey, newLeft, newSafeTime, scale, true);
    }
    // Multiple Keyframe Drag
    else if (selectedKeyframesFlatMap.length > 1) {
        const currentTimelineLength = useTimelineManagerAPI.getState().currentTimelineLength;
        const unsafeDeltaLeft = newLeft - prevLeft;
        const unsafeDeltaTime = (unsafeDeltaLeft / DEFAULT_SCALE_WIDTH) * scale;

        // Find the first and last keyframes based on their current time
        let firstKf = { keyframeKey: "", time: currentTimelineLength, left: boundsRight };
        let lastKf = { keyframeKey: "", time: 0, left: boundsLeft };

        selectedKeyframesFlatMap.forEach((_selectedKf) => {
            const _kfElement = keyframesRef.get(_selectedKf.keyframeKey);
            const time = parseFloat(_kfElement.dataset.time);
            const _kfLeft = parseFloat(_kfElement.dataset.left);

            if (time < firstKf.time) {
                firstKf = { keyframeKey: _selectedKf.keyframeKey, time, left: _kfLeft };
            }
            if (time > lastKf.time) {
                lastKf = { keyframeKey: _selectedKf.keyframeKey, time, left: _kfLeft };
            }
        });

        // Calculate potential new times without boundary checks
        const potentialFirstKfTime = firstKf.time + unsafeDeltaTime;
        const potentialLastKfTime = lastKf.time + unsafeDeltaTime;

        let safeDeltaTime = unsafeDeltaTime;

        // Snap to left boundary (time 0)
        if (potentialFirstKfTime < 0) {
            safeDeltaTime = -firstKf.time; // Shift so first keyframe lands at 0.0000
        }
        // Snap to right boundary (currentTimelineLength)
        else if (potentialLastKfTime > currentTimelineLength) {
            safeDeltaTime = currentTimelineLength - lastKf.time; // Shift so last keyframe lands at max time
        }

        // Apply the safe time shift to all keyframes
        selectedKeyframesFlatMap.forEach(({ keyframeKey: _kfKey, trackKey: _trackKey }, index) => {
            const isFinalKf = selectedKeyframesFlatMap.length - 1 === index;
            const _kfDataset = keyframesRef.get(_kfKey).dataset;
            const originalTime = parseFloat(_kfDataset.time);
            const newKfTime = originalTime + safeDeltaTime;

            // Clamp the time to ensure it stays within bounds (optional, for safety)
            const clampedNewKfTime = truncateToDecimals(Math.max(0, Math.min(newKfTime, currentTimelineLength)))

            // Calculate the new left position based on the new time
            const newKfLeft = parserTimeToPixel(clampedNewKfTime, boundsLeft, scale); // Adjust this based on your function

            const { vxkey: _vxkey, propertyPath: _propertyPath } = extractDataFromTrackKey(_trackKey);

            // Update the keyframe time
            animationEngineInstance.hydrationService.hydrateKeyframe({
                vxkey: _vxkey,
                propertyPath: _propertyPath,
                action: "updateTime",
                keyframeKey: _kfKey,
                newTime: clampedNewKfTime
            });

            if (isFinalKf) {
                animationEngineInstance.reRender({ force: true });
            }

            if (mutateUI) {
                handleKeyframeMutation(_kfKey, newKfLeft, clampedNewKfTime, scale, true);
            }
        });

        // Handle keyframe order in track
        if (hydrateKeyframeOrder) {
            hydrateKeyframeKeysOrder();
        }
    }

    useTimelineManagerAPI.getState().addChange()
}

export const hydrateKeyframeKeysOrder = () => {
    const selectedKeyframeKeys = useTimelineEditorAPI.getState().selectedKeyframeKeys
    useTimelineManagerAPI.setState(
        produce((state: TimelineManagerAPIProps) => {
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
