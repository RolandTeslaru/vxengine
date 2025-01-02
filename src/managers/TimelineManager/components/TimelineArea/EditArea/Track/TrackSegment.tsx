import React, { useCallback, useRef, useLayoutEffect } from 'react';
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from '@vxengine/components/shadcn/contextMenu';
import { useTimelineEditorAPI } from '@vxengine/managers/TimelineManager';
import { parserPixelToTime, parserTimeToPixel } from '@vxengine/managers/TimelineManager/utils/deal_data';
import { selectKeyframeSTATIC as selectKeyframe } from '@vxengine/managers/TimelineManager/store';
import { DragEvent, Interactable } from "@interactjs/types";
import { useRefStore } from '@vxengine/utils';
import interact from 'interactjs';
import { extractDataFromTrackKey } from '@vxengine/managers/TimelineManager/utils/trackDataProcessing';
import { ALERT_MakePropertyStatic } from '@vxengine/components/ui/DialogAlerts/Alert';
import { useUIManagerAPI } from '@vxengine/managers/UIManager/store';
import PopoverShowTrackSegmentData from '@vxengine/components/ui/Popovers/PopoverShowTrackSegmentData';
import { hydrateKeyframeKeysOrder } from '../Keyframe/utils';
import { handleTrackDrag } from './utils';
import { produce } from 'immer';
import { TimelineEditorStoreProps } from '@vxengine/managers/TimelineManager/types/store';
import { keyframesRef } from '@vxengine/utils/useRefStore';
import { useWindowContext } from '@vxengine/core/components/VXEngineWindow';

export const segmentStartLeft = 22;


interface TrackSegmentProps {
    trackKey: string;
    firstKeyframeKey: string;
    secondKeyframeKey: string
}

const TrackSegment: React.FC<TrackSegmentProps> = (props) => {
    const { trackKey, firstKeyframeKey, secondKeyframeKey } = props
    const trackSegmentKey = `${firstKeyframeKey}.${secondKeyframeKey}`
    const elementRef = useRef<HTMLElement>();
    const interactableRef = useRef<Interactable>()

    const { externalContainer } = useWindowContext();

    const deltaX = useRef(0);

    useLayoutEffect(() => {
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
                pushDialog(<ALERT_MakePropertyStatic vxkey={vxkey} propertyPath={propertyPath} />, "alert")}
            >
                <p className='text-xs font-sans-menlo text-red-600'>Make Property Static </p>
            </ContextMenuItem>
        </ContextMenuContent>
    )
})

const handleOnMove = (
    e: DragEvent,
    deltaXRef: { current: number },
    trackKey: string,
    firstKeyframeKey: string,
    secondKeyframeKey: string,
) => {
    const target = e.target;
    if (!target.dataset.left) {
        target.dataset.left = target.style.left.replace('px', '') || '0';
    }
    if (!target.dataset.width) {
        target.dataset.width = target.style.width.replace('px', '') || '0';
    }

    const prevLeft = parseFloat(target.dataset.left);
    deltaXRef.current += e.dx;

    let newLeft = prevLeft + e.dx;

    handleTrackDrag(newLeft, prevLeft, trackKey, firstKeyframeKey, secondKeyframeKey)
}

const handleOnMoveEnd = (e: DragEvent) => {
    const { selectedKeyframesFlatMap } = useTimelineEditorAPI.getState();

    useTimelineEditorAPI.setState(
        produce((state: TimelineEditorStoreProps) => {
            selectedKeyframesFlatMap.forEach(selectKeyframeFlat => {
                const { trackKey, keyframeKey } = selectKeyframeFlat;
                const kfElement = keyframesRef.get(keyframeKey);
                const hydratedKfTime = parseFloat(kfElement.dataset.time);

                if (hydratedKfTime !== null && hydratedKfTime !== undefined && !isNaN(hydratedKfTime)) {
                    state.tracks[trackKey].keyframes[keyframeKey].time = hydratedKfTime;
                }
            })
        })
    )

    hydrateKeyframeKeysOrder();
}