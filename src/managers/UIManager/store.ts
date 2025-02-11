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
    showTriangle?: boolean
    open: boolean
}

type PushDialogProps = Omit<DialogEntry, "id" | "open"> & Partial<Pick<DialogEntry, "id" | "open">>;

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

    dialogContent: Map<string, DialogEntry>;
    pushDialog: (props: PushDialogProps) => void;
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

            dialogContent: new Map(),
            pushDialog: (props) => {
                const { id, type, showTriangle = true } = props;
                const _id = id ?? `${type}-${Date.now()}`;
                set((state) => {

                    if (state.dialogContent.has(_id)) return {};

                    const newDialogContent = new Map(state.dialogContent);
                    const newDialog: DialogEntry = {
                        id: _id,
                        open: true,
                        showTriangle,
                        ...props
                    }
                    newDialogContent.set(_id, newDialog)

                    return { dialogContent: newDialogContent }
                });
            },
            openedDialogs: [],
            closeDialog: (id) => {
                console.log('Closing Dialog with id ', id);
                set((state) => {
                    const newDialogContent = new Map(state.dialogContent);
                    const dialog = newDialogContent.get(id);
                    if (dialog) {
                        newDialogContent.set(id, { ...dialog, open: false });
                    }
                    return { dialogContent: newDialogContent };
                });

                // After the close animation, remove the dialog.
                setTimeout(() => {
                    set((state) => {
                        const newDialogContent = new Map(state.dialogContent);
                        newDialogContent.delete(id);
                        return { dialogContent: newDialogContent };
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



export const pushDialogStatic = ({ content, type, className, id, showTriangle = true }: PushDialogProps) => {
    const _id = id ?? `${type}-${Date.now()}`;
    const state = useUIManagerAPI.getState();

    const newDialogContent = new Map(state.dialogContent);
    const newDialog: DialogEntry = {
        id: _id,
        open: true,
        showTriangle,
        content,
        className,
        type
    };
    newDialogContent.set(_id, newDialog)

    useUIManagerAPI.setState({
        dialogContent: newDialogContent
    })
}

export const closeDialogStatic = (id: string, delay = true) => {
    console.log('Closing Dialog with id ', id);
    const state = useUIManagerAPI.getState();

    const newDialogContent = new Map(state.dialogContent);
    const dialog = newDialogContent.get(id);
    if (dialog) {
        newDialogContent.set(id, { ...dialog, open: false });
    }
    useUIManagerAPI.setState({
        dialogContent: newDialogContent
    })

    setTimeout(() => {
        const newDialogContent = new Map(state.dialogContent);
        newDialogContent.delete(id);
        useUIManagerAPI.setState({
            dialogContent: newDialogContent
        })
    }, 300);
}