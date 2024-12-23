import { VXEngineWindowProps } from '@vxengine/core/components/VXEngineWindow';
import React from 'react';
import { createWithEqualityFn } from 'zustand/traditional';

type DialogType = "normal" | "alert" | "danger"

interface DialogEntry {
    id: string; 
    content: React.ReactNode; 
    type: DialogType; 
    className?: string
}

interface PartialVXEngineWindowProps {
    title: string;
    id: string;
}

interface UIManagerProps {
    mountCoreUI: boolean;
    setMountCoreUI: (value: boolean) => void,

    windows: Record<string, PartialVXEngineWindowProps>;
    registerWindow: (props: PartialVXEngineWindowProps) => void;
    windowVisibility: Record<string, boolean>; 
    setWindowVisibility: (id: string, visible: boolean) => void;
    
    attachmentState: Record<string, boolean>;
    setWindowAttachment: (id: string, value: boolean) => void;
    getAttachmentState: (id: string, defaultValue?: boolean) => boolean;

    timelineEditorOpen: boolean;
    setTimelineEditorOpen: (value: boolean) => void;

    selectedWindow: string;
    setSelectedWindow: (window: string) => void;

    dialogContent: DialogEntry[];
    pushDialog: (content: React.ReactNode, type: DialogType, className?: string) => void;
    openedDialogs: string[];
    closeDialog: (id: string) => void;
}



export const useUIManagerAPI = createWithEqualityFn<UIManagerProps>((set, get) => ({
    mountCoreUI: false,
    setMountCoreUI: (value: boolean) => set({ mountCoreUI: value }),

    windows: {},
    registerWindow: (props: PartialVXEngineWindowProps) => {
        if(get().windows[props.id]) return;

        set((state) => ({
            windows: { ...state.windows, [props.id]: props },
            windowVisibility: {...state.windowVisibility, [props.id]: true},
            attachmentState: {...state.attachmentState, [props.id]: true}
        }))
    },
        
    windowVisibility: {},
    setWindowVisibility: (id: string, visible: boolean) =>
        set((state) => ({
            windowVisibility: {...state.windowVisibility, [id]: visible}
        })),

    attachmentState: {},
    setWindowAttachment: (id, value) => 
        set((state) => ({
            attachmentState: {...state.attachmentState, [id]: value}
        })),

    getAttachmentState: (id, defaultValue = true) => {
        return get().attachmentState[id] ?? defaultValue
    },

    timelineEditorOpen: false,
    setTimelineEditorOpen: (value: boolean) => set({ timelineEditorOpen: value }),

    selectedWindow: "",
    setSelectedWindow: (window: string) => set({ selectedWindow: window }),

    dialogContent: [],
    pushDialog: (content, type, className) => {
        const id = `${type}-${Date.now()}`;
        set({
            openedDialogs: [...get().openedDialogs, id],
            dialogContent: [...get().dialogContent, { id, content, type, className }],
        });
    },
    openedDialogs: [],
    closeDialog: (id) => {
        console.log("Closing Dialog with id ", id)
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