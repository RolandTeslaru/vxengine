import { ITimeline } from "@vxengine/AnimationEngine/types/track";

export interface TimelineStoreStateProps {
    timelines: Record<string, ITimeline>;
    currentTimelineID: string;
    isPlaying: boolean;
    playRate: number;
    setPlayRate: (rate: number) => void;
}