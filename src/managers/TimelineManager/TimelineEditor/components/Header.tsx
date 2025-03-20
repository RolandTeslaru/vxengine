import { useWindowContext } from '@vxengine/core/components/VXEngineWindow'
import { useUIManagerAPI } from '@vxengine/managers/UIManager/store'
import React from 'react'
import ProgressionControls from './ProgressionControls'
import TimelineSelect from './TimelineSelect'
import { ChevronRight } from '@vxengine/components/ui/icons'

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
        <div className={`flex flex-row gap-2 w-full py-2 px-2
            ${timelineEditorAttached ? "pr-4" : "px-2"}`}
        >
            <MinimizeButton/>

            <p className='font-roboto-mono font-bold antialiased text-sm my-auto h-auto text-label-primary'>
                Timeline Editor
            </p>

            <TimelineSelect />
            <ProgressionControls />
        </div>
    )
}
export default TimelineEditorHeader
