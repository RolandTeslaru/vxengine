import React from "react";
import { TransformControls } from "three-stdlib";
import { create } from "zustand";

export interface refStoreProps {
    draggingLeftRef: React.RefObject<number | null>

    transformControlsRef: React.RefObject<TransformControls | null>

    entityListRef: React.RefObject<any>
}

export const cursorRef = {
    current: null
}
export const vxEngineWindowRefs = new Map<string, Window>()

export const useRefStore = create<refStoreProps>((set, get) => ({
    draggingLeftRef: React.createRef<number>(),

    transformControlsRef: React.createRef<TransformControls>(),

    entityListRef: React.createRef(),
}))

