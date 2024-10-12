import { useAnimationEngineAPI } from "@vxengine/AnimationEngine";
import { useTimelineEditorAPI } from "../store";
import React from "react";

const TimeRender = () => {
    const cursorTime = useTimelineEditorAPI(state => state.cursorTime)
    const float = (parseInt((cursorTime % 1) * 100 + '') + '').padStart(2, '0');
    const min = (parseInt(cursorTime / 60 + '') + '').padStart(2, '0');
    const second = (parseInt((cursorTime % 60) + '') + '').padStart(2, '0');
    return <>{`${min}:${second}.${float.replace('0.', '')}`}</>;
};

export default TimeRender;