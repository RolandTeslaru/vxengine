// VXEngine - VEXR Labs' proprietary toolset for React Three Fiber
// (c) 2024 VEXR Labs. All Rights Reserved.
// See the LICENSE file in the root directory of this source tree for licensing information.

import { createWithEqualityFn } from 'zustand/traditional';
import { ITimeline } from './types/track';

export interface TimelineStoreStateProps {
    timelines: Record<string, ITimeline>;
    currentTimelineID: string;
    currentTimeline: ITimeline;
    projectName: string
    isPlaying: boolean;
    playRate: number;
    setPlayRate: (rate: number) => void;
}

export const useAnimationEngineAPI = createWithEqualityFn<TimelineStoreStateProps>((set, get) => ({
    timelines: {},
    currentTimelineID: "",
    currentTimeline: {
        length: 0,
        name: "",
        id: "",
        objects: undefined,
        splines: {},
        settings: {}
    },
    projectName: null,
    isPlaying: false,
    playRate: 1,
    setPlayRate: (rate: number) => set((state) => ({...state, playRate: rate })),

}))

// if a setter function is not present then it means that state needs be changed thru the AnimationEngine