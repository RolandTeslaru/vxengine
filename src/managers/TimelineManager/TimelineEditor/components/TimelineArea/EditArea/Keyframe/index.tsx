import { ContextMenu, ContextMenuTrigger } from '@radix-ui/react-context-menu';
import { useTimelineManagerAPI } from '@vxengine/managers/TimelineManager';
import { parserTimeToPixel } from '@vxengine/managers/TimelineManager/utils/deal_data';
import React, { memo, useRef, useLayoutEffect } from 'react'
import KeyframeContextMenu from './KeyframeContextMenu';
import { DEFAULT_ROW_HEIGHT, DEFAULT_SCALE, DEFAULT_SCALE_WIDTH } from '@vxengine/AnimationEngine/interface/const';
import interact from "interactjs";
import { DragEvent, Interactable } from "@interactjs/types";
import { useRefStore } from '@vxengine/utils';
import { handleKeyframeDrag, hydrateKeyframeKeysOrder } from './utils';
import { produce } from 'immer';
import { keyframesRef } from '@vxengine/utils/useRefStore';
import { useWindowContext } from '@vxengine/core/components/VXEngineWindow';
import { selectKeyframeSTATIC as selectKeyframe, useTimelineEditorAPI } from '@vxengine/managers/TimelineManager/TimelineEditor/store';
import { TimelineManagerAPIProps } from '@vxengine/managers/TimelineManager/types/store';

export type EditKeyframeProps = {
    keyframeKey: string;
    nextKeyframeKey: string;
    prevKeyframeKey: string;
    trackKey: string;
    snap: boolean
    isSelected: boolean
};

export const keyframeStartLeft = 15;

const Keyframe: React.FC<EditKeyframeProps> = memo(({
    keyframeKey,
    nextKeyframeKey,
    prevKeyframeKey,
    trackKey,
    snap,
    isSelected
}) => {
    const elementRef = useRef<SVGSVGElement>(null);
    const interactableRef = useRef<Interactable>(null)
    const { externalContainer } = useWindowContext();

    const deltaX = useRef(0)

    useLayoutEffect(() => {
        const timelineEditorAPI = useTimelineEditorAPI.getState();
        const timelineManagerAPI = useTimelineManagerAPI.getState();
        const initialScale = timelineEditorAPI.scale
        const initialKeyframeTime = timelineManagerAPI.tracks[trackKey]?.keyframes[keyframeKey].time

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

        interactableRef.current = interact(elementRef.current,
            externalContainer && {
                context: externalContainer.ownerDocument
        })

        interactableRef.current.draggable({
            onmove: (e) => handleOnMove(e, deltaX, trackKey, keyframeKey),
            onend: (e) => handleOnMoveEnd(e)
        })

        //  Cleanup
        return () => {
            if (interactableRef.current)
                interactableRef.current.unset();

            keyframesRef.delete(keyframeKey);
        };
    }, [externalContainer])

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
                                    ${isSelected && "fill-yellow-300!"}`
                    }
                    style={{ height: DEFAULT_ROW_HEIGHT - 1 }}
                    onClick={(e) => handleOnClick(e, trackKey, keyframeKey)}
                    onContextMenu={(e) => handleOnContextMenu(e, trackKey, keyframeKey)}
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


const handleOnClick = (
    event: React.MouseEvent, 
    trackKey: string, 
    keyframeKey: string
) => {
    event.preventDefault();

    const timelineEditorAPI = useTimelineEditorAPI.getState();

    const {
        selectedKeyframeKeys,
        removeSelectedKeyframe,
        isKeyframeSelected,
        clearSelectedKeyframes,
        setLastKeyframeSelectedIndex,
        lastKeyframeSelectedIndex,
        clearSelectedTrackSegments,
    } = timelineEditorAPI;

    const getAllKeyframes = useTimelineManagerAPI.getState().getAllKeyframes

    clearSelectedTrackSegments();
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
        for (let i = start; i <= end; i++)
            selectKeyframe(trackKey, selectedKeyframesFlatMap[i]);
    }
    // Normal Click
    else {
        clearSelectedKeyframes();
        selectKeyframe(trackKey, keyframeKey);
    }

    setLastKeyframeSelectedIndex(keyframeIndex)
}

const handleOnContextMenu = (
    event: React.MouseEvent<SVGSVGElement, MouseEvent>, 
    trackKey: string, 
    keyframeKey:string
) => {
    const timelineEditorAPI = useTimelineEditorAPI.getState();
    timelineEditorAPI.clearSelectedTrackSegments();

    if(event.metaKey || event.ctrlKey){
        timelineEditorAPI.selectKeyframe(trackKey, keyframeKey);
    } else {
        timelineEditorAPI.clearSelectedKeyframes();
        timelineEditorAPI.selectKeyframe(trackKey, keyframeKey)
    }
}

const rowHeight = DEFAULT_ROW_HEIGHT

// const boundsLeft = keyframeStartLeft;

// const handleBoundryCheck = (mostOnLeft, mostOnRight) => {
//     const currentTimelineLength = useTimelineManagerAPI.getState().currentTimelineLength;
//     const scale = useTimelineEditorAPI.getState().scale;  
//     const boundsRight = currentTimelineLength * DEFAULT_SCALE_WIDTH / scale + startLeft

//     if (mostOnLeft < boundsLeft)
//         return boundsLeft;
//     else if (boundsRight < mostOnRight)
//         return boundsRight;
// }

const handleOnMove = (e: DragEvent, deltaXRef: { current: number }, trackKey: string, keyframeKey: string) => {
    const target = e.target;
    if (!target.dataset.left) {
        target.dataset.left = target.style.left.replace('px', '') || '0';
    }
    const { left } = target.dataset;
    const prevLeft = parseFloat(left);

    deltaXRef.current += e.dx
    let newLeft = prevLeft + e.dx;

    // Handle TimelineEditor Data and UI Mutation
    handleKeyframeDrag(newLeft, prevLeft, trackKey, keyframeKey)
}

const handleOnMoveEnd = (e: DragEvent) => {
    const { selectedKeyframesFlatMap } = useTimelineEditorAPI.getState();

    useTimelineManagerAPI.setState(
        produce((state: TimelineManagerAPIProps) => {
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