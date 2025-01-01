import { ContextMenu, ContextMenuTrigger } from '@radix-ui/react-context-menu';
import { IKeyframe, ITrack } from '@vxengine/AnimationEngine/types/track';
import { useTimelineEditorAPI } from '@vxengine/managers/TimelineManager';
import { parserTimeToPixel, parserPixelToTime } from '@vxengine/managers/TimelineManager/utils/deal_data';
import React, { useEffect, useState, memo, useCallback, useMemo, useRef, useLayoutEffect } from 'react'
import KeyframeContextMenu from './KeyframeContextMenu';
import { RowDnd } from '../RowDnd';
import { DEFAULT_ROW_HEIGHT } from '@vxengine/AnimationEngine/interface/const';
import { ONE_SECOND_UNIT_WIDTH } from '@vxengine/managers/constants';
import { selectKeyframeSTATIC as selectKeyframe, truncateToDecimals, updatedOrderedKeyframeIdsLogic } from '@vxengine/managers/TimelineManager/store';
import { shallow } from 'zustand/shallow';
import interact from "interactjs";
import { DragEvent, Interactable } from "@interactjs/types";
import { useRefStore } from '@vxengine/utils';
import { keyframesRef, trackSegmentsRef } from '@vxengine/utils/useRefStore';
import { isEqual, throttle } from 'lodash';
import { SelectedKeyframe, TimelineEditorStoreProps } from '@vxengine/managers/TimelineManager/types/store';
import { produce } from 'immer';
import { getVXEngineState } from '@vxengine/engine';
import { segmentStartLeft } from '../Track/TrackSegment';

export type EditKeyframeProps = {
    keyframeKey: string;
    nextKeyframeKey: string;
    prevKeyframeKey: string;
    trackKey: string;
    snap: boolean
    isSelected: boolean
};

const keyframeStartLeft = 13.616;


const Keyframe: React.FC<EditKeyframeProps> = memo(({
    keyframeKey,
    nextKeyframeKey,
    prevKeyframeKey,
    trackKey,
    snap,
    isSelected
}) => {
    const elementRef = useRef<SVGSVGElement>(null);
    const interactableRef = useRef<Interactable>()

    const deltaX = useRef(0)

    useLayoutEffect(() => {
        const timelineEditorState = useTimelineEditorAPI.getState();
        const initialScale = timelineEditorState.scale
        const initialKeyframeTime = timelineEditorState.tracks[trackKey]?.keyframes[keyframeKey].time

        // Handle Centralized Ref Store for DOM Mutations
        const keyframesRef = useRefStore.getState().keyframesRef;
        keyframesRef.set(keyframeKey, elementRef.current as any);

        // Handle dataset initialization
        const left = parserTimeToPixel(initialKeyframeTime, keyframeStartLeft, initialScale)
        elementRef.current.style.left = `${left}px`
        Object.assign(elementRef.current.dataset, {
            left,
            time: initialKeyframeTime,
            nextKeyframeKey,
            prevKeyframeKey
        })

        // Handle Interactable
        if (interactableRef.current)
            interactableRef.current.unset();
        interactableRef.current = interact(elementRef.current)

        interactableRef.current.draggable({
            onmove: (e) => handleOnMove(e, deltaX, trackKey, keyframeKey)
        })

        //  Cleanup
        return () => {
            if (interactableRef.current)
                interactableRef.current.unset();

            keyframesRef.delete(keyframeKey);
        };
    }, [])

    // Repair the dataset 
    useLayoutEffect(() => {
        Object.assign(elementRef.current.dataset, {
            nextKeyframeKey,
            prevKeyframeKey
        })
    }, [nextKeyframeKey, prevKeyframeKey])

    return (
        <ContextMenu>
            <ContextMenuTrigger>
                <svg
                    id={keyframeKey}
                    viewBox="0 0 100 100"
                    className={`absolute my-auto w-[11px] z-10 fill-white hover:fill-blue-600 !cursor-pointer
                                    ${isSelected && "!fill-yellow-300"}`
                    }
                    style={{ height: DEFAULT_ROW_HEIGHT - 1}}
                    onClick={(e) => handleOnClick(e, trackKey, keyframeKey)}
                    onContextMenu={(e) => selectKeyframe(trackKey, keyframeKey)}
                    ref={elementRef}
                >
                    <polygon
                        points="50,0 100,50 50,100 0,50"
                        stroke="black"
                        strokeWidth="5"
                    />
                </svg>
            </ContextMenuTrigger>
            <KeyframeContextMenu trackKey={trackKey} keyframeKey={keyframeKey} />
        </ContextMenu>
    );
})


export default Keyframe


const handleOnClick = (event: React.MouseEvent, trackKey: string, keyframeKey: string) => {
    event.preventDefault();

    const timelineEditorAPI = useTimelineEditorAPI.getState();

    const {
        selectedKeyframeKeys,
        removeSelectedKeyframe,
        isKeyframeSelected,
        clearSelectedKeyframes,
        getAllKeyframes,
        setLastKeyframeSelectedIndex,
        lastKeyframeSelectedIndex,
        setSelectedTrackSegment
    } = timelineEditorAPI;

    setSelectedTrackSegment(null, null, null);
    // Get keyframes and their indices
    const keyframes = getAllKeyframes(); // Retrieve all keyframes for the track

    const selectedKeyframesFlatMap = Object.values(selectedKeyframeKeys).flatMap(track => Object.keys(track));
    // Find the index of the clicked keyframe
    const keyframeIndex = keyframes.findIndex(kf => kf.id === keyframeKey)

    if (keyframeIndex === -1) return; // Keyframe not found


    // Click + CTRL key ( command key on macOS )
    // CTRL or Meta key (multi-select)
    if (event.metaKey || event.ctrlKey) {
        if (isKeyframeSelected(trackKey, keyframeKey)) {
            // If already selected, remove the selection
            removeSelectedKeyframe(trackKey, keyframeKey)
        } else {
            // Add the keyframe to the selection
            selectKeyframe(trackKey, keyframeKey);
        }
    }
    else if (event.shiftKey && lastKeyframeSelectedIndex !== null) {
        const start = Math.min(lastKeyframeSelectedIndex, keyframeIndex);
        const end = Math.max(lastKeyframeSelectedIndex, keyframeIndex);

        // Select all keyframes in the range
        for (let i = start; i <= end; i++) {
            selectKeyframe(trackKey, selectedKeyframesFlatMap[i]);
        }
    }
    // Normal Click
    else {
        clearSelectedKeyframes();
        selectKeyframe(trackKey, keyframeKey);
    }

    setLastKeyframeSelectedIndex(keyframeIndex)
}

const rowHeight = DEFAULT_ROW_HEIGHT

const boundsLeft = keyframeStartLeft;


// A setKeyframeTime function for multiple keyframes that is batched and throttled
const batchThrottleSetMultipleKeyframeTime = throttle(
    (selectedKeyframesFlatMap: SelectedKeyframe[], deltaTime: number) => {
        useTimelineEditorAPI.setState(
            produce((state: TimelineEditorStoreProps) => {
                selectedKeyframesFlatMap.forEach(selectKeyframeFlat => {
                    const { trackKey, keyframeKey } = selectKeyframeFlat;
                    const kfElement = keyframesRef.get(keyframeKey);
                    const { time: timeStr } = kfElement.dataset;
                    const oldKeyframeTime = parseFloat(timeStr);
                    const newKeyframeTime = oldKeyframeTime + deltaTime;

                    if (newKeyframeTime !== null && newKeyframeTime !== undefined && !isNaN(newKeyframeTime)) {
                        state.tracks[trackKey].keyframes[keyframeKey].time = newKeyframeTime;
                    }
                })
            })
        )
    }, 500, { trailing: true })

const handleKeyframeDrag = (newLeft: number, prevLeft: number, trackKey: string, keyframeKey: string) => {
    const { selectedKeyframesFlatMap, setKeyframeTime, scale, addChange } = useTimelineEditorAPI.getState();

    if (selectedKeyframesFlatMap.length === 0)
        selectKeyframe(trackKey, keyframeKey)
    // Single Keyframe Drag
    else if (selectedKeyframesFlatMap.length === 1) {
        const newTime = parserPixelToTime(newLeft, keyframeStartLeft, true, scale)
        setKeyframeTime(keyframeKey, trackKey, newTime, true, true);
    }
    // Multiple Keyframe Drag
    else if (selectedKeyframesFlatMap.length > 1) {
        const lastTime = parserPixelToTime(prevLeft, keyframeStartLeft)
        const newTime = parserPixelToTime(newLeft, keyframeStartLeft)
        const deltaTime = newTime - lastTime;

        // Handle Throttled State Update
        batchThrottleSetMultipleKeyframeTime(selectedKeyframesFlatMap, deltaTime);

        const animationEngine = getVXEngineState().getState().animationEngine;
        selectedKeyframesFlatMap.forEach((selectedKeyframeFlat, index) => {
            const isFinal = selectedKeyframesFlatMap.length - 1 === index;
            const { keyframeKey: _kfKey, trackKey: _trackKey } = selectedKeyframeFlat;
            const kfElement = keyframesRef.get(_kfKey);
            const { time: timeStr } = kfElement.dataset;
            let _newTime = parseFloat(timeStr) + deltaTime;
            _newTime = truncateToDecimals(_newTime)

            // Handle Raw Timeline Update
            animationEngine.refreshKeyframe(_trackKey, "updateTime", _kfKey, isFinal, _newTime);

            // Handle UI Mutation
            handleKeyframeMutation(_kfKey, _newTime, true)
        })

        // Handle Keyframe Order in track
        useTimelineEditorAPI.setState(
            produce((state: TimelineEditorStoreProps) => {
                // Use the Hydrated Time Data form KeyframeRefs to update the orderedKeyframeKeys on a track
                Object.keys(state.selectedKeyframeKeys).forEach((_trackKey) => {
                    const track = state.tracks[_trackKey]
                    const staleOrderedKeyframeKeys = track?.orderedKeyframeKeys;
                    // Use the Time from the Hydrated Dataset
                    const hydratedKeyframeDataset: Record<string, DOMStringMap> = {};
                    staleOrderedKeyframeKeys.forEach((_keyframeKey) => {
                        const keyframeDataset = keyframesRef.get(_keyframeKey)?.dataset;
                        hydratedKeyframeDataset[_keyframeKey] = keyframeDataset;
                    })
                    const hydratedSortedKeys = Object.keys(hydratedKeyframeDataset).sort(
                        (a, b) => parseFloat(hydratedKeyframeDataset[a].time) - parseFloat(hydratedKeyframeDataset[b].time)
                    )

                    if (!isEqual(hydratedSortedKeys, staleOrderedKeyframeKeys)) 
                        state.tracks[_trackKey].orderedKeyframeKeys = hydratedSortedKeys
                })
            })
        )
    }

    addChange();
}

const handleOnMove = (e: DragEvent, deltaXRef: { current: number }, trackKey: string, keyframeKey: string) => {
    const target = e.target;
    if (!target.dataset.left) {
        target.dataset.left = target.style.left.replace('px', '') || '0';
    }
    const { left } = target.dataset;
    const preLeft = parseFloat(left);

    deltaXRef.current += e.dx
    let curLeft = preLeft + e.dx;

    // Handle Bounds
    if (curLeft < boundsLeft)
        curLeft = boundsLeft;

    // Handle TimelineEditor Data and UI Mutation
    handleKeyframeDrag(curLeft, preLeft, trackKey, keyframeKey)
}


export const handleKeyframeMutation = (keyframeKey: string, newTime: number, updateSegments: boolean) => {
    const keyframeElement = keyframesRef.get(keyframeKey);
    const timelineEditorState = useTimelineEditorAPI.getState();
    const { scale } = timelineEditorState;

    let newKfLeft = parserTimeToPixel(newTime, keyframeStartLeft, scale)
    let newSgLeft = parserTimeToPixel(newTime, segmentStartLeft, scale);

    // Handle Keyframe Mutation
    keyframeElement.style.left = `${newKfLeft}px`
    Object.assign(keyframeElement.dataset, { left: newKfLeft, time: newTime })
    // Handle Track Segment Mutation
    if (updateSegments) {
        // prevKf <--- kf
        if (keyframeElement.dataset.prevKeyframeKey !== "undefined") {
            const firstKeyframeKey = keyframeElement.dataset.prevKeyframeKey
            const secondKeyframeKey = keyframeKey;
            const trackSegmentKey = `${firstKeyframeKey}.${secondKeyframeKey}`

            const tsElement = trackSegmentsRef.get(trackSegmentKey);
            if (!tsElement)
                return
            const prevKeyframe = keyframesRef.get(firstKeyframeKey)
            const prevKeyframeLeft = parseFloat(prevKeyframe.dataset.left)

            const newWidth = newKfLeft - prevKeyframeLeft

            // No need to update the left because this 
            // is the secondKeyframe of a trackSegment
            tsElement.style.width = `${newWidth}px`;
            Object.assign(tsElement.dataset, { width: newWidth })
        }
        // kf ---> nextKf
        if (keyframeElement.dataset.nextKeyframeKey !== "undefined") {
            const firstKeyframeKey = keyframeKey;
            const secondKeyframeKey = keyframeElement.dataset.nextKeyframeKey;
            const trackSegmentKey = `${firstKeyframeKey}.${secondKeyframeKey}`

            const tsElement = trackSegmentsRef.get(trackSegmentKey);
            if (!tsElement)
                return
            const oldWidth = parseFloat(tsElement.dataset.width);
            const oldSgLeft = parseFloat(tsElement.dataset.left);

            const deltaWidth = oldSgLeft - newSgLeft
            const newWidth = oldWidth + deltaWidth;

            tsElement.style.width = `${newWidth}px`;
            tsElement.style.left = `${newSgLeft}px`
            Object.assign(tsElement.dataset, {
                width: newWidth,
                left: newSgLeft
            });
        }
    }
}

