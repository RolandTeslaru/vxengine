import React, { FC, useEffect, useMemo, useState, memo, useCallback, useRef, useLayoutEffect } from 'react';
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from '@vxengine/components/shadcn/contextMenu';
import { useTimelineEditorAPI } from '@vxengine/managers/TimelineManager';
import { parserPixelToTime, parserTimeToPixel } from '@vxengine/managers/TimelineManager/utils/deal_data';
import Keyframe from '../Keyframe';
import { DragLineData } from '../DragLines';
import { RowDnd } from '../RowDnd';
import KeyframeContextMenu from '../Keyframe/KeyframeContextMenu';
import { selectKeyframeSTATIC as selectKeyframe } from '@vxengine/managers/TimelineManager/store';
import { IKeyframe } from '@vxengine/AnimationEngine/types/track';
import { DragEvent, Interactable } from "@interactjs/types";
import { useRefStore } from '@vxengine/utils';
import interact from 'interactjs';
import { keyframesRef, trackSegmentsRef } from '@vxengine/utils/useRefStore';
import { extractDataFromTrackKey } from '@vxengine/managers/TimelineManager/utils/trackDataProcessing';
import { ALERT_MakePropertyStatic } from '@vxengine/components/ui/DialogAlerts/Alert';
import { useUIManagerAPI } from '@vxengine/managers/UIManager/store';
import Info from '@geist-ui/icons/info';
import PopoverShowTrackSegmentData from '@vxengine/components/ui/Popovers/PopoverShowTrackSegmentData';

export const segmentStartLeft = 22;

const handleOnMove = (e: DragEvent, deltaXRef: { current: number }, trackKey: string, firstKeyframeKey: string, secondKeyframeKey: string, trackSegmentsRef: Map<string, HTMLElement>) => {
    const target = e.target;
    if (!target.dataset.left) {
        target.dataset.left = target.style.left.replace('px', '') || '0';
    }
    if (!target.dataset.width) {
        target.dataset.width = target.style.width.replace('px', '') || '0';
    }

    const { left, width } = target.dataset;
    const preLeft = parseFloat(left);
}

interface TrackSegmentProps { 
    trackKey: string;
    firstKeyframeKey: string;
    secondKeyframeKey: string
}

interface updateUIProps {
    firstKeyframeKey: string;
    secondKeyframeKey: string;
    newLeft?: number;
    newWidth?: number;
}

const updateTrackSegmentUI = (props: updateUIProps) => {
    const {firstKeyframeKey, secondKeyframeKey, newLeft, newWidth} = props
    const trackSegmentKey = `${firstKeyframeKey}.${secondKeyframeKey}`

    const tsElement = trackSegmentsRef.get(trackSegmentKey);
    if(newLeft){
        tsElement.style.left = `${newLeft}px`
        Object.assign(tsElement.dataset, { left: newLeft + segmentStartLeft })
    }
    if(newWidth){
        tsElement.style.width = `${newWidth}px`;
        Object.assign(tsElement.dataset, {width: newWidth})
    }
}

const TrackSegment: React.FC<TrackSegmentProps> = (props) => {
    const { trackKey, firstKeyframeKey, secondKeyframeKey } = props
    const trackSegmentKey = `${firstKeyframeKey}.${secondKeyframeKey}`
    const elementRef = useRef<HTMLElement>();
    const interactableRef = useRef<Interactable>()

    const deltaX = useRef(0);

    useLayoutEffect(() => {
        console.log("Reinitializing Track Segment", trackKey)
        const timelineEditorState = useTimelineEditorAPI.getState();
        const initialScale = timelineEditorState.scale;
        const firstKeyframe = timelineEditorState.tracks[trackKey].keyframes[firstKeyframeKey];
        const secondKeyframe = timelineEditorState.tracks[trackKey].keyframes[secondKeyframeKey];

        // Handle Centralized Ref Store for DOM Mutations
        const trackSegmentsRef = useRefStore.getState().trackSegmentsRef;
        trackSegmentsRef.set(trackSegmentKey, elementRef.current)

        // 
        const startX = parserTimeToPixel(firstKeyframe.time, segmentStartLeft, initialScale)
        const endX = parserTimeToPixel(secondKeyframe.time, segmentStartLeft, initialScale);
        const width = endX - startX;
        const left = startX;

        elementRef.current.style.left = `${left}px`;
        elementRef.current.style.width = `${width}px`

        Object.assign(elementRef.current.dataset, { left, width, firstKeyframeKey, secondKeyframeKey });

        // Handle Interactable
        if (interactableRef.current)
            interactableRef.current.unset();
        interactableRef.current = interact(elementRef.current);

        interactableRef.current.draggable({
            onmove: (e) => handleOnMove(e, deltaX, trackKey, firstKeyframeKey, secondKeyframeKey, trackSegmentsRef)
        })

        return () => {
            if (interactableRef.current)
                interactableRef.current.unset();

            trackSegmentsRef.delete(trackSegmentKey)
        }
    }, [firstKeyframeKey, secondKeyframeKey])

    const isSelectedFromKeyframes = useTimelineEditorAPI(
        state => state.selectedKeyframeKeys[trackKey]?.[firstKeyframeKey] && state.selectedKeyframeKeys[trackKey]?.[secondKeyframeKey]
    );
    const isSelectedFromTrackSegments = useTimelineEditorAPI(
        state =>
            state.selectedTrackSegment?.firstKeyframeKey === firstKeyframeKey &&
            state.selectedTrackSegment?.secondKeyframeKey === secondKeyframeKey
    );
    const setSelectedTrackSegment = useTimelineEditorAPI(state => state.setSelectedTrackSegment);
    const clearSelectedKeyframes = useTimelineEditorAPI(state => state.clearSelectedKeyframes);


    const handleOnClick = useCallback(() => {
        clearSelectedKeyframes();
        selectKeyframe(trackKey, firstKeyframeKey)
        selectKeyframe(trackKey, secondKeyframeKey)
        setSelectedTrackSegment(firstKeyframeKey, secondKeyframeKey, trackKey)
    }, [trackKey, firstKeyframeKey, secondKeyframeKey])

    return (
        <ContextMenu>
            <ContextMenuTrigger>
                <div className='absolute h-full flex '
                    onClick={handleOnClick}
                    ref={elementRef as any}
                >
                    <div
                        key={`line-${firstKeyframeKey}-${secondKeyframeKey}`}
                        className={`bg-white my-auto w-full hover:bg-neutral-300 h-[1.5px] flex ${isSelectedFromKeyframes && "bg-yellow-400"} ${isSelectedFromTrackSegments && "!bg-blue-500"}`}
                    />
                </div>
            </ContextMenuTrigger>
            <TrackSegmentContextMenu trackKey={trackKey} firstKeyframeKey={firstKeyframeKey} secondKeyframeKey={secondKeyframeKey} />
        </ContextMenu>
    )
}

export default TrackSegment


const TrackSegmentContextMenu: React.FC<TrackSegmentProps> = React.memo((props) => {
    const { trackKey } = props;
    const { vxkey, propertyPath } = extractDataFromTrackKey(trackKey);
    const pushDialog = useUIManagerAPI(state => state.pushDialog);

    return (
      <ContextMenuContent>
        <PopoverShowTrackSegmentData {...props}>
            <p className='text-xs font-sans-menlo'>Show Data...</p>
        </PopoverShowTrackSegmentData>
        <ContextMenuItem onClick={() => 
            pushDialog(<ALERT_MakePropertyStatic vxkey={vxkey} propertyPath={propertyPath}/>, "alert")}
        >
            <p className='text-xs font-sans-menlo text-red-600'>Make Property Static </p>
        </ContextMenuItem>
      </ContextMenuContent>
    )
})