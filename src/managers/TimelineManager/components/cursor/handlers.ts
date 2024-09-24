import { useRefStore } from "@vxengine/utils/useRefStore"
import { useTimelineEditorAPI } from "../../store"
import { parserPixelToTime, parserTimeToPixel } from "../../utils/deal_data"
import { handleSetCursor } from "../../utils/handleSetCursor"

export const cursorStartLeft = 20
export const handleCursorOnDrag = ({ left }, scroll = 0) => {
  const scrollLeft = useTimelineEditorAPI.getState().scrollLeft

  const cursorThumbRef = useRefStore.getState().cursorThumbRef
  const cursorLineRef = useRefStore.getState().cursorLineRef
  const draggingLeftRef = useRefStore.getState().draggingLeftRef


  if (!scroll || scrollLeft === 0) {
    // 拖拽时，如果当前left < left min，将数值设置为 left min
    if (left < cursorStartLeft - scrollLeft) draggingLeftRef.current = cursorStartLeft - scrollLeft;
    else draggingLeftRef.current = left;
  } else {
    // 自动滚动时，如果当前left < left min，将数值设置为 left min
    if (draggingLeftRef.current < cursorStartLeft - scrollLeft - scroll) {
      draggingLeftRef.current = cursorStartLeft - scrollLeft - scroll;
    }
  }
  cursorThumbRef.current.updateLeft(draggingLeftRef.current);
  cursorLineRef.current.updateLeft(draggingLeftRef.current);
  const time = parserPixelToTime(draggingLeftRef.current + scrollLeft, cursorStartLeft);
  handleSetCursor({ time })
  return false;
}

export const handleCursorOnDragStart = () => {
  const scrollLeft = useTimelineEditorAPI.getState().scrollLeft
  const cursorTime = useTimelineEditorAPI.getState().cursorTime

  const cursorThumbRef = useRefStore.getState().cursorThumbRef
  const cursorLineRef = useRefStore.getState().cursorLineRef
  const draggingLeftRef = useRefStore.getState().draggingLeftRef

  draggingLeftRef.current = parserTimeToPixel(cursorTime, cursorStartLeft) - scrollLeft;
  cursorThumbRef.current.updateLeft(draggingLeftRef.current);
  cursorLineRef.current.updateLeft(draggingLeftRef.current);
}

export const handleCursorOnDragEng = () => {
  const scrollLeft = useTimelineEditorAPI.getState().scrollLeft

  const draggingLeftRef = useRefStore.getState().draggingLeftRef

  const time = parserPixelToTime(draggingLeftRef.current + scrollLeft, cursorStartLeft);
  handleSetCursor({ time })
  draggingLeftRef.current = undefined;
}
