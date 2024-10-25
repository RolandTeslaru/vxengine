import { parserPixelToTime, parserTimeToPixel } from "./deal_data";
import { DEFAULT_SCALE_WIDTH } from "@vxengine/AnimationEngine/interface/const";
import { useTimelineEditorAPI } from "../store";
import { useRefStore } from "@vxengine/utils/useRefStore";
import { getVXEngineState, useVXEngine } from "@vxengine/engine";

const startLeft = 20;
const DEBUG = true;

export const handleSetCursor = (param: {
    left?: number;
    time?: number;
    rerender?: boolean;
} = { rerender: true }) => {
    let { left, time, rerender = true } = param;
    if (typeof left === 'undefined' && typeof time === 'undefined') return;

    const cursorThumbRef = useRefStore.getState().cursorThumbRef
    const cursorLineRef = useRefStore.getState().cursorLineRef

    const animationEngine = getVXEngineState().getState().animationEngine
    
    // Initialize time if its undefined
    if (typeof time === 'undefined') {
        if (typeof left === 'undefined') left = parserTimeToPixel(time, startLeft);
        time = parserPixelToTime(left, startLeft);
    }

    useTimelineEditorAPI.setState({ cursorTime: time });
    cursorThumbRef.current.updateLeft(parserTimeToPixel(time, startLeft) );
    cursorLineRef.current.updateLeft(parserTimeToPixel(time, startLeft) );

    if (rerender) {
        animationEngine.setCurrentTime(time, false);
        animationEngine.reRender({ cause: "handleSetCursor", force: true });
    }
};