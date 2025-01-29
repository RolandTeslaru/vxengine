import { TimelineAction, TimelineRow } from "@vxengine/AnimationEngine/interface/action";
import { ADD_SCALE_COUNT } from "@vxengine/AnimationEngine/interface/const";
import { useTimelineManagerAPI } from "../store";
import { ONE_SECOND_UNIT_WIDTH } from "@vxengine/managers/constants";
import { truncateToDecimals } from "../store";
import { useTimelineEditorAPI } from "../TimelineEditor/store";

export function parserTimeToPixel(
  data: number,
  startLeft: number,
  scale?: number
) {
  // Data means time
  if (!scale) {
    scale = useTimelineEditorAPI.getState().scale
  }
  return startLeft + (data / scale) * ONE_SECOND_UNIT_WIDTH;
}


export function parserPixelToTime(
  data: number,
  startLeft: number,
  truncate?: boolean,
  scale?: number
) {
  // Data means pixels ( left value ) 
  if(!scale){
    scale = useTimelineEditorAPI.getState().scale
  }
  const value = ((data - startLeft) / ONE_SECOND_UNIT_WIDTH) * scale;

  if (truncate)
    return truncateToDecimals(value)

  return value;
}

export function updatePixelByScale(
  prevLeft: number,
  oldScale: number,
  newScale: number,
  startLeft: number
): number {
  const time = ((prevLeft - startLeft) / ONE_SECOND_UNIT_WIDTH) * oldScale;
  
  return startLeft + (time / newScale) * ONE_SECOND_UNIT_WIDTH;
}

/** 位置 + 宽度 转 start + end */
export function parserTransformToTime(
  data: {
    left: number;
    width: number;
    startLeft: number
  },
) {
  const { left, width, startLeft } = data;
  const start = parserPixelToTime(left, startLeft);
  const end = parserPixelToTime(left + width, startLeft);
  return {
    start,
    end,
  };
}

/** start + end 转 位置 + 宽度 */
export function parserTimeToTransform(
  data: {
    start: number;
    end: number;
  },
  startLeft
) {
  const { start, end } = data;
  const left = parserTimeToPixel(start, startLeft);
  const width = parserTimeToPixel(end, startLeft) - left;
  return {
    left,
    width,
  };
}

/** 根据数据获取刻度个数 */
export function getScaleCountByRows(data: TimelineRow[], param: { scale: number }) {
  let max = 0;
  data.forEach((row) => {
    row.actions.forEach((action) => {
      max = Math.max(max, action.end);
    });
  });
  const count = Math.ceil(max / param.scale);
  return count + ADD_SCALE_COUNT;
}

/** 根据时间获取目前刻度数 */
export function getScaleCountByPixel(
  data: number,
  param: {
    startLeft: number;
    scaleWidth: number;
    scaleCount: number;
  }
) {
  const { startLeft, scaleWidth } = param;
  const count = Math.ceil((data - startLeft) / scaleWidth);
  return Math.max(count + ADD_SCALE_COUNT, param.scaleCount);
}

/** 获取动作全部时间的位置集合 */
export function parserActionsToPositions(
  actions: TimelineAction[],
  startLeft: number
) {
  const positions: number[] = [];
  actions.forEach((item) => {
    positions.push(parserTimeToPixel(item.start, startLeft));
    positions.push(parserTimeToPixel(item.end, startLeft));
  });
  return positions;
}
