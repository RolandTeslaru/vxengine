// VXEngine - VEXR Labs' proprietary toolset for React Three Fiber
// (c) 2024 VEXR Labs. All Rights Reserved.
// See the LICENSE file in the root directory of this source tree for licensing information.

"use client"

import React, { useEffect, useState } from "react"
import { ObjectPropertiesPanel } from "../managers/ObjectManager/ui"
import { TimelineEditorUI, TimelineTools } from "../managers/TimelineManager/ui"
import { motion } from "framer-motion"
import EntityList from "../managers/ObjectManager/components/ObjectList"
import { VXEngineWindow } from "@vxengine/core/components/VXEngineWindow"
import { useUIManagerAPI } from "@vxengine/managers/UIManager/store"
import TrackSegmentProperties from "@vxengine/managers/TimelineManager/components/TrackSegmentProperties"
import { DataSyncPopup, SourceManagerUI } from "@vxengine/managers/SourceManager/ui"
import StateVisualizer from "@vxengine/components/ui/StateVisualizer"
import CameraManagerUI from "@vxengine/managers/CameraManager/ui"
import ParamList from "@vxengine/managers/ObjectManager/components/ParamList"
import SettingsList from "@vxengine/managers/ObjectManager/components/SettingsList"
import { useTimelineEditorAPI } from "@vxengine/managers/TimelineManager"
import { useObjectManagerAPI } from "@vxengine/managers/ObjectManager"
import { WindowControlDots } from "@vxengine/components/ui/WindowControlDots"
import VXMenubar from "@vxengine/core/components/Menubar"
import { useSourceManagerAPI } from "@vxengine/managers/SourceManager"
import { useRefStore } from "@vxengine/utils"
import { UIManagerDialogLayer } from "@vxengine/managers/UIManager/ui"
import Watermark from "@vxengine/components/ui/Watermark"
import { ObjectTransformControls } from "@vxengine/managers/ObjectManager/components/ObjectTrasnformControls"

export const CoreUI = () => {
    const showSyncPopup = useSourceManagerAPI(state => state.showSyncPopup)

    return (
        <div id="VXEngineCoreUI" className='fixed top-0 left-0 z-50'>
            <VXMenubar/>
            <VXLeftPanel/>
            <VXRightPanel/>
            <VXBottomRightBar/>

            <StateVisualizer/>
            <CameraManagerUI/>

            <UIManagerDialogLayer/>

            <Watermark/>

            {showSyncPopup && (
                <DataSyncPopup />
            )}
        </div>
    )
}

const VXRightPanel = () => {
    const vxObject = useObjectManagerAPI(state => state.selectedObjects[0]);

    return (
        <VXEngineWindow
            id="VXEngineRightPanel"
            title="VXEngine: RightPanel"
            windowClasses='width=256,height=702,right=200,top=200,resizable=0'
            className="w-60 h-[686px] top-32 right-6 pt-3"
            detachedClassName="top-2 right-2"
        >
            <div className="w-full h-full flex flex-col gap-2 rounded-2xl  overflow-y-scroll">
                {vxObject && (
                    <>
                        <ObjectPropertiesPanel vxobject={vxObject} />
                        <ParamList vxobject={vxObject} />
                        <SettingsList vxobject={vxObject} />
                    </>
                )}
            </div>
        </VXEngineWindow>
    )
}

const VXLeftPanel = () => {
    return (
        <VXEngineWindow
            id="VXEngineLeftPanel"
            title="VXEngine: LeftPanel"
            windowClasses='width=310,height=702,left=200,top=200,resizable=0'
            className="w-60 h-[686px] top-[128px] left-[24px] pt-3"
            detachedClassName="top-[8px] left-[8px]"
        >
            <div className="w-full  flex flex-col gap-2 rounded-2xl overflow-y-scroll">
                <EntityList />
                <TrackSegmentProperties />
            </div>

            <ObjectTransformControls />
        </VXEngineWindow>
    )
}

const VXBottomRightBar = () => {
    const id = "rightBar"

    const timelineEditorOpen = useUIManagerAPI(state => state.timelineEditorOpen)
    const timelineEditorAttached = useUIManagerAPI(state => state.getAttachmentState(id));

    const setWindowVisibility = useUIManagerAPI(state => state.setWindowVisibility);
    const setWindowAttachment = useUIManagerAPI(state => state.setWindowAttachment)

    return (
        <VXEngineWindow
            id={id}
            title="VXEngine: TimelineEditor"
            windowClasses='width=950,height=516,left=200,top=200'
            noStyling={true}
        >
            <motion.div className={`fixed backdrop-blur-sm  text-sm bg-neutral-900 min-w-[960px]
                                        bg-opacity-70 border-neutral-800 border-[1px] rounded-3xl flex flex-col px-2
                                    ${timelineEditorAttached ? " bottom-5 right-6 lg:max-w-[50vw] " : " !h-[calc(100%_-_20px)] top-2 right-2"}
                                  `}
                id="VXEngineTimelinePanel"
                style={{
                    boxShadow: "0px 0px 5px 5px rgba(0,0,0, 0.3)",
                    width: timelineEditorAttached ? 'auto' : 'calc(100% - 68px)',
                }}
                initial={{ height: "45px" }}
                animate={
                    timelineEditorOpen ? { height: "400px" } : { height: "45px" }
                }
            >
                <WindowControlDots
                    id={id}
                    isAttached={timelineEditorAttached}
                    setAttach={setWindowAttachment}
                    setMount={setWindowVisibility}
                />
                <TimelineEditorUI id={id}/>
                <TimelineTools
                    visible={timelineEditorOpen}
                />
            </motion.div>

        </VXEngineWindow>

    )
}

