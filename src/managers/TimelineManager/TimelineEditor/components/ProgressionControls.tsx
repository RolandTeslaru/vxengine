import React from "react";


import { useAnimationEngineAPI } from "@vxengine/AnimationEngine";
import TimeRender from "./TimeRender";
import { useTimelineManagerAPI } from "../..";
import { useTimelineEditorAPI } from "../store";
import animationEngineInstance from "@vxengine/singleton";
import { PauseFill, Play, SkipBack, SkipForward, Square } from "@vxengine/components/ui/icons";

const ProgressionControls = React.memo(() => {
    const isPlaying = useAnimationEngineAPI(state => state.isPlaying)
    const setTime = useTimelineEditorAPI(state => state.setTime)
    //Start or pause
    const handlePlayOrPause = () => {
        if (isPlaying)
            animationEngineInstance.pause();
        else
            animationEngineInstance.play({ autoEnd: true });
    };

    const handleReset = () => {
        setTime(0)
    }

    return (
        <div className='flex flex-row gap-2 w-auto ml-auto'>
            <TimeRender />
            
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
                    <Play className='scale-[65%] m-auto' />
                )}
            </button>
            <button className={"bg-neutral-950 border h-7 w-7 flex hover:bg-neutral-800 border-neutral-600 rounded-lg cursor-pointer "}
                onClick={handleReset}
            >
                <SkipForward fill="white" className='scale-[65%] m-auto' />
            </button>
        </div>
    )
})

export default ProgressionControls