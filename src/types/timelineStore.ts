export interface StoredTimelineProps {
    id: string;
    // Add other properties as needed
    [key: string]: any;
    type: string;
    name: string;
    // FIXME
    ref: React.MutableRefObject<any>;
}

export interface TimelineStoreStateProps {
    timelines: StoredTimelineProps[];
    addTimeline: (object: StoredTimelineProps) => void;
    updateTimeline: (id: string, newProps: Partial<StoredTimelineProps>) => void;
    selectTimeline: (ids: string) => void;
    removeTimeline: (id: string) => void;
    getTimelineById: (id: string) => StoredTimelineProps | undefined;
}