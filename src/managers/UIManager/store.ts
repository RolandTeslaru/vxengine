import React from 'react';
import { createWithEqualityFn } from 'zustand/traditional';

interface UIManagerProps {
    mountCoreUI: boolean;
    setMountCoreUI: (value: boolean) => void,

    timelineEditorOpen: boolean;
    setTimelineEditorOpen: (value: boolean) => void;

    timelineEditorAttached: boolean
    setTimelineEditorAttached: (value: boolean) => void;

    leftPanelAttached: boolean
    setLeftPanelAttached: (value: boolean) => void;

    rightPanelAttached: boolean;
    setRightPanelAttached: (value: boolean) => void;

    showStateVisualizer: boolean;
    setShowStateVisualizer: (value: boolean) => void;

    mountLeftPanel: boolean;
    setMountLeftPanel: (mountLeftPanel: boolean) => void

    mountRightPanel: boolean;
    setMountRightPanel: (mountRightPanel: boolean) => void

    mountTimelineEditor: boolean;
    setMountTimelineEditor: (mountTimelineEditor: boolean) => void;

    selectedWindow: string;
    setSelectedWindow: (window: string) => void;
    

    isDialogOpen: boolean;
    dialogContent: React.ReactNode;
    showDialog: (content: React.ReactNode) => void;
    closeDialog: () => void;
}

export const useUIManagerAPI = createWithEqualityFn<UIManagerProps>((set, get) => ({
    mountCoreUI: false,
    setMountCoreUI: (value: boolean) => set({ mountCoreUI: value }),

    timelineEditorOpen: false,
    setTimelineEditorOpen: (value: boolean) => set({ timelineEditorOpen: value}),
    
    timelineEditorAttached: true,
    setTimelineEditorAttached: (value: boolean) => set({ timelineEditorAttached: value} ),

    leftPanelAttached: true,
    setLeftPanelAttached: (value: boolean) => set({ leftPanelAttached: value }),

    rightPanelAttached: true,
    setRightPanelAttached: (value: boolean) => set({ rightPanelAttached: value }),

    showStateVisualizer: false,
    setShowStateVisualizer: (value: boolean) => set({ showStateVisualizer: value }),

    mountLeftPanel: true,
    setMountLeftPanel: (mountLeftPanel: boolean) => set({ mountLeftPanel }),

    mountRightPanel: true,
    setMountRightPanel: (mountRightPanel: boolean) => set({ mountRightPanel }),

    mountTimelineEditor: true,
    setMountTimelineEditor: (mountTimelineEditor: boolean) => set({ mountTimelineEditor}),

    selectedWindow: "",
    setSelectedWindow: (window: string) => set({ selectedWindow: window}),

    isDialogOpen: false,
    dialogContent: null,
    showDialog: (content) => set({
        isDialogOpen: true,
        dialogContent: content
    }),
    closeDialog: () => set({
        isDialogOpen: false,
    })
}))