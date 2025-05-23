// VXEngine - VEXR Labs' proprietary toolset for React Three Fiber
// (c) 2024 VEXR Labs. All Rights Reserved.
// See the LICENSE file in the root directory of this source tree for licensing information.

"use client"

import React from "react"
import { ObjectParamsPanel } from "../managers/ObjectManager/ui"
import ObjectList from "../managers/ObjectManager/Panels/ObjectTree"
import { StandardWindowStyling, VXEngineWindow } from "@vxengine/core/components/VXEngineWindow"
import { useUIManagerAPI } from "@vxengine/managers/UIManager/store"
import CameraManagerUI from "@vxengine/managers/CameraManager/ui"
import SettingsList from "@vxengine/managers/ObjectManager/Panels/SettingsList"
import { useObjectManagerAPI, useVXObjectStore } from "@vxengine/managers/ObjectManager"
import { WindowControlDots } from "@vxengine/components/ui/WindowControlDots"
import VXMenubar from "@vxengine/core/components/Menubar"
import { UIManagerDialogLayer } from "@vxengine/managers/UIManager/ui"
import Watermark from "@vxengine/components/ui/Watermark"
import { ObjectTransformControls } from "@vxengine/managers/ObjectManager/components/ObjectTrasnformControls"
import TimelineEditor from "@vxengine/managers/TimelineManager/TimelineEditor"
import TrackSegmentProperties from "@vxengine/managers/TimelineManager/TrackSegmentProperties"
import ObjectInfoPanel from "@vxengine/managers/ObjectManager/Panels/ObjectInfoPanel"
import { useVXEngine } from "@vxengine/engine"
import { AlertTriangle } from "@vxengine/components/ui/icons"
import StateVisualizer from "@vxengine/components/ui/StateVisualizer"
import { TimelineEditorProvider } from "@vxengine/managers/TimelineManager/TimelineEditor/context"

export const VXStudio = () => {
    const theme = useUIManagerAPI(state => state.theme)
    return (
        <div id="VXEngineStudio" className={`${theme} fixed top-0 left-0 z-50`}>
            {/* Minimal content to test rendering */}
            <VXMenubar />

            <VXEngineWindow
                vxWindowId="VXEngineLeftPanel"
                title="VXStudio: LeftPanel"
                windowClasses='width=310,height=702,left=200,top=200,resizable=0'
                className="w-60 h-[686px] top-32 left-6 pt-3"
                detachedClassName="!top-0 !left-0 !w-[calc(100%_-_60px)] h-full"
            >
                <VXLeftPanel />
            </VXEngineWindow>

            <VXEngineWindow
                vxWindowId="VXEngineRightPanel"
                title="VXStudio: RightPanel"
                windowClasses='width=256,height=702,right=200,top=200,resizable=0'
                className="w-60 h-[686px] top-32 right-6 pt-3"
                noPadding={true}
                detachedClassName="!top-0 !left-0 w-full h-full"
            >
                <VXRightPanel />
            </VXEngineWindow>

            <VXEngineWindow
                vxWindowId="VXEngineBottomRightBar"
                title="VXStudio: TimelineEditor"
                windowClasses='width=950,height=516,left=200,top=200'
                noStyling={true}
            >
                <VXBottomRightBar /> 
            </VXEngineWindow>

            {/* <VXEngineWindow
                vxWindowId={"stateVisualizerWindow"}
                title="VXStudio: State Visualizer"
                windowClasses='width=717,height=450,left=100,top=200,resizable=0'
                className="text-sm min-w-[500px] bottom-[24px] max-w-96 left-[300px] rounded-2xl"
                detachedClassName="!top-0 !left-0 h-[100%]! min-w-[100%]! "
            >
                <StateVisualizer />
            </VXEngineWindow> */}

            <CameraManagerUI />
            <UIManagerDialogLayer />
            <Watermark />
        </div>
    )
}

const VXRightPanel = () => {
    const vxkey = useObjectManagerAPI(state => state.selectedObjectKeys[0]);
    const vxObject = useVXObjectStore(state => state.objects[vxkey]);

    return (
        <div className={ "w-full  h-full  rounded-2xl overflow-y-scroll"}>
            {/* content */}
            <div className="h-fit flex flex-col gap-2">
                {vxObject && (
                    <>
                        <ObjectParamsPanel vxobject={vxObject} />
                        <SettingsList vxobject={vxObject} />
                        <ObjectInfoPanel vxobject={vxObject} />
                    </>
                )}
            </div>
        </div>
    )
}

const VXLeftPanel = () => {
    return (
        <>
            <div className="h-full overflow-y-scroll rounded-2xl ">
                <div className="flex flex-col gap-2 h-fit">
                    <ObjectList />
                    <TrackSegmentProperties />
                </div>
            </div>

            <ObjectTransformControls />
        </>
    )
}

const VXBottomRightBar = () => {
    const vxWindowId = "VXEngineBottomRightBar"

    const timelineEditorOpen = useUIManagerAPI(state => state.timelineEditorOpen)
    const timelineEditorAttached = useUIManagerAPI(state => state.getAttachmentState(vxWindowId));

    const theme = useUIManagerAPI(state => state.theme);

    return (
        <>
            <StandardWindowStyling
                id="VXEngineTimelinePanel"
                className={`${theme} fixed bottom-5 right-6 !px-0 !py-0 !gap-0 overflow-hidden max-w-[calc(100vw_-_48px)] w-[1020px]`}
                isDetached={!timelineEditorAttached}
                detachedClassName="bottom-0! right-0! max-w-full w-full h-full! rounded-none!"
                style={{
                    boxShadow: "0px 0px 5px 5px rgba(0,0,0, 0.3)",
                    transition: 'height 300ms ease-in-out',
                    height: timelineEditorOpen ? "400px" : "40px"
                }}
            >

                <WindowControlDots
                    isAttached={timelineEditorAttached}
                />
                <TimelineEditorProvider>
                    <TimelineEditor />
                </TimelineEditorProvider>

            </StandardWindowStyling>
        </>
    )
}

