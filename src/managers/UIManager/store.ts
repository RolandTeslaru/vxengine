import React from 'react';
import { createWithEqualityFn } from 'zustand/traditional';

type DialogType = "normal" | "alert" | "danger"

interface DialogEntry {
    id: string; // Unique identifier for each dialog
    content: React.ReactNode; // The content of the dialog
    type: DialogType; // Type of the dialog (e.g., "edit", "delete")
}


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


    dialogContent: DialogEntry[];
    pushDialog: (content: React.ReactNode, type: DialogType) => void;
    openedDialogs: string[];
    closeDialog: (id: string) => void;

}



export const useUIManagerAPI = createWithEqualityFn<UIManagerProps>((set, get) => ({
    mountCoreUI: false,
    setMountCoreUI: (value: boolean) => set({ mountCoreUI: value }),

    timelineEditorOpen: false,
    setTimelineEditorOpen: (value: boolean) => set({ timelineEditorOpen: value }),

    timelineEditorAttached: true,
    setTimelineEditorAttached: (value: boolean) => set({ timelineEditorAttached: value }),

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
    setMountTimelineEditor: (mountTimelineEditor: boolean) => set({ mountTimelineEditor }),

    selectedWindow: "",
    setSelectedWindow: (window: string) => set({ selectedWindow: window }),

    dialogContent: [],
    pushDialog: (content, type) => {
        const id = `${type}-${Date.now()}`;
        set({
            openedDialogs: [...get().openedDialogs, id],
            dialogContent: [...get().dialogContent, { id, content, type }],
        });
    },
    openedDialogs: [],
    closeDialog: (id) => {
        set({
            openedDialogs: get().openedDialogs.filter(dialogId => dialogId !== id)
        })

        setTimeout(() => {
            set({
                dialogContent: get().dialogContent.filter((dialog) => dialog.id !== id),
            });
        }, 300);
    },
})) 