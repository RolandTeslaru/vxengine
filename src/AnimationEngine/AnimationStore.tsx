// VXEngine - VEXR Labs' proprietary toolset for React Three Fiber
// (c) 2024 VEXR Labs. All Rights Reserved.
// See the LICENSE file in the root directory of this source tree for licensing information.

import { create } from 'zustand';
import { vxObjectProps, } from '../types/objectStore';
import { TimelineStoreStateProps } from '../types/timelineStore';
import { ITimeline } from '@vxengine/AnimationEngine/types/track';
import { shallow } from 'zustand/shallow';
import { createWithEqualityFn } from 'zustand/traditional';
import { produce } from 'immer';

export const useAnimationEngineAPI = createWithEqualityFn<TimelineStoreStateProps>((set, get) => ({
    timelines: {},
    currentTimelineID: "",
    isPlaying: false,
    playRate: 1,
    setPlayRate: (rate: number) => set((state) => ({...state, playRate: rate })),

}))

// if a setter function is not present then it means that state needs be changed thru the AnimationEngine