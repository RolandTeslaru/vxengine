import { IAnimationEngine } from "vxengine/AnimationEngine/types/engine";
import { parserPixelToTime, parserTimeToPixel } from "./deal_data";
import { DEFAULT_SCALE_WIDTH } from "vxengine/AnimationEngine/interface/const";
import { useTimelineEditorStore } from "../store";

export const handleSetCursor = (param: {
    left?: number;
    time?: number;
    updateTime?: boolean;
    animationEngine: IAnimationEngine;
    scale: number; // Add scale as a parameter
}) => {
    let { left, time, updateTime = true, animationEngine, scale } = param;
    if (typeof left === 'undefined' && typeof time === 'undefined') return;

    console.log("Handling setting cursor ")
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
    result && useTimelineEditorStore.setState({ cursorTime: time });
    return result;
};