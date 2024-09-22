import { IAnimationEngine } from "vxengine/AnimationEngine/types/engine";
import { parserPixelToTime, parserTimeToPixel } from "./deal_data";
import { DEFAULT_SCALE_WIDTH } from "vxengine/AnimationEngine/interface/const";
import { useTimelineEditorAPI } from "../store";
import { useRefStore } from "vxengine/utils/useRefStore";

export const handleSetCursor = (param: {
    left?: number;
    time?: number;
    rerender?: boolean;
} = { rerender: true }) => {
    let { left, time, rerender = true } = param;
    const cursorThumbRef = useRefStore.getState().cursorThumbRef
    const cursorLineRef = useRefStore.getState().cursorLineRef

    // console.log("Handling set cursor with params with rerender ", rerender)

    const animationEngine = useTimelineEditorAPI.getState().animationEngineRef.current
    if(!animationEngine)
        return
    
    if (typeof left === 'undefined' && typeof time === 'undefined') return;


    const startLeft = 20;

    if (typeof time === 'undefined') {
        if (typeof left === 'undefined') left = parserTimeToPixel(time, startLeft);
        time = parserPixelToTime(left, startLeft);
    }

    useTimelineEditorAPI.setState({ cursorTime: time });
    cursorThumbRef.current.updateLeft(parserTimeToPixel(time, startLeft) );
    cursorLineRef.current.updateLeft(parserTimeToPixel(time, startLeft) );

    if (rerender) {
        animationEngine.setCurrentTime(time, true);
        animationEngine.reRender({ cause: "handleSetCursor", force: true });
    }
};