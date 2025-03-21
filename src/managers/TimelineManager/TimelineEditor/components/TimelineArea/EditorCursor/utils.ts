import { DragEvent, Interactable } from "@interactjs/types";
import { cursorRef } from "@vxengine/utils/useRefStore";
import { useTimelineManagerAPI } from "@vxengine/managers/TimelineManager";
import { parserPixelToTime, parserTimeToPixel, updatePixelByScale } from "@vxengine/managers/TimelineManager/utils/deal_data";
import { useTimelineEditorAPI } from "@vxengine/managers/TimelineManager/TimelineEditor/store";
import { selectKeyframeSTATIC as selectKeyframe } from "@vxengine/managers/TimelineManager/TimelineEditor/store";
import animationEngineInstance from "@vxengine/singleton";

export const cursorStartLeft = 20;

export const cursorBoundsLeft = cursorStartLeft;

export const handleOnMove = (e: DragEvent, deltaXRef: { current: number }) => {
  const target = e.target;
  if (!target.dataset.left)
    target.dataset.left = target.style.left.replace('px', '') || '0'

  const prevLeft = parseFloat(target.dataset.left)

  deltaXRef.current += e.dx
  let newLeft = prevLeft + e.dx;

  // Handle Bounds
  if (newLeft < cursorBoundsLeft)
    newLeft = cursorBoundsLeft

  handleCursorDrag(newLeft);
}

export const handleCursorDrag = (newLeft: number, mutateUI = true) => {
  const scale = useTimelineEditorAPI.getState().scale

  // Handle Store Update
  const newTime = parserPixelToTime(newLeft, cursorStartLeft, true, scale)
  animationEngineInstance.setCurrentTime(newTime)

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
  const timelineManagerAPI = useTimelineManagerAPI.getState();

  const currentTime = animationEngineInstance.currentTime

  Object.entries(timelineManagerAPI.tracks).forEach(([trackKey, track]) => {
    Object.entries(track.keyframes).forEach(([keyframeKey, keyframe]) => {
      if(keyframe.time >= currentTime){
        selectKeyframe(trackKey, keyframeKey)
      }
    })
  })

  event.preventDefault();
}
export const selectAllKeyframesBeforeCursor = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
  const state = useTimelineManagerAPI.getState();
  
  const currentTime = animationEngineInstance.currentTime

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
  const state = useTimelineManagerAPI.getState();

  Object.entries(state.tracks).forEach(([trackKey, track]) => {
    Object.entries(track.keyframes).forEach(([keyframeKey, keyframe]) => {
        selectKeyframe(trackKey, keyframeKey)
    })
  })

  event.preventDefault();
}
export const selectKeyframesOnCursor = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
  const state = useTimelineManagerAPI.getState();

  const currentTime = animationEngineInstance.currentTime

  Object.entries(state.tracks).forEach(([trackKey, track]) => {
    Object.entries(track.keyframes).forEach(([keyframeKey, keyframe]) => {
      if(keyframe.time === currentTime){
        selectKeyframe(trackKey, keyframeKey)
      }
    })
  })
} 



