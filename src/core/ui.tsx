"use client"
import React, { useEffect, useRef, useState } from "react"
import { ObjectProperties, ObjectTransformControls } from "../managers/ObjectManager/ui"
// import { ObjectManagerUI } from "../managers/ObjectManager"
import { MenubarUI } from "../components/ui/MenubarUI"
import TimelineEditorUI, { TimelineTools } from "../managers/TimelineManager/ui"
import { motion } from "framer-motion"
import ObjectList from "vxengine/managers/ObjectManager/components/ObjectList"
import { useTimelineEditorStore } from "vxengine/managers/TimelineManager/store"
import { shallow } from "zustand/shallow"
import ReactDOM from "react-dom"
import { useVXUiStore } from "vxengine/store/VXUIStore"
import VXUiPanelWrapper from "vxengine/components/ui/VXUiPanelWrapper"

export const CoreUI = () => {
    return (
        <div id="VXEngineBaseUI" className='fixed top-0 left-0 z-50'>

            <>
                {/* <ObjectManagerUI/> */}
                {/* <SourceManagerUI/> */}
            </>

            {/* Menubar */}
            <div
                className={`absolute top-6 left-6 h-10 w-fit border-neutral-800 border-[1px] text-white 
                    backdrop-blur-sm bg-neutral-900 bg-opacity-70 rounded-3xl flex flex-row px-6`}
                id="VXEngineMenubar"
            >
                <MenubarUI />
            </div>


            {/* Left Panel */}

            <LeftPanel />

            <RightPanel/>

            {/* Bottom Toolbar */}

            {/*  */}


            <TimelineEditor />

            <TimelineEditorDebug />

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
}

const RightPanel = () => {
    const rightPanelAttached = useVXUiStore(state => state.rightPanelAttached)
    const setRightPanelAttached = useVXUiStore(state => state.setRightPanelAttached)
    return (
        <VXUiPanelWrapper
            title="VXEngine: RightPanel"
            windowClasses='width=256,height=702,right=200,top=200,resizable=0'
            attachedState={rightPanelAttached}
            setAttachedState={setRightPanelAttached}
        >
            <div className={`fixed gap-2 w-60 h-[686px] backdrop-blur-sm  text-sm bg-neutral-900 
                            bg-opacity-70 border-neutral-800 border-[1px] rounded-3xl flex flex-col p-2 pb-1
                            ${rightPanelAttached ? " top-32 right-6 " : " top-2 right-2"}
                            `}
                id="VXEngineRightPanel">
                <ObjectProperties />
                <div className="w-full mt-auto h-auto flex flex-row px-2">
                    <button className={"bg-neutral-900 border ml-auto text-xs px-2 py-1 h-fit w-fit flex hover:bg-neutral-800 border-neutral-600 rounded-lg cursor-pointer "}
                        onClick={() => setRightPanelAttached(!rightPanelAttached)}
                    >
                        {setRightPanelAttached ? "Detach" : "Attach"}
                    </button>
                </div>
            </div>
        </VXUiPanelWrapper>
    )
}

const LeftPanel = () => {
    const leftPanelAttached = useVXUiStore(state => state.leftPanelAttached)
    const setLeftPanelAttached = useVXUiStore(state => state.setLeftPanelAttached)

    return (
        <VXUiPanelWrapper
            title="VXEngine: LeftPanel"
            windowClasses='width=310,height=702,left=200,top=200,resizable=0'
            attachedState={leftPanelAttached}
            setAttachedState={setLeftPanelAttached}
        >
            <div className={`absolute w-60 h-[686px] backdrop-blur-sm text-sm bg-neutral-900 
                            gap-2 bg-opacity-70 border-neutral-800 border-[1px] rounded-3xl flex flex-col p-2 pb-1
                            ${leftPanelAttached ? "top-32 left-6" : "top-2 left-2"}
                            `}
                id="VXEngineLeftPanel"
            >
                <ObjectList />
                <div className="w-full mt-auto h-auto flex flex-row px-2">
                    <button className={"bg-neutral-900 border ml-auto text-xs px-2 py-1 h-fit w-fit flex hover:bg-neutral-800 border-neutral-600 rounded-lg cursor-pointer "}
                        onClick={() => setLeftPanelAttached(!leftPanelAttached)}
                    >
                        {leftPanelAttached ? "Detach" : "Attach"}
                    </button>
                </div>
                <ObjectTransformControls />
            </div>


        </VXUiPanelWrapper>
    )
}


const TimelineEditorDebug = () => {
    const editorData = useTimelineEditorStore(state => state.editorData);
    const editorDataString = JSON.stringify(editorData, null, 2)
    return (
        <div className="fixed backdrop-blur-sm top-[40%] left-[300px] text-sm bg-neutral-900 p-2 gap-2
                            bg-opacity-70 border-neutral-800 border-[1px] rounded-3xl flex flex-col">
            <h1 className="text-center font-sans-menlo">EditorData state</h1>
            <div>
                <pre
                    style={{
                        padding: '10px',
                        borderRadius: '5px',
                        maxHeight: '400px',
                        overflowY: 'scroll',
                        whiteSpace: 'pre-wrap', // This makes sure the text wraps within the container
                    }}
                >
                    {editorDataString}
                </pre>
            </div>
        </div>
    )
}


const TimelineEditor = () => {
    const timelineEditorOpen = useVXUiStore(state => state.timelineEditorOpen)
    const timelineEditorAttached = useVXUiStore(state => state.timelineEditorAttached);
    const setTimelineEditorAttached = useVXUiStore(state => state.setTimelineEditorAttached);
    return (
        <VXUiPanelWrapper
            title="VXEngine: TimelineEditor"
            windowClasses='width=950,height=516,left=200,top=200'
            attachedState={timelineEditorAttached}
            setAttachedState={setTimelineEditorAttached}
        >
            <motion.div className={`fixed h-[500px] backdrop-blur-sm  text-sm bg-neutral-900 
                                    bg-opacity-70 border-neutral-800 border-[1px] rounded-3xl flex flex-col p-2 pb-1 gap-2
                                    ${timelineEditorAttached ? " bottom-5 right-6 ": " bottom-2 right-2"}
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
                <TimelineEditorUI />
                <TimelineTools
                    visible={timelineEditorOpen}
                />
            </motion.div>


        </VXUiPanelWrapper>

    )
}