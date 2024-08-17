import { create } from 'zustand';
import { StoredObjectProps,  } from '../types/objectStore';
import { StoredTimelineProps, TimelineStoreStateProps } from '../types/timelineStore';

export const useVXTimelineStore = create<TimelineStoreStateProps>((set, get) => ({
    timelines: [],
    addTimeline: (object: StoredTimelineProps) => set((state) => ({...state, timelines: [...state.timelines, object] })),
    updateTimeline: (id: string, newProps: Partial<StoredTimelineProps>) => set((state) => ({...state, timelines: state.timelines.map((obj) => (obj.id === id? {...obj,...newProps} : obj)) })),
    selectTimeline: (ids: string) => set((state) => ({...state, selectedTimelineIds: ids })),
    removeTimeline: (id: string) => set((state) => ({...state, timelines: state.timelines.filter((obj) => obj.id!==id) })),
    getTimelineById: (id: string) => state.timelines.find((obj) => obj.id === id),
}))