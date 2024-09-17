import { createWithEqualityFn } from 'zustand/traditional';

interface UiStoreStateProps {
    timelineEditorAttached: boolean
    setTimelineEditorAttached: (value: boolean) => void;
    timelineEditorOpen: boolean;
    setTimelineEditorOpen: (value: boolean) => void;

    leftPanelAttached: boolean
    setLeftPanelAttached: (value: boolean) => void;

    rightPanelAttached: boolean;
    setRightPanelAttached: (value: boolean) => void;
}

export const useVXUiStore = createWithEqualityFn<UiStoreStateProps>((set, get) => ({
    timelineEditorAttached: true,
    setTimelineEditorAttached: (value: boolean) => set({ timelineEditorAttached: value} ),
    timelineEditorOpen: false,
    setTimelineEditorOpen: (value: boolean) => set({ timelineEditorOpen: value}),

    leftPanelAttached: true,
    setLeftPanelAttached: (value: boolean) => set({ leftPanelAttached: value }),

    rightPanelAttached: true,
    setRightPanelAttached: (value: boolean) => set({ rightPanelAttached: value }),
}))