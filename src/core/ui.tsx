// VXEngine - VEXR Labs' proprietary toolset for React Three Fiber
// (c) 2024 VEXR Labs. All Rights Reserved.
// See the LICENSE file in the root directory of this source tree for licensing information.

"use client"

import React, { useEffect, useState } from "react"
import { ObjectPropertiesPanel, ObjectTransformControls } from "../managers/ObjectManager/ui"
import { TimelineEditorUI, TimelineTools } from "../managers/TimelineManager/ui"
import { AnimatePresence, motion } from "framer-motion"
import ObjectList from "../managers/ObjectManager/components/ObjectList"
import VXEngineWindow from "@vxengine/components/ui/VXEngineWindow"
import { useUIManagerAPI } from "@vxengine/managers/UIManager/store"
import TrackSegmentProperties from "@vxengine/managers/TimelineManager/components/TrackSegmentProperties"
import SplineManagerUI from "@vxengine/managers/SplineManager/ui"
import { DataSyncPopup, SourceManagerUI } from "@vxengine/managers/SourceManager/ui"
import StateVisualizer from "@vxengine/components/ui/StateVisualizer"
import CameraManagerUI from "@vxengine/managers/CameraManager/ui"
import { EffectsManagerUI } from "@vxengine/managers/EffectsManager/ui"
import Params from "@vxengine/managers/ObjectManager/components/Params"
import SettingsList from "@vxengine/managers/ObjectManager/components/SettingsList"
import { useTimelineEditorAPI } from "@vxengine/managers/TimelineManager"
import VirtualEntitiesList from "@vxengine/managers/ObjectManager/components/VirtualEntitiesList"
import { useObjectManagerAPI } from "@vxengine/managers/ObjectManager"
import { WindowControlDots } from "@vxengine/components/ui/WindowControlDots"
import { MenubarUI } from "@vxengine/components/ui/MenubarUI"
import { useSourceManagerAPI } from "@vxengine/managers/SourceManager"
import { useRefStore } from "@vxengine/utils"
import UIManagerDialog from "@vxengine/managers/UIManager/ui"

export const CoreUI = () => {
    const showSyncPopup = useSourceManagerAPI(state => state.showSyncPopup)

    return (
        <div id="VXEngineBaseUI" className='fixed top-0 left-0 z-50'>
            <MenubarUI />

            <LeftPanel />
            <RightPanel />

            <BottomRightBar />

            <StateVisualizer />
            <CameraManagerUI />

            <UIManagerDialog/>

            <a
                className="fixed pointer-events-auto bottom-5 left-10"
                href="https://vexr-labs.com/"
                target="_blank"
            >
                <h1 className="font-inter font-bold text-3xl text-white text-opacity-20">
                    VEXR<span className="font-thin">LABS</span>
                </h1>
            </a>

            {showSyncPopup && (
                <DataSyncPopup />
            )}
        </div>
    )
}

const RightPanel = () => {
    const rightPanelAttached = useUIManagerAPI(state => state.rightPanelAttached)
    const setRightPanelAttached = useUIManagerAPI(state => state.setRightPanelAttached)

    const firstSelectedObject = useObjectManagerAPI(state => state.selectedObjects[0]);

    const mountRightPanel = useUIManagerAPI(state => state.mountRightPanel);
    const setMountRightPanel = useUIManagerAPI(state => state.setMountRightPanel)
    const setSelectedWindow = useUIManagerAPI(state => state.setSelectedWindow)
    return (
        <VXEngineWindow
            title="VXEngine: RightPanel"
            windowClasses='width=256,height=702,right=200,top=200,resizable=0'
            attachedState={rightPanelAttached}
            setAttachedState={setRightPanelAttached}
        >
            {mountRightPanel &&
                <div className={`fixed gap-2 w-60 h-[686px] backdrop-blur-sm  text-sm bg-neutral-900 
                            bg-opacity-70 border-neutral-800 border-[1px] rounded-3xl p-2 pt-3
                            ${rightPanelAttached ? " top-32 right-6 " : " top-2 right-2"}
                            `}
                    onClick={() => setSelectedWindow("VXEngineRightPanel")}
                    id="VXEngineRightPanel"
                >
                    <WindowControlDots isAttached={rightPanelAttached} setAttach={setRightPanelAttached} setMount={setMountRightPanel} />
                    <div className="w-full h-full flex flex-col gap-2 rounded-2xl  overflow-y-scroll">
                        {firstSelectedObject && (
                            <>
                                <ObjectPropertiesPanel vxobject={firstSelectedObject} />
                                <Params vxobject={firstSelectedObject} />
                                <SettingsList vxobject={firstSelectedObject} />
                            </>
                        )}
                    </div>
                </div>
            }
        </VXEngineWindow>
    )
}

const LeftPanel = () => {
    const leftPanelAttached = useUIManagerAPI(state => state.leftPanelAttached)
    const setLeftPanelAttached = useUIManagerAPI(state => state.setLeftPanelAttached)

    const mountLeftPanel = useUIManagerAPI(state => state.mountLeftPanel)
    const setMountLeftPanel = useUIManagerAPI(state => state.setMountLeftPanel)
    const setSelectedWindow = useUIManagerAPI(state => state.setSelectedWindow);

    return (
        <VXEngineWindow
            title="VXEngine: LeftPanel"
            windowClasses='width=310,height=702,left=200,top=200,resizable=0'
            attachedState={leftPanelAttached}
            setAttachedState={setLeftPanelAttached}
        >
            <AnimatePresence>
                {mountLeftPanel &&
                    <div className={`absolute w-60 h-[686px] backdrop-blur-sm text-sm bg-neutral-900 
                                        bg-opacity-70 border-neutral-800 border-[1px] rounded-3xl p-2 pt-3
                                        ${leftPanelAttached ? "top-[128px] left-[24px]" : "top-[8px] left-[8px]"}
                                        `}
                        id="VXEngineLeftPanel"
                        onClick={() => setSelectedWindow("VXEngineLeftPanel")}
                    >
                        <WindowControlDots
                            isAttached={leftPanelAttached}
                            setAttach={setLeftPanelAttached}
                            setMount={setMountLeftPanel}
                        />
                        <div className="w-full h-full flex flex-col gap-2 rounded-2xl overflow-y-scroll">
                            <ObjectList />
                            <VirtualEntitiesList />
                            <EffectsManagerUI />
                            <TrackSegmentProperties />
                            <SplineManagerUI />
                        </div>

                        <ObjectTransformControls />

                    </div>
                }
            </AnimatePresence>
        </VXEngineWindow>
    )
}

const BottomRightBar = () => {
    const timelineEditorOpen = useUIManagerAPI(state => state.timelineEditorOpen)
    const timelineEditorAttached = useUIManagerAPI(state => state.timelineEditorAttached);
    const setTimelineEditorAttached = useUIManagerAPI(state => state.setTimelineEditorAttached);

    const mountTimelineEditor = useUIManagerAPI(state => state.mountTimelineEditor);
    const setMountTimelineEditor = useUIManagerAPI(state => state.setMountTimelineEditor)
    const setSelectedWindow = useUIManagerAPI(state => state.setSelectedWindow);
    
    return (
        <VXEngineWindow
            title="VXEngine: TimelineEditor"
            windowClasses='width=950,height=516,left=200,top=200'
            attachedState={timelineEditorAttached}
            setAttachedState={setTimelineEditorAttached}
        >
            {mountTimelineEditor &&
                <motion.div className={`fixed h-[500px] backdrop-blur-sm  text-sm bg-neutral-900 min-w-[50vw]
                                        bg-opacity-70 border-neutral-800 border-[1px] rounded-3xl flex flex-col p-2 pb-1 gap-2
                                        ${timelineEditorAttached ? " bottom-5 right-6 lg:max-w-[50vw] " : " !h-[calc(100%_-_20px)] top-2 right-2"}
                                        `}
                    onClick={() => setSelectedWindow("VXEngineTimelinePanel")}
                    id="VXEngineTimelinePanel"
                    style={{
                        boxShadow: "0px 0px 5px 5px rgba(0,0,0, 0.3)",
                        width: timelineEditorAttached ? 'auto' : 'calc(100% - 68px)',
                    }}
                    initial={{ height: "45px" }}
                    animate={
                        timelineEditorOpen ? { height: "500px" } : { height: "45px" }
                    }

                >
                    <WindowControlDots
                        isAttached={timelineEditorAttached}
                        setAttach={setTimelineEditorAttached}
                        setMount={setMountTimelineEditor}
                    />
                    <TimelineEditorUI />
                    <TimelineTools
                        visible={timelineEditorOpen}
                    />
                </motion.div>
            }
        </VXEngineWindow>

    )
}

