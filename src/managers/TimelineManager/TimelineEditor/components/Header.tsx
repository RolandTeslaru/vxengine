import { useWindowContext } from '@vxengine/core/components/VXEngineWindow'
import { useUIManagerAPI } from '@vxengine/managers/UIManager/store'
import React, { useEffect, useRef } from 'react'
import ProgressionControls from './ProgressionControls'
import TimelineSelect from './TimelineSelect'
import { ChevronRight } from '@vxengine/components/ui/icons'
import { Slider } from '@vxengine/components/shadcn/slider'
import animationEngineInstance from '@vxengine/singleton'
import { useAnimationEngineAPI } from '@vxengine/AnimationEngine'
import { useTimelineEditorAPI } from '../store'

const MinimizeButton = () => {
    const { vxWindowId } = useWindowContext();
    const timelineEditorAttached = useUIManagerAPI(state => state.getAttachmentState(vxWindowId))
    const setOpen = useUIManagerAPI(state => state.setTimelineEditorOpen)
    const open = useUIManagerAPI(state => state.timelineEditorOpen);

    if (!timelineEditorAttached) return null;

    return (
        <button
            className={`h-7 w-7 flex  border border-transparent rounded-2xl cursor-pointer 
                        hover:bg-neutral-800/40 hover:border-neutral-400/10  transition-all  `}
            onClick={() => setOpen(!open)}
        >
            <ChevronRight className={`${open === true && " rotate-90 "} stroke-label-primary scale-[90%] m-auto`} />
        </button>
    )
}

const TimelineEditorHeader = () => {
    const { vxWindowId } = useWindowContext();
    const timelineEditorAttached = useUIManagerAPI(state => state.getAttachmentState(vxWindowId))

    return (
        <div className={`flex flex-row gap-2 w-full py-[5px] px-2
            ${timelineEditorAttached ? "pr-5" : "px-2"}`}
        >
            <div className='flex w-[390px] gap-2'>
                <MinimizeButton/>

                <p className='font-roboto-mono text-nowrap font-bold antialiased text-sm my-auto h-auto text-label-primary'>
                    Timeline Editor
                </p>

                <TimelineSelect />
            </div>
            <ProgressionControls />
        </div>
    )
}
export default TimelineEditorHeader

