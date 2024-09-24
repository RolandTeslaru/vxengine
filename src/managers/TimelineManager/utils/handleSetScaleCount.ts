import { MIN_SCALE_COUNT } from "@vxengine/AnimationEngine/interface/const";

 /** Dynamically set scale count */
export const handleSetScaleCount = (value: number,  param: { setScaleCount: (count: number) => void } ) => {
    const maxScaleCount = Infinity;
    const minScaleCount = 1;
    const data = Math.min(maxScaleCount, Math.max(MIN_SCALE_COUNT, value));
    param.setScaleCount(data);
  };