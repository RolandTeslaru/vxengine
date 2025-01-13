import { DragEvent, Interactable } from "@interactjs/types";
import { cursorRef } from "@vxengine/utils/useRefStore";
import { useTimelineEditorAPI } from "@vxengine/managers/TimelineManager";
import { parserPixelToTime, parserTimeToPixel, updatePixelByScale } from "@vxengine/managers/TimelineManager/utils/deal_data";
import { getVXEngineState } from "@vxengine/engine";


export const cursorStartLeft = 20;

const boundsLeft = cursorStartLeft;

export const handleOnMove = (e: DragEvent, deltaXRef: { current: number }) => {
  const target = e.target;
  if (!target.dataset.left)
    target.dataset.left = target.style.left.replace('px', '') || '0'

  const prevLeft = parseFloat(target.dataset.left)

  deltaXRef.current += e.dx
  let newLeft = prevLeft + e.dx;

  // Handle Bounds
  if (newLeft < boundsLeft)
    newLeft = boundsLeft

  handleCursorDrag(newLeft);
}

export const handleCursorDrag = (newLeft: number, mutateUI = true) => {
  const timelineEditorState = useTimelineEditorAPI.getState();
  const { scale } = timelineEditorState;

  // Handle Store Update
  const newTime = parserPixelToTime(newLeft, cursorStartLeft, true, scale)
  const animationEngine = getVXEngineState().getState().animationEngine;
  animationEngine.setCurrentTime(newTime)

  // Handle Mutation
  if(mutateUI)
    handleCursorMutation(newLeft)
}


export const handleCursorMutation = (newLeft: number) => {
  const cursorElement = cursorRef.current as HTMLDivElement
  cursorElement.style.left = `${newLeft}px`
  Object.assign(cursorElement.dataset, { left: newLeft });
}

export const handleCursorMutationByScale = (newScale: number, prevScale: number) => {
  const cursorElement = cursorRef.current as HTMLDivElement
  const oldLeft = parseFloat(cursorElement.dataset.left)

  const newLeft = updatePixelByScale(oldLeft, prevScale, newScale, cursorStartLeft);
  cursorElement.style.left = `${newLeft}px`
  Object.assign(cursorElement.dataset, { left: newLeft });
} 


export const selectAllKeyframesAfterCursor = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
  const state = useTimelineEditorAPI.getState();
  const selectKeyframe = state.selectKeyframe;

  const animationEngine = getVXEngineState().getState().animationEngine
  const currentTime = animationEngine.getCurrentTime();

  Object.entries(state.tracks).forEach(([trackKey, track]) => {
    Object.entries(track.keyframes).forEach(([keyframeKey, keyframe]) => {
      if(keyframe.time >= currentTime){
        selectKeyframe(trackKey, keyframeKey)
      }
    })
  })

  event.preventDefault();
}
export const selectAllKeyframesBeforeCursor = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
  const state = useTimelineEditorAPI.getState();
  const selectKeyframe = state.selectKeyframe;
  
  const animationEngine = getVXEngineState().getState().animationEngine
  const currentTime = animationEngine.getCurrentTime();

  Object.entries(state.tracks).forEach(([trackKey, track]) => {
    Object.entries(track.keyframes).forEach(([keyframeKey, keyframe]) => {
      if(keyframe.time <= currentTime){
        selectKeyframe(trackKey, keyframeKey)
      }
    })
  })

  event.preventDefault()
}
export const selectAllKeyframes = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
  const state = useTimelineEditorAPI.getState();
  const selectKeyframe = state.selectKeyframe;

  Object.entries(state.tracks).forEach(([trackKey, track]) => {
    Object.entries(track.keyframes).forEach(([keyframeKey, keyframe]) => {
        selectKeyframe(trackKey, keyframeKey)
    })
  })

  event.preventDefault();
}
export const selectKeyframesOnCursor = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
  const state = useTimelineEditorAPI.getState();
  const selectKeyframe = state.selectKeyframe;

  const animationEngine = getVXEngineState().getState().animationEngine
  const currentTime = animationEngine.getCurrentTime();

  Object.entries(state.tracks).forEach(([trackKey, track]) => {
    Object.entries(track.keyframes).forEach(([keyframeKey, keyframe]) => {
      if(keyframe.time === currentTime){
        selectKeyframe(trackKey, keyframeKey)
      }
    })
  })
} 



