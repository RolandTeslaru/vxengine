// VXEngine - VEXR Labs' proprietary toolset for React Three Fiber
// (c) 2024 VEXR Labs. All Rights Reserved.
// See the LICENSE file in the root directory of this source tree for licensing information.

"use client"

import React, { useEffect, useState } from "react"
import { ObjectProperties, ObjectTransformControls } from "../managers/ObjectManager/ui"
import { TimelineEditorUI, TimelineTools } from "../managers/TimelineManager/ui"
import { AnimatePresence, motion } from "framer-motion"
import ObjectList from "../managers/ObjectManager/components/ObjectList"
import VXUiPanelWrapper from "@vxengine/components/ui/VXUiPanelWrapper"
import { useVXUiStore } from "@vxengine/components/ui/VXUIStore"
import TrackSegmentProperties from "@vxengine/managers/TimelineManager/components/TrackSegmentProperties"
import SplineManagerUI from "@vxengine/managers/SplineManager/ui"
import { SourceManagerUI } from "@vxengine/managers/SourceManager/ui"
import StateVisualizer from "@vxengine/components/ui/StateVisualizer"
import CameraManagerUI from "@vxengine/managers/CameraManager/ui"
import { EffectsManagerUI } from "@vxengine/managers/EffectsManager/ui"
import Params from "@vxengine/managers/ObjectManager/components/Params"
import SettingsList from "@vxengine/managers/ObjectManager/components/SettingsList"
import { useTimelineEditorAPI } from "@vxengine/managers/TimelineManager"
import VirtualEntitiesList from "@vxengine/managers/ObjectManager/components/VirtualEntitiesList"
import { useObjectManagerAPI } from "@vxengine/managers/ObjectManager"
import { Popover, PopoverTrigger, PopoverContent } from "@vxengine/components/shadcn/popover"
import { WindowControlDots } from "@vxengine/components/ui/WindowControlDots"

export const CoreUI = () => {

    const mountCoreUI = useVXUiStore(state => state.mountCoreUI);

    if (mountCoreUI)
        return (
            <div id="VXEngineBaseUI" className='fixed top-0 left-0 z-50'>
                {/* Menubar */}

                <LeftPanel />
                <RightPanel />

                <BottomRightBar />

                <FrequentStateVisualizer />
                <StateVisualizer />
                <CameraManagerUI />

                <a
                    className="fixed pointer-events-auto bottom-5 left-10"
                    href="https://vexr-labs.com/"
                    target="_blank"
                >
                    <h1 className="font-inter font-bold text-3xl text-white text-opacity-20">
                        VEXR<span className="font-thin">LABS</span>
                    </h1>
                </a>
            </div>
        )
    else {
        return null;
    }
}

const RightPanel = () => {
    const rightPanelAttached = useVXUiStore(state => state.rightPanelAttached)
    const setRightPanelAttached = useVXUiStore(state => state.setRightPanelAttached)

    const firstSelectedObject = useObjectManagerAPI(state => state.selectedObjects[0]);

    const mountRightPanel = useVXUiStore(state => state.mountRightPanel);
    const setMountRightPanel = useVXUiStore(state => state.setMountRightPanel)

    return (
        <VXUiPanelWrapper
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
                    id="VXEngineRightPanel"
                >
                    <WindowControlDots isAttached={rightPanelAttached} setAttach={setRightPanelAttached} setMount={setMountRightPanel} />
                    <div className="w-full h-full flex flex-col gap-2 rounded-2xl  overflow-y-scroll">
                        {firstSelectedObject && (
                            <>
                                <ObjectProperties vxobject={firstSelectedObject} />
                                <Params vxobject={firstSelectedObject} />
                                <SettingsList vxobject={firstSelectedObject} />
                            </>
                        )}
                    </div>
                </div>
            }
        </VXUiPanelWrapper>
    )
}

const LeftPanel = () => {
    const leftPanelAttached = useVXUiStore(state => state.leftPanelAttached)
    const setLeftPanelAttached = useVXUiStore(state => state.setLeftPanelAttached)

    const mountLeftPanel = useVXUiStore(state => state.mountLeftPanel)
    const setMountLeftPanel = useVXUiStore(state => state.setMountLeftPanel)


    return (
        <VXUiPanelWrapper
            title="VXEngine: LeftPanel"
            windowClasses='width=310,height=702,left=200,top=200,resizable=0'
            attachedState={leftPanelAttached}
            setAttachedState={setLeftPanelAttached}
        >
            <AnimatePresence>
                {mountLeftPanel && 
                    <div className={`absolute w-60 h-[686px] backdrop-blur-sm text-sm bg-neutral-900 
                                        bg-opacity-70 border-neutral-800 border-[1px] rounded-3xl p-2 pt-3
                                        ${leftPanelAttached ? "top-32 left-6" : "top-2 left-2"}
                                        `}
                        id="VXEngineLeftPanel"
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
                            <SourceManagerUI />
                        </div>

                        <ObjectTransformControls />

                    </div>
                }
            </AnimatePresence>
        </VXUiPanelWrapper>
    )
}

const BottomRightBar = () => {
    const timelineEditorOpen = useVXUiStore(state => state.timelineEditorOpen)
    const timelineEditorAttached = useVXUiStore(state => state.timelineEditorAttached);
    const setTimelineEditorAttached = useVXUiStore(state => state.setTimelineEditorAttached);

    const mountTimelineEditor = useVXUiStore(state => state.mountTimelineEditor);
    const setMountTimelineEditor = useVXUiStore(state => state.setMountTimelineEditor)
    return (
        <VXUiPanelWrapper
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
        </VXUiPanelWrapper>

    )
}


const FrequentStateVisualizer = () => {
    return (
        <div className="fixed left-[300px] top-[100px] w-60  text-sm bg-neutral-900 
                            gap-2 bg-opacity-70 border-neutral-800 border-[1px] rounded-lg p-2 ">
            <div className="flex flex-row">
                STATE_cursorTime &nbsp;&nbsp;
                <CursorTimeVisualzier />
            </div>
        </div>
    )
}

const CursorTimeVisualzier = () => {
    const cursorTime = useTimelineEditorAPI(state => state.cursorTime)
    return (
        <p>
            {cursorTime.toFixed(2)}
        </p>
    )
}

