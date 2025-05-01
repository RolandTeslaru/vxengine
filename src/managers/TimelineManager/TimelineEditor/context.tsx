import React, { createContext, useContext, useRef } from 'react'

interface TimelineEditorContextProps {
    timelineAreaRef: React.RefObject<HTMLDivElement>
    trackListRef: React.RefObject<HTMLDivElement>
    scrollSyncId: React.RefObject<number>,
    keyframesMap: Map<string, HTMLElement>,
    trackSegmentsMap: Map<string, HTMLElement>,
    scrollLeftRef: React.RefObject<number>
}

const TimelineEditorContext = createContext<TimelineEditorContextProps | null>(null);

export const TimelineEditorProvider = ({ children }: { children: React.ReactNode }) => {
    const timelineAreaRef = useRef<HTMLDivElement>(null);
    const trackListRef = useRef<HTMLDivElement>(null);
    const scrollSyncId = useRef<number>(0);
    const keyframesMap = useRef(new Map<string, HTMLElement>()).current;
    const trackSegmentsMap = useRef(new Map<string, HTMLElement>()).current;
    const scrollLeftRef = useRef<number>(0);

    const contextValue: TimelineEditorContextProps = {
        timelineAreaRef,
        trackListRef,
        scrollSyncId,
        keyframesMap,
        trackSegmentsMap,
        scrollLeftRef
    };

    return (
        <TimelineEditorContext.Provider value={contextValue}>
            {children}
        </TimelineEditorContext.Provider>
    )
}

export const useTimelineEditorContext = () => useContext(TimelineEditorContext);