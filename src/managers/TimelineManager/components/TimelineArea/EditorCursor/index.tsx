import { useTimelineEditorAPI } from '@vxengine/managers/TimelineManager';
import { parserPixelToTime, parserTimeToPixel } from '@vxengine/managers/TimelineManager/utils/deal_data';
import React, { memo, useRef, useLayoutEffect } from 'react'
import interact from "interactjs";
import { DragEvent, Interactable } from "@interactjs/types";
import { useWindowContext } from '@vxengine/core/components/VXEngineWindow';
import { prefix } from '@vxengine/managers/TimelineManager/utils/deal_class_prefix';
import { cursorRef } from '@vxengine/utils/useRefStore';
import { cursorStartLeft, handleCursorMutation, handleOnMove } from './utils';
import { useVXEngine } from '@vxengine/engine';
import { useAnimationEngineEvent } from '@vxengine/AnimationEngine';

const EditorCursor = () => {
  const elementRef = useRef<HTMLDivElement>(null)
  const interactableRef = useRef<Interactable>()
  const { externalContainer } = useWindowContext();

  const deltaX = useRef(0)

  const animationEngine = useVXEngine(state => state.animationEngine)

  useLayoutEffect(() => {
    const timelineEditorState = useTimelineEditorAPI.getState();
    const initialScale = timelineEditorState.scale

    const initialCursorTime = animationEngine.getCurrentTime();

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

  useAnimationEngineEvent("timeUpdatedByEngine", ({time}) => {
    const left = parserTimeToPixel(time, cursorStartLeft);
    handleCursorMutation(left)
  })

  return (
      <div ref={elementRef} className='absolute top-4 z-[999] flex flex-col'>
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
        <div className={"w-[1px] relative h-[500px] box-border top-0 border-x border-blue-500 z-[1]"}
          style={{
            transform: "translateX(-25%) scaleX(0.5)",
          }}
        >
        </div>
      </div>
  )
}

export default EditorCursor