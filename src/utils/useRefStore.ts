import React from "react";
import { TransformControls } from "three-stdlib";
import { create } from "zustand";

export interface refStoreProps {
    editAreaRef: React.MutableRefObject<HTMLDivElement | null>
    trackListRef: React.MutableRefObject<HTMLDivElement | null>
    timelineAreaRef: React.MutableRefObject<HTMLDivElement | null>
    draggingLeftRef: React.MutableRefObject<number | null>
    scrollSyncId: React.MutableRefObject<number | null>
    scrollLeftRef: React.MutableRefObject<number | null>

    transformControlsRef: React.MutableRefObject<TransformControls | null>

    entityListRef: React.MutableRefObject<any>
    keyframesRef: Map<string, HTMLElement>
    trackSegmentsRef: Map<string, HTMLElement>
}

export const keyframesRef = new Map<string, HTMLElement>()
export const trackSegmentsRef =  new Map<string, HTMLElement>()
export const cursorRef = {
    current: null
}
export const vxEngineWindowRefs = new Map<string, Window>()

export const useRefStore = create<refStoreProps>((set, get) => ({
    editAreaRef: React.createRef<HTMLDivElement>(),
    trackListRef: React.createRef<HTMLDivElement>(),
    timelineAreaRef: React.createRef<HTMLDivElement>(),
    draggingLeftRef: React.createRef<number>(),
    scrollSyncId: React.createRef<number>(),
    scrollLeftRef: React.createRef<number>(),

    transformControlsRef: React.createRef<TransformControls>(),

    entityListRef: React.createRef(),

    keyframesRef: keyframesRef,
    trackSegmentsRef: trackSegmentsRef,
}))

