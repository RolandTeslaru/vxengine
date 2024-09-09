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
import { useVXAnimationStore } from "vxengine/store/AnimationStore"

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

            <RightPanel />

            {/* Bottom Toolbar */}

            {/*  */}


            

            <TimelineEditor />

            <FrequentStateVisualizer/>

            {/* <TimelineEditorDebug /> */}

            <FrequentStateVisualizer/>

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
                <div className="w-full mt-auto h-auto flex flex-row pl-2">
                    <button className={"bg-transparent border ml-auto text-xs p-1 h-fit w-fit flex hover:bg-neutral-800 border-neutral-600 rounded-2xl cursor-pointer "}
                        onClick={() => setRightPanelAttached(!rightPanelAttached)}
                    >
                        {setRightPanelAttached
                            ? <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M12 13C12.5523 13 13 12.5523 13 12V3C13 2.44771 12.5523 2 12 2H3C2.44771 2 2 2.44771 2 3V6.5C2 6.77614 2.22386 7 2.5 7C2.77614 7 3 6.77614 3 6.5V3H12V12H8.5C8.22386 12 8 12.2239 8 12.5C8 12.7761 8.22386 13 8.5 13H12ZM9 6.5C9 6.5001 9 6.50021 9 6.50031V6.50035V9.5C9 9.77614 8.77614 10 8.5 10C8.22386 10 8 9.77614 8 9.5V7.70711L2.85355 12.8536C2.65829 13.0488 2.34171 13.0488 2.14645 12.8536C1.95118 12.6583 1.95118 12.3417 2.14645 12.1464L7.29289 7H5.5C5.22386 7 5 6.77614 5 6.5C5 6.22386 5.22386 6 5.5 6H8.5C8.56779 6 8.63244 6.01349 8.69139 6.03794C8.74949 6.06198 8.80398 6.09744 8.85143 6.14433C8.94251 6.23434 8.9992 6.35909 8.99999 6.49708L8.99999 6.49738" fill="currentColor"></path></svg>
                            : <svg className='rotate-180' width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M12 13C12.5523 13 13 12.5523 13 12V3C13 2.44771 12.5523 2 12 2H3C2.44771 2 2 2.44771 2 3V6.5C2 6.77614 2.22386 7 2.5 7C2.77614 7 3 6.77614 3 6.5V3H12V12H8.5C8.22386 12 8 12.2239 8 12.5C8 12.7761 8.22386 13 8.5 13H12ZM9 6.5C9 6.5001 9 6.50021 9 6.50031V6.50035V9.5C9 9.77614 8.77614 10 8.5 10C8.22386 10 8 9.77614 8 9.5V7.70711L2.85355 12.8536C2.65829 13.0488 2.34171 13.0488 2.14645 12.8536C1.95118 12.6583 1.95118 12.3417 2.14645 12.1464L7.29289 7H5.5C5.22386 7 5 6.77614 5 6.5C5 6.22386 5.22386 6 5.5 6H8.5C8.56779 6 8.63244 6.01349 8.69139 6.03794C8.74949 6.06198 8.80398 6.09744 8.85143 6.14433C8.94251 6.23434 8.9992 6.35909 8.99999 6.49708L8.99999 6.49738" fill="currentColor"></path></svg>

                        }
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
                <div className="w-full mt-auto h-auto flex flex-row pl-2">
                    <button className={"bg-transparent border ml-auto text-xs p-1 h-fit w-fit flex hover:bg-neutral-800 border-neutral-600 rounded-2xl cursor-pointer "}
                        onClick={() => setLeftPanelAttached(!leftPanelAttached)}
                    >
                        {leftPanelAttached
                            ? <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M12 13C12.5523 13 13 12.5523 13 12V3C13 2.44771 12.5523 2 12 2H3C2.44771 2 2 2.44771 2 3V6.5C2 6.77614 2.22386 7 2.5 7C2.77614 7 3 6.77614 3 6.5V3H12V12H8.5C8.22386 12 8 12.2239 8 12.5C8 12.7761 8.22386 13 8.5 13H12ZM9 6.5C9 6.5001 9 6.50021 9 6.50031V6.50035V9.5C9 9.77614 8.77614 10 8.5 10C8.22386 10 8 9.77614 8 9.5V7.70711L2.85355 12.8536C2.65829 13.0488 2.34171 13.0488 2.14645 12.8536C1.95118 12.6583 1.95118 12.3417 2.14645 12.1464L7.29289 7H5.5C5.22386 7 5 6.77614 5 6.5C5 6.22386 5.22386 6 5.5 6H8.5C8.56779 6 8.63244 6.01349 8.69139 6.03794C8.74949 6.06198 8.80398 6.09744 8.85143 6.14433C8.94251 6.23434 8.9992 6.35909 8.99999 6.49708L8.99999 6.49738" fill="currentColor"></path></svg>
                            : <svg className='rotate-180' width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M12 13C12.5523 13 13 12.5523 13 12V3C13 2.44771 12.5523 2 12 2H3C2.44771 2 2 2.44771 2 3V6.5C2 6.77614 2.22386 7 2.5 7C2.77614 7 3 6.77614 3 6.5V3H12V12H8.5C8.22386 12 8 12.2239 8 12.5C8 12.7761 8.22386 13 8.5 13H12ZM9 6.5C9 6.5001 9 6.50021 9 6.50031V6.50035V9.5C9 9.77614 8.77614 10 8.5 10C8.22386 10 8 9.77614 8 9.5V7.70711L2.85355 12.8536C2.65829 13.0488 2.34171 13.0488 2.14645 12.8536C1.95118 12.6583 1.95118 12.3417 2.14645 12.1464L7.29289 7H5.5C5.22386 7 5 6.77614 5 6.5C5 6.22386 5.22386 6 5.5 6H8.5C8.56779 6 8.63244 6.01349 8.69139 6.03794C8.74949 6.06198 8.80398 6.09744 8.85143 6.14433C8.94251 6.23434 8.9992 6.35909 8.99999 6.49708L8.99999 6.49738" fill="currentColor"></path></svg>

                        }
                    </button>
                </div>
                <ObjectTransformControls />
            </div>


        </VXUiPanelWrapper>
    )
}

const CurrentTimeVisualizer = () => {
    const currentTime = useVXAnimationStore(state => state.currentTime)
    return (
        <p>
            {parseFloat(currentTime).toFixed(2)}
        </p>
    )
}

const CursorTimeVisualzier = () => {
    const cursorTime = useTimelineEditorStore(state => state.cursorTime)
    return (
        <p>
            {parseFloat(cursorTime).toFixed(2)}
        </p>
    )
}

const ScrollLeftVisualizer = () => {
    const scrollLeft = useTimelineEditorStore(state => state.scrollLeft)
    return (
        <p>
            {parseFloat(scrollLeft).toFixed(2)}
        </p>
    )
}


const FrequentStateVisualizer = () => {
    return (
        <div className="fixed left-[300px] top-[100px] w-60  text-sm bg-neutral-900 
                            gap-2 bg-opacity-70 border-neutral-800 border-[1px] rounded-lg p-2 ">
            <div className="flex flex-tow">
                STATE_currentTime &nbsp;&nbsp;
                 <CurrentTimeVisualizer />
            </div>
            <div className="flex flex-row">
                STATE_cursorTime &nbsp;&nbsp;
                 <CursorTimeVisualzier />
            </div>
          
            <div className="flex flex-row">
                STATE_scrollLeft &nbsp;&nbsp;
                 <ScrollLeftVisualizer />
            </div>
        </div>
    )
}


const TimelineEditorDebug = () => {
    const editorData = useTimelineEditorStore(state => state.editorData);
    const rawEditorDataString = JSON.stringify(editorData, null, 2)
    const [ attachedState, setAttachedState ] = useState(true);
    return (
        <VXUiPanelWrapper
            title="VXEngine: TimelineEditorDebug"
            windowClasses='width=717,height=450,left=200,top=200,resizable=0'
            attachedState={attachedState}
            setAttachedState={setAttachedState}
        >
            <div className={`fixed backdrop-blur-sm ${attachedState ? "top-[40%] left-[300px]": "top-1 left-1 "} text-sm bg-neutral-900 p-2 gap-2
                                bg-opacity-70 border-neutral-800 border-[1px] rounded-3xl flex flex-col`}>
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
                        {rawEditorDataString}
                    </pre>
                </div>
                <button className={"bg-transparent border ml-auto text-xs p-1 h-fit w-fit flex hover:bg-neutral-800 border-neutral-600 rounded-2xl cursor-pointer "}
                        onClick={() => setAttachedState(!attachedState)}
                    >
                        {attachedState
                            ? <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M12 13C12.5523 13 13 12.5523 13 12V3C13 2.44771 12.5523 2 12 2H3C2.44771 2 2 2.44771 2 3V6.5C2 6.77614 2.22386 7 2.5 7C2.77614 7 3 6.77614 3 6.5V3H12V12H8.5C8.22386 12 8 12.2239 8 12.5C8 12.7761 8.22386 13 8.5 13H12ZM9 6.5C9 6.5001 9 6.50021 9 6.50031V6.50035V9.5C9 9.77614 8.77614 10 8.5 10C8.22386 10 8 9.77614 8 9.5V7.70711L2.85355 12.8536C2.65829 13.0488 2.34171 13.0488 2.14645 12.8536C1.95118 12.6583 1.95118 12.3417 2.14645 12.1464L7.29289 7H5.5C5.22386 7 5 6.77614 5 6.5C5 6.22386 5.22386 6 5.5 6H8.5C8.56779 6 8.63244 6.01349 8.69139 6.03794C8.74949 6.06198 8.80398 6.09744 8.85143 6.14433C8.94251 6.23434 8.9992 6.35909 8.99999 6.49708L8.99999 6.49738" fill="currentColor"></path></svg>
                            : <svg className='rotate-180' width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M12 13C12.5523 13 13 12.5523 13 12V3C13 2.44771 12.5523 2 12 2H3C2.44771 2 2 2.44771 2 3V6.5C2 6.77614 2.22386 7 2.5 7C2.77614 7 3 6.77614 3 6.5V3H12V12H8.5C8.22386 12 8 12.2239 8 12.5C8 12.7761 8.22386 13 8.5 13H12ZM9 6.5C9 6.5001 9 6.50021 9 6.50031V6.50035V9.5C9 9.77614 8.77614 10 8.5 10C8.22386 10 8 9.77614 8 9.5V7.70711L2.85355 12.8536C2.65829 13.0488 2.34171 13.0488 2.14645 12.8536C1.95118 12.6583 1.95118 12.3417 2.14645 12.1464L7.29289 7H5.5C5.22386 7 5 6.77614 5 6.5C5 6.22386 5.22386 6 5.5 6H8.5C8.56779 6 8.63244 6.01349 8.69139 6.03794C8.74949 6.06198 8.80398 6.09744 8.85143 6.14433C8.94251 6.23434 8.9992 6.35909 8.99999 6.49708L8.99999 6.49738" fill="currentColor"></path></svg>

                        }
                    </button>
            </div>
        </VXUiPanelWrapper>
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
                <TimelineEditorUI />
                <TimelineTools
                    visible={timelineEditorOpen}
                />
            </motion.div>


        </VXUiPanelWrapper>

    )
}