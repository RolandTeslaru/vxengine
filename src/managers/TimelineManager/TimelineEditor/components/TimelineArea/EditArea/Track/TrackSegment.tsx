import React, { useRef, useLayoutEffect } from 'react';
import { useTimelineManagerAPI } from '@vxengine/managers/TimelineManager';
import { parserTimeToPixel } from '@vxengine/managers/TimelineManager/utils/deal_data';
import { Interactable } from "@interactjs/types";
import interact from 'interactjs';
import TrackSegmentContextMenu from './TrackSegmentContextMenu';
import { useTimelineEditorAPI } from '@vxengine/managers/TimelineManager/TimelineEditor/store';
import { useTimelineEditorContext } from '@vxengine/managers/TimelineManager/TimelineEditor/context';
import { useWindowContext } from '@vxengine/utils/useWindowContext';
import { ContextMenu, ContextMenuTrigger } from '@vxengine/ui/foundations';

export const segmentStartLeft = 22;

interface Props {
    trackKey: string;
    firstKeyframeKey: string;
    secondKeyframeKey: string;
    handleOnMove: (e, deltaX, trackKey, firstKeyframeKey, secondKeyframeKey) => void
    handleOnMoveEnd: (e) => void
}

const TrackSegment: React.FC<Props> = (props) => {
    const { trackKey, firstKeyframeKey, secondKeyframeKey, handleOnMove, handleOnMoveEnd } = props
    const trackSegmentKey = `${firstKeyframeKey}.${secondKeyframeKey}`
    const elementRef = useRef<HTMLElement>(null);
    const interactableRef = useRef<Interactable>(null)
    const { trackSegmentsMap } = useTimelineEditorContext()
    const { externalContainer } = useWindowContext();

    const deltaX = useRef(0);

    useLayoutEffect(() => {
        const timelineEditorAPI = useTimelineEditorAPI.getState();
        const timelineManagerAPI = useTimelineManagerAPI.getState();
        const initialScale = timelineEditorAPI.scale;
        const firstKeyframe = timelineManagerAPI.tracks[trackKey].keyframes[firstKeyframeKey];
        const secondKeyframe = timelineManagerAPI.tracks[trackKey].keyframes[secondKeyframeKey];

        // Handle Centralized Ref Store for DOM Mutations
        trackSegmentsMap.set(trackSegmentKey, elementRef.current)

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
        
        interactableRef.current = interact(elementRef.current,
            externalContainer && {
                context: externalContainer.ownerDocument
        });

        interactableRef.current.draggable({
            onmove: (e) => handleOnMove(e, deltaX, trackKey, firstKeyframeKey, secondKeyframeKey),
            onend: (e) => handleOnMoveEnd(e)
        })

        return () => {
            if (interactableRef.current)
                interactableRef.current.unset();

            trackSegmentsMap.delete(trackSegmentKey)
        }
    }, [firstKeyframeKey, secondKeyframeKey])

    const isSelectedFromKeyframes = useTimelineEditorAPI(state => 
        state.selectedKeyframeKeys[trackKey]?.[firstKeyframeKey] && state.selectedKeyframeKeys[trackKey]?.[secondKeyframeKey]
    );

    const isSegmentSelected = useTimelineEditorAPI(state => trackSegmentKey in state.selectedTrackSegments)

    return (
        <ContextMenu>
            <ContextMenuTrigger>
                <div className='absolute h-full flex !cursor-ew-resize '
                    onClick={(e) => handleOnClick(e, trackKey, firstKeyframeKey, secondKeyframeKey)}
                    onContextMenu={(e) => handleOnContextMenu(e, trackKey, firstKeyframeKey, secondKeyframeKey)}
                    ref={elementRef as any}
                >
                    <div
                        key={`line-${firstKeyframeKey}-${secondKeyframeKey}`}
                        className={`bg-white my-auto w-full hover:bg-neutral-300 h-[1.5px] flex ${isSelectedFromKeyframes && "bg-yellow-400"} ${isSegmentSelected && "bg-blue-500!"}`}
                    />
                </div>
            </ContextMenuTrigger>
            <TrackSegmentContextMenu trackKey={trackKey} firstKeyframeKey={firstKeyframeKey} secondKeyframeKey={secondKeyframeKey} />
        </ContextMenu>
    )
}

export default TrackSegment

const handleOnContextMenu = (
    event: React.MouseEvent<HTMLDivElement, MouseEvent>,
    trackKey: string, 
    firstKeyframeKey: string, 
    secondKeyframeKey:string
) => {
    const timelineEditorAPI = useTimelineEditorAPI.getState();
    timelineEditorAPI.clearSelectedKeyframes();
    
    if(event.metaKey || event.ctrlKey){
        timelineEditorAPI.selectTrackSegment(firstKeyframeKey, secondKeyframeKey, trackKey);
    } else {
        timelineEditorAPI.clearSelectedTrackSegments();
        timelineEditorAPI.selectTrackSegment(firstKeyframeKey, secondKeyframeKey, trackKey);
    }
}

const handleOnClick = (
    event: React.MouseEvent<HTMLDivElement, MouseEvent>, 
    trackKey: string, 
    firstKeyframeKey: string, 
    secondKeyframeKey:string
) => {
    const state = useTimelineEditorAPI.getState();
    const segmentKey = `${firstKeyframeKey}.${secondKeyframeKey}`

    state.clearSelectedKeyframes();
    state.selectKeyframe(trackKey, firstKeyframeKey);
    state.selectKeyframe(trackKey, secondKeyframeKey);

    if(event.metaKey || event.ctrlKey){
        if(segmentKey in state.selectedTrackSegments){
            state.unselectTrackSegment(firstKeyframeKey, secondKeyframeKey)
            state.removeSelectedKeyframe(trackKey, firstKeyframeKey)
            state.removeSelectedKeyframe(trackKey, secondKeyframeKey)
            return
        }
        state.selectTrackSegment(firstKeyframeKey, secondKeyframeKey, trackKey);
    }  else {
        state.clearSelectedTrackSegments();
        state.selectTrackSegment(firstKeyframeKey, secondKeyframeKey, trackKey);
    }
    
}
