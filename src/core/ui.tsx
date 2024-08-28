"use client"
import React, { useRef, useState } from "react"
import { ObjectProperties, ObjectTransformControls } from "../managers/ObjectManager/ui"
// import { ObjectManagerUI } from "../managers/ObjectManager"
import { MenubarUI } from "../components/ui/MenubarUI"
import TimelineEditorUI, { TimelineTools } from "../managers/TimelineManager/ui"
import { motion } from "framer-motion"
import TimelineEditor from "../managers/TimelineManager/ui"
import ObjectList from "vxengine/managers/ObjectManager/components/ObjectList"

export const CoreUI = () => {

    const [timelineVisible, setTimelineVisible] = useState(false);

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

            <div className='absolute top-32 left-6 w-60 h-[686px] backdrop-blur-sm text-sm bg-neutral-900 
                            bg-opacity-70 border-neutral-800 border-[1px] rounded-3xl flex flex-r p-2'
                id="VXEngineLeftPanel"
            >
                <ObjectList />
                <ObjectTransformControls />
            </div>

            {/* Right Panel */}

            <div className='fixed top-32 right-6 gap-2 w-60 h-[686px] backdrop-blur-sm  text-sm bg-neutral-900 
                            bg-opacity-70 border-neutral-800 border-[1px] rounded-3xl flex flex-col p-2'
                id="VXEngineRightPanel">
                <ObjectProperties />
            </div>

            {/* Bottom Toolbar */}

            {/*  */}

            {/* Timeline Panel */}
            <motion.div className='fixed bottom-5 right-6 w-fit h-[500px] backdrop-blur-sm  text-sm bg-neutral-900 
                            bg-opacity-70 border-neutral-800 border-[1px] rounded-3xl flex flex-col p-2 gap-2'
                id="VXEngineTimelinePanel"
                style={{ boxShadow: "0px 0px 5px 5px rgba(0,0,0, 0.3)" }}
                initial={{ height: "45px" }}
                animate={
                    timelineVisible ? { height: "500px" } : { height: "45px" }
                }

            >
                <TimelineEditorUI
                    visible={timelineVisible}
                    setVisible={setTimelineVisible}
                />
                <TimelineTools
                    visible={timelineVisible}
                />
            </motion.div>

            <a
                className="fixed pointer-events-auto bottom-5 left-10"
                href ="https://vexr-labs.com/"
                target="_blank"
            >
                <h1 className="font-inter font-bold text-3xl text-white text-opacity-20">
                    VEXR<span className="font-thin">LABS</span>
                </h1>
            </a>
        </div>
    )
}
