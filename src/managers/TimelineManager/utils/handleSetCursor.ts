import { IAnimationEngine } from "vxengine/AnimationEngine/types/engine";
import { parserPixelToTime, parserTimeToPixel } from "./deal_data";
import { DEFAULT_SCALE_WIDTH } from "vxengine/AnimationEngine/interface/const";

export const handleSetCursor = (param: {
    left?: number;
    time?: number;
    updateTime?: boolean;
    animationEngine: IAnimationEngine;
    scale: number; // Add scale as a parameter
    setCursorTime: (time: number) => void; // Pass setCursorTime function
}) => {
    let { left, time, updateTime = true, animationEngine, scale, setCursorTime } = param;
    if (typeof left === 'undefined' && typeof time === 'undefined') return;

    const startLeft = 0;
    const scaleWidth = DEFAULT_SCALE_WIDTH;

    if (typeof time === 'undefined') {
        if (typeof left === 'undefined') left = parserTimeToPixel(time, { startLeft, scale, scaleWidth });
        time = parserPixelToTime(left, { startLeft, scale, scaleWidth });
    }

    let result = true;
    if (updateTime) {
        result = animationEngine.setCurrentTime(time);
        // animationEngine.reRender();
    }
    result && setCursorTime(time); // Use passed setCursorTime function
    return result;
};