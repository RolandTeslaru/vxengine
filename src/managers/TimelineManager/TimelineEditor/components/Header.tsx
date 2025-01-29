import ChevronRight from '@geist-ui/icons/chevronRight'
import { useWindowContext } from '@vxengine/core/components/VXEngineWindow'
import { useUIManagerAPI } from '@vxengine/managers/UIManager/store'
import React from 'react'
import ProgressionControls from './ProgressionControls'
import TimelineSelect from './TimelineSelect'

const MinimizeButton = () => {
    const { vxWindowId } = useWindowContext();
    const timelineEditorAttached = useUIManagerAPI(state => state.getAttachmentState(vxWindowId))
    const setOpen = useUIManagerAPI(state => state.setTimelineEditorOpen)
    const open = useUIManagerAPI(state => state.timelineEditorOpen);

    if (!timelineEditorAttached) return null;

    return (
        <button
            className={"h-7 w-7 flex hover:bg-neutral-800 rounded-2xl cursor-pointer "}
            onClick={() => setOpen(!open)}
        >
            <ChevronRight className={`${open === true && " rotate-90 "}  scale-[90%] m-auto`} />
        </button>
    )
}

const TimelineEditorHeader = () => {
    const { vxWindowId } = useWindowContext();
    const timelineEditorAttached = useUIManagerAPI(state => state.getAttachmentState(vxWindowId))

    return (
        <div className={`flex flex-row gap-2 w-full py-2 
            ${timelineEditorAttached ? "pr-2" : "px-2"}`}
        >
            <MinimizeButton/>

            <p className='font-sans-menlo text-sm my-auto h-auto'>
                Timeline Editor
            </p>

            <TimelineSelect />
            <ProgressionControls />
        </div>
    )
}
export default TimelineEditorHeader
