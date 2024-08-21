import { create } from 'zustand';
import { StoredObjectProps, } from '../types/objectStore';
import { TimelineStoreStateProps } from '../types/timelineStore';
import { ITimeline } from 'vxengine/AnimationEngine/types/track';

const addTimeline = (state: TimelineStoreStateProps, newTimeline: ITimeline) => ({
    ...state,
    timelines: [...state.timelines, newTimeline],
})

const getTimelineById = (timelines: ITimeline[], id: string): ITimeline | undefined => {
    return timelines.find((timeline) => timeline.id === id);
}

export const useVXTimelineStore = create<TimelineStoreStateProps>((set, get) => ({
    timelines: [],
    addTimeline: (newTimeline: ITimeline) => set((state) => addTimeline(state, newTimeline)),
    currentTimeline: undefined,
    getTimelineById: (id: string) => getTimelineById(get().timelines, id),
    isPlaying: false,
    currentTime: 0,
    playRate: 1,
    setPlayRate: (rate: number) => set((state) => ({...state, playRate: rate })),
}))

// if a setter function is not present then it means that state needsto be changed thru the AnimationEngine