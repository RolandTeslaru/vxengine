import { useTimelineManagerAPI } from '@vxengine/managers/TimelineManager';
import { parserPixelToTime, parserTimeToPixel } from '@vxengine/managers/TimelineManager/utils/deal_data';
import React, { memo, useRef, useLayoutEffect, useEffect } from 'react'
import interact from "interactjs";
import { Interactable } from "@interactjs/types";
import { useWindowContext } from '@vxengine/core/components/VXEngineWindow';
import { cursorRef, useRefStore } from '@vxengine/utils/useRefStore';
import { cursorStartLeft, handleCursorMutation, handleOnMove, selectAllKeyframes, selectAllKeyframesAfterCursor, selectAllKeyframesBeforeCursor, selectKeyframesOnCursor } from './utils';
import { useAnimationEngineEvent } from '@vxengine/AnimationEngine';
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuSub, ContextMenuSubContent, ContextMenuSubTrigger, ContextMenuTrigger } from '@vxengine/components/shadcn/contextMenu';
import { ArrowRight, Maximize2, ArrowLeft } from 'lucide-react';
import { useTimelineEditorAPI } from '@vxengine/managers/TimelineManager/TimelineEditor/store';
import animationEngineInstance from '@vxengine/singleton';

const EditorCursor = () => {
  const elementRef = useRef<HTMLDivElement>(null)
  const interactableRef = useRef<Interactable>()
  const { externalContainer } = useWindowContext();
  const timelineAreaRef = useRefStore(state => state.timelineAreaRef)

  const deltaX = useRef(0)

  useLayoutEffect(() => {
    const initialScale = useTimelineEditorAPI.getState().scale;

    const initialCursorTime = animationEngineInstance.getCurrentTime();

    cursorRef.current = elementRef.current;

    const left = parserTimeToPixel(initialCursorTime, cursorStartLeft, initialScale);
    elementRef.current.style.left = `${left}px`
    Object.assign(elementRef.current.dataset, {
      left
    })

    if (interactableRef.current)
      interactableRef.current.unset();

    interactableRef.current = interact(elementRef.current,
      externalContainer && {
        context: externalContainer.ownerDocument
      })

    interactableRef.current.draggable({
      onmove: (e) => handleOnMove(e, deltaX),
    })

    return () => {
      if (interactableRef.current)
        interactableRef.current.unset()

      delete cursorRef.current
    }

  }, [externalContainer])

  useEffect(() => {
    const updateHeight = () => {
      if (timelineAreaRef.current && elementRef.current) {
        const timelineHeight = (timelineAreaRef.current as any as HTMLDivElement).getBoundingClientRect().height;
        elementRef.current.style.height = `${timelineHeight}px`;
      }
    };

    // Set the initial height
    updateHeight();


    // Add a resize observer to the timeline area
    const observer = new ResizeObserver(() => {
      updateHeight(); // Update height on size changes
    });

    if (timelineAreaRef.current) {
      observer.observe(timelineAreaRef.current);
    }

    // Clean up the observer when the component unmounts
    return () => {
      if (timelineAreaRef.current) {
        observer.unobserve(timelineAreaRef.current);
      }
    };
  }, [])

  useAnimationEngineEvent("timeUpdatedByEngine", ({ time }) => {
    const left = parserTimeToPixel(time, cursorStartLeft);
    handleCursorMutation(left)
  })

  return (
    <div className='sticky top-4  z-[999] h-0'>
      <div ref={elementRef} className='absolute w-1 left-0 h-20'>
        <ContextMenu>
          <ContextMenuTrigger>
            {/* Thumb */}
            <svg
              className=" z-10 left-1/2 margin-auto "
              style={{ transform: "translate(-50%, 0) " }}
              width="8" height="12" viewBox="0 0 8 12" fill="none"
            >
              <path
                d="M0 1C0 0.447715 0.447715 0 1 0H7C7.55228 0 8 0.447715 8 1V9.38197C8 9.76074 7.786 10.107 7.44721 10.2764L4.44721 11.7764C4.16569 11.9172 3.83431 11.9172 3.55279 11.7764L0.552786 10.2764C0.214002 10.107 0 9.76074 0 9.38197V1Z"
                fill="#5297FF"
              />
            </svg>
            {/* Line */}
            <div className={"w-[1px] relative h-full box-border top-0 border-x border-blue-500 z-[1]"}
              style={{
                transform: "translateX(-25%) scaleX(0.5)",
              }}
            >
            </div>
          </ContextMenuTrigger>
          <CursorContextMenu/>
        </ContextMenu>
      </div>
    </div>
  )
}

export default EditorCursor


const CursorContextMenu = () => {
  return (
    <ContextMenuContent>
      <ContextMenuSub>
        <ContextMenuSubTrigger>
          <p className='text-xs font-sans-menlo'>Select...</p>
        </ContextMenuSubTrigger>
        <ContextMenuSubContent>
          <ContextMenuItem onClick={selectAllKeyframesAfterCursor}>
            <ArrowRight size={15} />
            <p className='text-xs font-sans-menlo'>Keyframes After</p>
          </ContextMenuItem>
          <ContextMenuItem onClick={selectAllKeyframes}>
            <Maximize2 size={15} className='rotate-45' />
            <p className='text-xs font-sans-menlo'>All Keyframes</p>
          </ContextMenuItem>
          <ContextMenuItem onClick={selectAllKeyframesBeforeCursor}>
            <ArrowLeft size={15} />
            <p className='text-xs font-sans-menlo'>Keyframes Before</p>
          </ContextMenuItem>
          <ContextMenuItem onClick={selectKeyframesOnCursor}>
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7.5 2C7.77614 2 8 2.22386 8 2.5L8 11.2929L11.1464 8.14645C11.3417 7.95118 11.6583 7.95118 11.8536 8.14645C12.0488 8.34171 12.0488 8.65829 11.8536 8.85355L7.85355 12.8536C7.75979 12.9473 7.63261 13 7.5 13C7.36739 13 7.24021 12.9473 7.14645 12.8536L3.14645 8.85355C2.95118 8.65829 2.95118 8.34171 3.14645 8.14645C3.34171 7.95118 3.65829 7.95118 3.85355 8.14645L7 11.2929L7 2.5C7 2.22386 7.22386 2 7.5 2Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
            <p className='text-xs font-sans-menlo'>All on Cursor</p>
          </ContextMenuItem>
        </ContextMenuSubContent>
      </ContextMenuSub>
    </ContextMenuContent>
  )
}
