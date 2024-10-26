import { useRefStore } from "@vxengine/utils/useRefStore"
import { useTimelineEditorAPI } from "../store"
import { parserPixelToTime, parserTimeToPixel } from "./deal_data"
import { handleSetCursor } from "./handleSetCursor"

export const cursorStartLeft = 20
export const handleCursorOnDrag = ({ left }, scroll = 0) => {
  const cursorThumbRef = useRefStore.getState().cursorThumbRef
  const cursorLineRef = useRefStore.getState().cursorLineRef
  const draggingLeftRef = useRefStore.getState().draggingLeftRef

  const scrollLeft = useRefStore.getState().scrollLeftRef.current

  if (!scroll || scrollLeft === 0) {
    // When dragging, if the current left < left min, set the value to left min
    if (left < cursorStartLeft - scrollLeft) 
      draggingLeftRef.current = cursorStartLeft - scrollLeft;
    else draggingLeftRef.current = left;
  } else {
    // During automatic scrolling, if the current left < left min, set the value to left min
    if (draggingLeftRef.current < cursorStartLeft - scrollLeft - scroll) {
      draggingLeftRef.current = cursorStartLeft - scrollLeft - scroll;
    }
  }
  cursorThumbRef.current.updateLeft(draggingLeftRef.current);
  cursorLineRef.current.updateLeft(draggingLeftRef.current);
  const time = parserPixelToTime(draggingLeftRef.current, cursorStartLeft);
  handleSetCursor({ time })
  return false;
}

export const handleCursorOnDragStart = () => {
  const cursorTime = useTimelineEditorAPI.getState().cursorTime

  const cursorThumbRef = useRefStore.getState().cursorThumbRef
  const cursorLineRef = useRefStore.getState().cursorLineRef
  const draggingLeftRef = useRefStore.getState().draggingLeftRef

  draggingLeftRef.current = parserTimeToPixel(cursorTime, cursorStartLeft);
  cursorThumbRef.current.updateLeft(draggingLeftRef.current);
  cursorLineRef.current.updateLeft(draggingLeftRef.current);
}

export const handleCursorOnDragEng = () => {
  const draggingLeftRef = useRefStore.getState().draggingLeftRef

  const time = parserPixelToTime(draggingLeftRef.current, cursorStartLeft);
  handleSetCursor({ time })
  draggingLeftRef.current = undefined;
}
