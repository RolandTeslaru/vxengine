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

    showStateVisualizer: boolean;
    setShowStateVisualizer: (value: boolean) => void;

    mountCoreUI: boolean;
    setMountCoreUI: (value: boolean) => void,
}

export const useVXUiStore = createWithEqualityFn<UiStoreStateProps>((set, get) => ({
    mountCoreUI: false,
    setMountCoreUI: (value: boolean) => set({ mountCoreUI: value }),
    
    timelineEditorAttached: true,
    setTimelineEditorAttached: (value: boolean) => set({ timelineEditorAttached: value} ),
    timelineEditorOpen: false,
    setTimelineEditorOpen: (value: boolean) => set({ timelineEditorOpen: value}),

    leftPanelAttached: true,
    setLeftPanelAttached: (value: boolean) => set({ leftPanelAttached: value }),

    rightPanelAttached: true,
    setRightPanelAttached: (value: boolean) => set({ rightPanelAttached: value }),

    showStateVisualizer: false,
    setShowStateVisualizer: (value: boolean) => set({ showStateVisualizer: value }),

}))