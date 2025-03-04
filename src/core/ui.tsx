// VXEngine - VEXR Labs' proprietary toolset for React Three Fiber
// (c) 2024 VEXR Labs. All Rights Reserved.
// See the LICENSE file in the root directory of this source tree for licensing information.

"use client"

import React from "react"
import { ObjectPropertiesPanel } from "../managers/ObjectManager/ui"
import ObjectList from "../managers/ObjectManager/Panels/ObjectTree"
import { StandardWindowStyling, VXEngineWindow } from "@vxengine/core/components/VXEngineWindow"
import { useUIManagerAPI } from "@vxengine/managers/UIManager/store"
import StateVisualizer from "@vxengine/components/ui/StateVisualizer"
import CameraManagerUI from "@vxengine/managers/CameraManager/ui"
import ParamList from "@vxengine/managers/ObjectManager/Panels/ParamList"
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

export const VXStudio = () => {
    const { IS_PRODUCTION } = useVXEngine();
    return (
        <div id="VXEngineStudio" className='fixed top-0 left-0 z-50'>
            {IS_PRODUCTION && (
                <div className="fixed top-[130px] left-[330px] flex gap-4 text-red-600">
                    <AlertTriangle size={30} className="h-auto my-auto" />
                    <div className="text-xs font-roboto-mono">
                        <p>VXEngine Running in Production Mode!</p>
                        <p>VXStudio should not be mounted!</p>

                    </div>
                </div>
            )}
            <VXMenubar />

            <VXEngineWindow
                vxWindowId="VXEngineLeftPanel"
                title="VXEngine: LeftPanel"
                windowClasses='width=310,height=702,left=200,top=200,resizable=0'
                className="w-60 h-[686px] top-32 left-6 pt-3"
                detachedClassName="top-2! left-2! right-2! w-[calc(100%-8px-8px-44px-8px)]"
            >
                <VXLeftPanel />
            </VXEngineWindow>

            <VXEngineWindow
                vxWindowId="VXEngineRightPanel"
                title="VXEngine: RightPanel"
                windowClasses='width=256,height=702,right=200,top=200,resizable=0'
                className="w-60 h-[686px] top-32 right-6 pt-3 px-0!"
                detachedClassName="top-2! right-2! left-2! w-auto"
                noPadding={true}
            >
                <VXRightPanel />
            </VXEngineWindow>

            <VXEngineWindow
                vxWindowId="VXEngineBottomRightBar"
                title="VXEngine: TimelineEditor"
                windowClasses='width=950,height=516,left=200,top=200'
                noStyling={true}
            >
                <VXBottomRightBar />
            </VXEngineWindow>

            <VXEngineWindow
                vxWindowId={"stateVisualizerWindow"}
                title="VXEngine: State Visualizer"
                windowClasses='width=717,height=450,left=100,top=200,resizable=0'
                className="text-sm min-w-[500px] bottom-[24px] max-w-96 left-[300px] rounded-2xl"
                detachedClassName=" top-1 left-1! h-[100%]! min-w-[100%]! "
            >
                <StateVisualizer />
            </VXEngineWindow>


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
        <div className="w-full  h-full  rounded-2xl overflow-y-scroll px-2">
            <div className="h-fit flex flex-col gap-2">
                {vxObject && (
                    <>
                        <ObjectPropertiesPanel vxobject={vxObject} />
                        <ParamList vxobject={vxObject} />
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

    return (
        <>
        <StandardWindowStyling
            id="VXEngineTimelinePanel"
            className="fixed bottom-5 right-6 !py-0 !gap-0 overflow-hidden max-w-[50vw]"
            isDetached={!timelineEditorAttached}
            detachedClassName="bottom-0! right-0! max-w-full h-full! rounded-none!"
            style={{
                boxShadow: "0px 0px 5px 5px rgba(0,0,0, 0.3)",
                transition: 'height 300ms ease-in-out',
                height: timelineEditorOpen ? "400px" : "45px"
            }}
        >

            <WindowControlDots
                isAttached={timelineEditorAttached}
            />
            <TimelineEditor />

        </StandardWindowStyling>
        </>
    )
}

