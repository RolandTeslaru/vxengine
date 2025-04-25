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
        <div className='flex flex-row gap-2 w-full h-auto my-auto '>
            <TimeRender />
            
            <button className={"bg-secondary-opaque border min-h-7 min-w-7 flex hover:bg-quaternary-opaque dark:border-neutral-600 border-neutral-400 rounded-lg cursor-pointer "}
                onClick={handleReset}
            >
                <Square className='scale-[65%] m-auto fill-label-primary !text-label-primary'/>
            </button>
            <button className={"bg-secondary-opaque border min-h-7 min-w-7 flex hover:bg-quaternary-opaque dark:border-neutral-600 border-neutral-400 rounded-lg cursor-pointer "}
                onClick={handleReset}
            >
                <SkipBack className='scale-[65%] m-auto fill-label-primary !text-label-primary' />
            </button>
            <button className={`${isPlaying ? "bg-blue-600  border-blue-500 !text-white !fill-white" : "bg-secondary-opaque hover:bg-quaternary-opaque dark:border-neutral-600 border-neutral-400 !text-label-primary"} border min-h-7 min-w-7 flex   rounded-lg cursor-pointer `}
                onClick={handlePlayOrPause}
                style={{boxShadow: isPlaying ? "0px 0px 10px 1px oklch(0.623 0.214 259.815" : ""}}
            >
                {isPlaying ? (
                    <PauseFill className='scale-[65%] m-auto fill-label-primary' />
                ) : (
                    <Play className='scale-[65%] m-auto fill-label-primary' />
                )}
            </button>
            <button className={"bg-secondary-opaque border min-h-7 min-w-7 flex hover:bg-quaternary-opaque dark:border-neutral-600 border-neutral-400 rounded-lg cursor-pointer "}
                onClick={handleReset}
            >
                <SkipForward className='scale-[65%] m-auto !fill-label-primary !text-label-primary' />
            </button>
        </div>
    )
})

export default ProgressionControls