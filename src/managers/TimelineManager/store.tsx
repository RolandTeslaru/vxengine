import { create } from 'zustand';
import { MIN_SCALE_COUNT, START_CURSOR_TIME } from 'vxengine/AnimationEngine/interface/const';
import { useVXEngine } from 'vxengine/engine';
import { IEditorData, IStaticProps, ITrack } from 'vxengine/AnimationEngine/types/track';
import { ScrollSync } from 'react-virtualized';
import React from 'react';


export interface TimelineEditorStoreProps {
    editorData: IEditorData[];
    scale: number;
    setScale: (count: number) => void;
    cursorTime: number;
    setCursorTime: (time: number) => void;
    width: number;
    setWidth: (width: number) => void;
    activeTool: string;
    setActiveTool: (tool: string) => void;
    snap: boolean;
    setSnap: (value: boolean) => void;
    scaleCount: number;
    setScaleCount: (count: number) => void;
    scrollLeft: number;
    setScrollLeft: (scrollLeft: number) => void;
    scrollTop: number;
    setScrollTop: (scrollTop: number) => void;
    editAreaRef: React.MutableRefObject<HTMLDivElement | null>
    scrollSyncRef: React.MutableRefObject<ScrollSync | null> 
    scaleWidth: number
    scaleSplitCount: number
    startLeft: number
    changes: number
    addChange: () => void
    editorRef: React.MutableRefObject<HTMLDivElement | null>
}

export const useTimelineEditorStore = create<TimelineEditorStoreProps>((set, get) => ({
    editorData: [],
    scale: 1,
    scaleCount: MIN_SCALE_COUNT,
    cursorTime: START_CURSOR_TIME,
    width: Number.MAX_SAFE_INTEGER,
    scrollLeft: 0,
    scrollTop: 0,
    activeTool: "mouse",
    snap: true,
    editAreaRef: React.createRef<HTMLDivElement>(),
    scrollSyncRef: React.createRef<ScrollSync | null>(),
    scaleWidth: 160,
    scaleSplitCount: 10,
    startLeft: 20,
    changes: 0,
    selectedKeyframes: [],
    editorRef: React.createRef<HTMLDivElement>(),

    setScale: (count) => set({ scale: count }),
    setScaleCount: (count) => set({ scaleCount: count }),
    setCursorTime: (time) => set({ cursorTime: time }),
    setWidth: (width) => set({ width }),
    setScrollLeft: (scrollLeft) => set({ scrollLeft }),
    setScrollTop: (scrollTop) => set({ scrollTop }),
    setActiveTool: (tool) => set({ activeTool: tool }),
    setSnap: (value) => set({ snap: value }),
    addChange: () => set((state) => ({ ...state, changes: state.changes + 1}))
}));