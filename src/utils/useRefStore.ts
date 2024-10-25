import { RowRndApi } from "@vxengine/managers/TimelineManager/components/TimelineArea/EditArea/RowDnd/row_rnd_interface";
import React from "react";
import { create } from "zustand";

interface refStoreProps {
    editAreaRef: React.MutableRefObject<HTMLDivElement | null>
    trackListRef: React.MutableRefObject<HTMLDivElement | null>
    cursorThumbRef: React.MutableRefObject<RowRndApi | null>
    cursorLineRef: React.MutableRefObject<RowRndApi | null>
    draggingLeftRef: React.MutableRefObject<number | null>
}

export const useRefStore = create<refStoreProps>((set, get) => ({
    editAreaRef: React.createRef<HTMLDivElement>(),
    trackListRef: React.createRef<HTMLDivElement>(),
    cursorThumbRef: React.createRef<RowRndApi>(),
    cursorLineRef: React.createRef<RowRndApi>(),
    draggingLeftRef: React.createRef<number>(),
}))