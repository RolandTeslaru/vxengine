import { useState } from "react";
import { parserActionsToPositions, parserTimeToTransform } from "../../../utils/deal_data";
import { DragLineData } from "../drag_lines";
import { useTimelineEditorAPI } from "@vxengine/managers/TimelineManager/store";
import { TimelineAction, TimelineRow } from "@vxengine/AnimationEngine/interface/action";

export function useDragLine() {
  const [dragLineData, setDragLineData] = useState<DragLineData>({ isMoving: false, movePositions: [], assistPositions: [] });

  /** 获取辅助线 */
  const defaultGetAssistPosition = (data: {
    assistActionIds?: string[];
    action: TimelineAction;
    row: TimelineRow;
    startLeft: number;
    scale: number;
    scaleWidth: number;
    hideCursor: boolean;
    cursorLeft: number;
  }) => {
    const { assistActionIds, action, row, scale, scaleWidth, startLeft, cursorLeft, hideCursor } = data;
    const { editorData } = useTimelineEditorAPI(state => ({
      editorData: state.editorData
    }))
    const otherActions: TimelineAction[] = [];
    if (assistActionIds) {
      editorData.forEach((rowItem: any) => {
        rowItem.actions.forEach((actionItem) => {
          if (assistActionIds.includes(actionItem.id)) otherActions.push(actionItem);
        });
      });
    } else {
      editorData.forEach((rowItem: any) => {
        if (rowItem.id !== row.id) {
          otherActions.push(...rowItem.actions);
        } else {
          rowItem.actions.forEach((actionItem) => {
            if (actionItem.id !== action.id) otherActions.push(actionItem);
          });
        }
      });
    }

    const positions = parserActionsToPositions(otherActions, startLeft);
    if (!hideCursor) positions.push(cursorLeft);

    return positions;
  };

  /** 获取当前移动标记 */
  const defaultGetMovePosition = (data: { start: number; end: number; dir?: "right" | "left"; startLeft: number; scale: number; scaleWidth: number }) => {
    const { start, end, dir, scale, scaleWidth, startLeft } = data;
    const { left, width } = parserTimeToTransform({ start, end }, startLeft);
    if (!dir) return [left, left + width];
    return dir === "right" ? [left + width] : [left];
  };

  /** 初始化draglines */
  const initDragLine = (data: { movePositions?: number[]; assistPositions?: number[] }) => {
    const { movePositions, assistPositions } = data;

    setDragLineData({
      isMoving: true,
      movePositions: movePositions || [],
      assistPositions: assistPositions || [],
    });
  };

  /** 更新dragline */
  const updateDragLine = (data: { movePositions?: number[]; assistPositions?: number[] }) => {
    const { movePositions, assistPositions } = data;
    setDragLineData((pre) => ({
      ...pre,
      movePositions: movePositions || pre.movePositions,
      assistPositions: assistPositions || pre.assistPositions,
    }));
  };

  /** 释放draglines */
  const disposeDragLine = () => {
    setDragLineData({ isMoving: false, movePositions: [], assistPositions: [] });
  };

  return {
    initDragLine,
    updateDragLine,
    disposeDragLine,
    dragLineData,
    defaultGetAssistPosition,
    defaultGetMovePosition,
  };
}
