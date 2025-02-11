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