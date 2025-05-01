"use client"
import React, { createContext, useCallback, useEffect, useRef } from 'react'
import TimelineEditorHeader from './components/Header'
import TimelineEditorFooter from './components/Footer'
import TrackVerticalList from './components/TrackVerticalList'
import TimelineArea from './components/TimelineArea'
import { GripVertical } from 'lucide-react'
import { useRefStore } from '@vxengine/utils'
import { useWindowContext } from '@vxengine/core/components/VXEngineWindow'
import { TimelineEditorProvider, useTimelineEditorContext } from './context'
import { useTimelineManagerAPI } from '..'

const TimelineEditor = React.memo(() => {
    const containerRef = useRef<HTMLDivElement>(null);
    const { externalContainer } = useWindowContext();
    const { trackListRef, timelineAreaRef } = useTimelineEditorContext();


    const handleMouseDown = (e) => {
        e.preventDefault();
        if(externalContainer){
            // Attach event listeners on the document to capture mouse movement
            externalContainer.addEventListener('mousemove', handleMouseMove);
            externalContainer.addEventListener('mouseup', handleMouseUp);
        }
        else{
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
        }
    };

    const handleMouseMove = (e) => {
        if (!containerRef.current || !trackListRef.current || !timelineAreaRef.current) return;

        const containerRect = containerRef.current.getBoundingClientRect();
        // Calculate new width for the left panel based on mouse X position
        let newLeftWidth = e.clientX - containerRect.left;
        // Optionally enforce minimum widths
        const minWidth = 100; // for example
        const maxWidth = containerRect.width - minWidth;
        if (newLeftWidth < minWidth) newLeftWidth = minWidth;
        if (newLeftWidth > maxWidth) newLeftWidth = maxWidth;

        // Directly update the DOM element styles
        trackListRef.current.style.width = `${newLeftWidth}px`;
        // The right panel takes the rest of the space
        timelineAreaRef.current.style.width = `${containerRect.width - newLeftWidth}px`;
    }

    const handleMouseUp = () => {
        // Clean up the event listeners
        if(externalContainer){
            externalContainer.removeEventListener('mousemove', handleMouseMove);
            externalContainer.removeEventListener('mouseup', handleMouseUp);
        } else {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        }
    };

    return (
        <>
            <TimelineEditorHeader />
            <div ref={containerRef} className='px-1 flex flex-row grow overflow-hidden'>
                <TrackVerticalList />
                <div className='h-full flex'>
                    <div 
                        className="z-10 flex h-4 my-auto w-fit items-center justify-center rounded-xs cursor-col-resize"
                        onMouseDown={handleMouseDown}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-grip-vertical h-2.5 w-2.5"><circle cx="9" cy="12" r="1"></circle><circle cx="9" cy="5" r="1"></circle><circle cx="9" cy="19" r="1"></circle><circle cx="15" cy="12" r="1"></circle><circle cx="15" cy="5" r="1"></circle><circle cx="15" cy="19" r="1"></circle></svg>
                    </div>
                </div>
                <TimelineArea />
            </div>
            <TimelineEditorFooter />
        </>
    )
})

export default TimelineEditor
