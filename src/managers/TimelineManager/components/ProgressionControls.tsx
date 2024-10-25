import React from "react";
import { RefreshCcw, PlayFill, PauseFill, Square, ChevronRight, Navigation2, SkipBack, SkipForward, ChevronLeft } from "@geist-ui/icons"
import { useAnimationEngineAPI } from "@vxengine/AnimationEngine";
import { useVXEngine } from "@vxengine/engine";
import TimeRender from "./TimeRender";
import { handleSetCursor } from "../utils/handleSetCursor";

const ProgressionControls = () => {
    const animationEngine = useVXEngine(state => state.animationEngine)
    const isPlaying = useAnimationEngineAPI(state => state.isPlaying)
    //Start or pause
    const handlePlayOrPause = () => {
        if (isPlaying)
            animationEngine.pause();
        else
            animationEngine.play({ autoEnd: true });
    };

    const handleReset = () => handleSetCursor({ time: 0 })

    return (
        <div className='flex flex-row gap-2 w-auto ml-auto'>
            <p className="font-sans-menlo text-lg text-center h-auto my-auto mx-2">
                <TimeRender />
            </p>
            <button className={"bg-neutral-950 border h-7 w-7 flex hover:bg-neutral-800 border-neutral-600 rounded-lg cursor-pointer "}
                onClick={handleReset}
            >
                <Square fill="white" className='scale-[65%] m-auto' />
            </button>
            <button className={"bg-neutral-950 border h-7 w-7 flex hover:bg-neutral-800 border-neutral-600 rounded-lg cursor-pointer "}
                onClick={handleReset}
            >
                <SkipBack fill="white" className='scale-[65%] m-auto' />
            </button>
            <button className={"bg-neutral-950 border h-7 w-7 flex hover:bg-neutral-800 border-neutral-600 rounded-lg cursor-pointer "}
                onClick={handlePlayOrPause}
            >
                {isPlaying ? (
                    <PauseFill className='scale-[65%] m-auto' />
                ) : (
                    <PlayFill className='scale-[65%] m-auto' />
                )}
            </button>
            <button className={"bg-neutral-950 border h-7 w-7 flex hover:bg-neutral-800 border-neutral-600 rounded-lg cursor-pointer "}
                onClick={handleReset}
            >
                <SkipForward fill="white" className='scale-[65%] m-auto' />
            </button>
        </div>
    )
}

export default ProgressionControls