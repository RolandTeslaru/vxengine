import React from 'react'
import TimelineEditorHeader from './components/Header'
import TimelineEditorFooter from './components/Footer'
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@vxengine/components/shadcn/Resizeable'
import TrackVerticalList from './components/TrackVerticalList'
import TimelineArea from './components/TimelineArea'

const TimelineEditor = () => {
    return (
        <>
            <TimelineEditorHeader/>

            <ResizablePanelGroup
                className='relative flex flex-row w-full grow overflow-hidden'
                direction='horizontal'
            >
                <ResizablePanel defaultSize={28}>
                    <TrackVerticalList/>
                </ResizablePanel>
                <ResizableHandle withHandle className='mx-1' />
                <ResizablePanel defaultSize={72}>
                    <TimelineArea/>
                </ResizablePanel>
            </ResizablePanelGroup>

            <TimelineEditorFooter />
        </>
    )
}

export default TimelineEditor
