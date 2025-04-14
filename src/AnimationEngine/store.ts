// VXEngine - VEXR Labs' proprietary toolset for React Three Fiber
// (c) 2024 VEXR Labs. All Rights Reserved.
// See the LICENSE file in the root directory of this source tree for licensing information.

import { RawTimeline } from '@vxengine/types/data/rawData';
import { create } from 'zustand';
import animationEngineInstance from '@vxengine/singleton';
import { AnimationEngine } from './engine';

export interface TimelineStoreStateProps {
    timelines: Record<string, RawTimeline>;
    animationEngineInstance: AnimationEngine
    currentTimelineID: string;
    currentTimeline: RawTimeline;
    projectName: string
    isPlaying: boolean;
    playRate: number;
    setPlayRate: (rate: number) => void;
}

export const useAnimationEngineAPI = create<TimelineStoreStateProps>(
  (set, get) => ({
    timelines: {},
    animationEngineInstance: null,
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
  })
)

// if a setter function is not present then it means that state needs be changed thru the AnimationEngine