import { VXEngineWindowProps } from '@vxengine/core/components/VXEngineWindow';
import React from 'react';
import { create, StateCreator } from 'zustand';
import { persist, PersistOptions } from "zustand/middleware";

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
    pushDialog: (content: React.ReactNode, type: DialogType, className?: string, id?: string) => void;
    openedDialogs: string[];
    closeDialog: (id: string) => void;

    hydrated: boolean;
    setHydrated: (value: boolean) => void
}

export const useUIManagerAPI = create<UIManagerProps>()(
    persist(
        (set, get) => ({
            mountCoreUI: false,
            setMountCoreUI: (value: boolean) => set({ mountCoreUI: value }),

            windows: {},
            registerWindow: (props: PartialVXEngineWindowProps) => {
                if (get().windows[props.id]) return;

                set((state) => ({
                    windows: { ...state.windows, [props.id]: props },
                    windowVisibility: { ...state.windowVisibility, [props.id]: true },
                    attachmentState: { ...state.attachmentState, [props.id]: true },
                }));

            },

            windowVisibility: {},
            setWindowVisibility: (id: string, visible: boolean) =>
                set((state) => ({
                    windowVisibility: { ...state.windowVisibility, [id]: visible },
                })),

            attachmentState: {},
            setWindowAttachment: (id, value) =>
                set((state) => ({
                    attachmentState: { ...state.attachmentState, [id]: value },
                })),

            getAttachmentState: (id, defaultValue = true) => {
                return get().attachmentState[id] ?? defaultValue;
            },

            timelineEditorOpen: false,
            setTimelineEditorOpen: (value: boolean) => set({ timelineEditorOpen: value }),

            selectedWindow: '',
            setSelectedWindow: (window: string) => set({ selectedWindow: window }),

            dialogContent: [],
            pushDialog: (content, type, className, id) => {
                const _id = id ?? `${type}-${Date.now()}`;
                set({
                    openedDialogs: [...get().openedDialogs, _id],
                    dialogContent: [...get().dialogContent, { id: _id, content, type, className }],
                });
            },
            openedDialogs: [],
            closeDialog: (id) => {
                console.log('Closing Dialog with id ', id);
                set({
                    openedDialogs: get().openedDialogs.filter((dialogId) => dialogId !== id),
                });

                setTimeout(() => {
                    set({
                        dialogContent: get().dialogContent.filter((dialog) => dialog.id !== id),
                    });
                }, 300);
            },

            hydrated: false,
            setHydrated: (value) => set({ hydrated: value })
        }),
        {
            name: "uiManager-storage",
            partialize: (state) =>
                Object.fromEntries(
                    Object.entries(state).filter(([key]) => !["dialogContent", "hydrated", "setHydrated", "closeDialog", "openedDialogs"].includes(key)),
                ),
            onRehydrateStorage: () => (state) => {
                state?.setHydrated(true); // Set the hydrated flag after state is restored
            },
        }
    )
);


export const pushDialogStatic = (content: React.ReactNode, type: DialogType, className?: string, id?: string) => {
    const _id = id ?? `${type}-${Date.now()}`;
    const state = useUIManagerAPI.getState();

    // Ensure only one dialog with the same id is opened
    if(id && state.openedDialogs.find((openedDialogId) => {
        openedDialogId === id
    }))
        return
    
    useUIManagerAPI.setState({
        openedDialogs: [...state.openedDialogs, _id],
        dialogContent: [...state.dialogContent, { id: _id, content, type, className }],
    })
}

export const closeDialogStatic = (id: string, delay = true) => {
    console.log('Closing Dialog with id ', id);
    const state = useUIManagerAPI.getState();
    useUIManagerAPI.setState({
        openedDialogs: state.openedDialogs.filter((dialogId) => dialogId !== id),
        dialogContent: delay === false ? state.dialogContent.filter((dialog) => dialog.id !== id) : state.dialogContent,
    });

    if(delay)
        setTimeout(() => {
            useUIManagerAPI.setState({
                dialogContent: state.dialogContent.filter((dialog) => dialog.id !== id),
            });
        }, 300);
}