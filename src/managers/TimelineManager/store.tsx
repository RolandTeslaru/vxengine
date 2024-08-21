import { create } from 'zustand';
import { MIN_SCALE_COUNT, START_CURSOR_TIME } from 'vxengine/AnimationEngine/interface/const';
import { useVXEngine } from 'vxengine/engine';
import { ITrack } from 'vxengine/AnimationEngine/types/track';


export interface TimelineEditorStoreProps {
    editorData: ITrack[];
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

    setScale: (count) => set({ scale: count }),
    setScaleCount: (count) => set({ scaleCount: count }),
    setCursorTime: (time) => set({ cursorTime: time }),
    setWidth: (width) => set({ width }),
    setScrollLeft: (scrollLeft) => set({ scrollLeft }),
    setScrollTop: (scrollTop) => set({ scrollTop }),
    setActiveTool: (tool) => set({ activeTool: tool }),
    setSnap: (value) => set({ snap: value }),
}));