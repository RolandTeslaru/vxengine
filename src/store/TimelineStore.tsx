import { create } from 'zustand';
import { StoredObjectProps, } from '../types/objectStore';
import { TimelineStoreStateProps } from '../types/timelineStore';
import { ITimeline } from 'vxengine/AnimationEngine/types/track';
import { shallow } from 'zustand/shallow';
import { createWithEqualityFn } from 'zustand/traditional';

const addTimeline = (state: TimelineStoreStateProps, newTimeline: ITimeline) => ({
    ...state,
    timelines: [...state.timelines, newTimeline],
})

const getTimelineById = (timelines: ITimeline[], id: string): ITimeline | undefined => {
    return timelines.find((timeline) => timeline.id === id);
}

function createStoreWithShallowEquality(config) {
    const store = create(config);
    return (selector) => store(selector, shallow);
  }

export const useVXTimelineStore = createWithEqualityFn<TimelineStoreStateProps>((set, get) => ({
    timelines: [],
    addTimeline: (newTimeline: ITimeline) => set((state) => addTimeline(state, newTimeline)),
    currentTimeline: undefined,
    getTimelineById: (id: string) => getTimelineById(get().timelines, id),
    isPlaying: false,
    currentTime: 0,
    playRate: 1,
    setPlayRate: (rate: number) => set((state) => ({...state, playRate: rate })),
}))

// if a setter function is not present then it means that state needs be changed thru the AnimationEngine