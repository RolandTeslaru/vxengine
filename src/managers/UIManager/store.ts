import { logReportingService } from '@vxengine/AnimationEngine/services/LogReportingService';
import { VXEngineWindowProps } from '@vxengine/core/components/VXEngineWindow';
import { produce } from 'immer';
import React from 'react';
import { create, StateCreator } from 'zustand';
import { persist, PersistOptions } from "zustand/middleware";

export type DialogType = "normal" | "alert" | "danger"

interface DialogEntry {
    id: string;
    content: React.ReactNode;
    type: DialogType;
    className?: string
    showTriangle?: boolean
    open: boolean
    onConfirm?: () => void;
    onCancel?: () => void;
}

type PushDialogProps = Omit<DialogEntry, "id" | "open"> & Partial<Pick<DialogEntry, "id" | "open">>;

interface StoredWindowProps {
    title: string;
    id: string;
    isAttached: boolean
    isOpen: boolean
}

interface UIManagerProps {
    mountCoreUI: boolean;
    setMountCoreUI: (value: boolean) => void,

    vxWindows: Record<string, StoredWindowProps>;
    registerWindow: (id: string, title: string, isAttached?:boolean, isOpen?:boolean) => void;

    getAttachmentState: (id: string, defaultValue?: boolean) => boolean

    closeVXWindow: (id:string) => void
    openVXWindow: (id:string) => void
    detachVXWindow: (id:string) => void
    attachVXWindow: (id:string) => void

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

const MODULE = "UIManagerAPI";

const checkWindowIsRegistered = (state: UIManagerProps, id, functionName: string) => {
    const vxWindow = state.vxWindows[id];
    if(!vxWindow){
        logReportingService.logError(
            `Could not find window "${id}"`,{ module: MODULE, functionName})
        false;
    }
    return true;
}

export const useUIManagerAPI = create<UIManagerProps>()(
    persist(
        (set, get) => ({
            mountCoreUI: false,
            setMountCoreUI: (value: boolean) => set({ mountCoreUI: value }),

            vxWindows: {},
            registerWindow: (id, title, isAttached, isOpen) => {
                if (get().vxWindows[id]) return;

                set(produce((state: UIManagerProps) => {
                    state.vxWindows[id] = {
                        title, 
                        id,
                        isAttached: isAttached ?? true,
                        isOpen: isOpen ?? true
                    };
                }))
            },

            closeVXWindow: (id) => {
                set(produce((state: UIManagerProps) => {
                    if(!checkWindowIsRegistered(state, id, "closeVXWindow")) return

                    state.vxWindows[id].isOpen = false;
                }))
            },
            openVXWindow: (id) => {
                set(produce((state: UIManagerProps) => {
                    if(!checkWindowIsRegistered(state, id, "openVXWindow")) return

                    state.vxWindows[id].isOpen = true
                }))
            },

            detachVXWindow: (id) => {
                set(produce((state: UIManagerProps) => {
                    if(!checkWindowIsRegistered(state, id, "detachVXWindow")) return

                    state.vxWindows[id].isAttached = false;
                }))
            },
            attachVXWindow: (id) => {
                set(produce((state: UIManagerProps) => {
                    if(!checkWindowIsRegistered(state, id, "attachVXWindow")) return

                    state.vxWindows[id].isAttached = true;
                }))
            },

            getAttachmentState: (id, defaultValue = true) => {
                return get().vxWindows[id]?.isAttached ?? defaultValue;
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
                    Object.entries(state).filter(([key]) => ![
                        "vxWindows", 
                        "dialogContent", 
                        "hydrated", 
                        "setHydrated", 
                        "closeDialog", 
                        "openedDialogs",
                        "closeVXWindow",
                        "openVXWindow",
                        "detachVXWindow",
                        "attachVXWindow"
                    ].includes(key)),
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