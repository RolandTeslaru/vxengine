import { ITimeline } from "vxengine/AnimationEngine/types/track";

export interface TimelineStoreStateProps {
    timelines: ITimeline[];
    addTimeline: (timeline: ITimeline) => void
    currentTimeline: ITimeline;
    getTimelineById: (id: string) => ITimeline | undefined;
    isPlaying: boolean;
    currentTime: number;
    playRate: number;
    setPlayRate: (rate: number) => void;
}