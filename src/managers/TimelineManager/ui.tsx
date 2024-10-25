// VXEngine - VEXR Labs' proprietary toolset for React Three Fiber
// (c) 2024 VEXR Labs. All Rights Reserved.
// See the LICENSE file in the root directory of this source tree for licensing information.

import React, { useEffect, useRef, useState } from 'react'
import { RefreshCcw, PlayFill, PauseFill, Square, ChevronRight, Navigation2, SkipBack, SkipForward, ChevronLeft } from "@geist-ui/icons"
import { AnimatePresence, motion } from "framer-motion"
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@vxengine/components/shadcn/select';
import { Slider } from '@vxengine/components/shadcn/slider';
import { Switch } from '@vxengine/components/shadcn/switch';
import { useVXEngine } from '@vxengine/engine';
import { useTimelineEditorAPI } from './store';
import { shallow } from 'zustand/shallow';
import TrackVerticalList from './components/TrackVerticalList';
import TimelineArea from './components/TimelineArea';
import { useVXUiStore } from "@vxengine/components/ui/VXUIStore"
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@vxengine/components/shadcn/Resizeable';
import { useAnimationEngineAPI } from '@vxengine/AnimationEngine/AnimationStore';
import { Input } from '@vxengine/components/shadcn/input';
import ProgressionControls from './components/ProgressionControls';

export const scaleWidth = 160;
export const scale = 5;


export const TimelineEditorUI = React.memo(() => {
    const { open, setOpen } = useVXUiStore(state => ({ open: state.timelineEditorOpen, setOpen: state.setTimelineEditorOpen }))
    const timelineEditorAttached = useVXUiStore(state => state.timelineEditorAttached)

    const currentTimelineID = useAnimationEngineAPI(state => state.currentTimelineID)

    // TODO: Fix this length
    // const handleLengthInputChange = (e) => {
    //     const newValue = e.target.value;

    //     const currentTimeline = useAnimationEngineAPI.getState().currentTimeline;

    //     const newCurrentTimeline = {
    //       ...currentTimeline,
    //       length: newValue      
    //     };

    //     useAnimationEngineAPI.setState({ currentTimeline: newCurrentTimeline });
    //   };

    return (
        <>
            {/*  H E A D E R */}
            <div className={`flex flex-row gap-2 w-full  
                            ${timelineEditorAttached ? "pr-2" : "px-2"}`}
            >
                {timelineEditorAttached &&
                    <button className={"h-7 w-7 flex hover:bg-neutral-800 rounded-2xl cursor-pointer "}
                        onClick={() => setOpen(!open)}
                    >
                        <ChevronRight className={`${open === true && " rotate-90 "}  scale-[90%] m-auto`} />
                    </button>
                }

                <p className='font-sans-menlo text-sm my-auto h-auto'>
                    Timeline Editor
                </p>

                <TimelineSelect />

                <ProgressionControls />
            </div>

            {/* M A I N  */}
            <ResizablePanelGroup
                className='relative flex flex-row w-full flex-grow overflow-hidden'
                direction='horizontal'
            >
                <ResizablePanel defaultSize={35}>
                    <div className='h-full flex flex-col overflow-hidden'>
                        <TrackVerticalList />
                    </div>
                </ResizablePanel>
                <ResizableHandle withHandle className='mx-1' />
                <ResizablePanel defaultSize={65}>
                    <TimelineArea />
                </ResizablePanel>
            </ResizablePanelGroup>

            {/* F O O T E R */}
            <TimelineEditorFooter/>
        </>
    )
})

const TimelineEditorFooter = React.memo(() => {
    const scale = useTimelineEditorAPI(state => state.scale);
    const setScale = useTimelineEditorAPI(state => state.setScale);
    const snap = useTimelineEditorAPI(state => state.snap);
    const setSnap = useTimelineEditorAPI(state => state.setSnap)
    
    const { open } = useVXUiStore(state => ({ open: state.timelineEditorOpen }))
    const setTimelineEditorAttached = useVXUiStore(state => state.setTimelineEditorAttached)
    const timelineEditorAttached = useVXUiStore(state => state.timelineEditorAttached)

    const currentTimelineID = useAnimationEngineAPI(state => state.currentTimelineID)
    const timelineLength = useAnimationEngineAPI(state => state.timelines[currentTimelineID]?.length)

    return (
        <AnimatePresence>
            {open && (
                <motion.div className='mt-auto relative pl-2 flex flex-row gap-2 font-sans-menlo'
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                    <div className='flex flex-row gap-2'>
                        <p className='text-xs h-auto my-auto'>Scale {scale}</p>
                        <Slider
                            defaultValue={[scale]}
                            max={10}
                            step={0.5}
                            min={0.0}
                            className='w-24 my-auto'
                            onValueChange={(value) => {
                                setScale(value[0])
                            }}
                        />
                    </div>
                    <div className='flex flex-row font-sans-menlo gap-2'>
                        <p className='text-xs h-auto my-auto'>Counts</p>
                        <Slider
                            defaultValue={[50]}
                            max={100}
                            step={1}
                            className='w-24 my-auto'
                        />
                    </div>
                    <div className='flex flex-row gap-2'>
                        <p className='text-xs h-auto my-auto'>Snap</p>
                        <Switch onClick={() => setSnap(!snap)} checked={snap} className='my-auto scale-75' />
                    </div>
                    <div className='flex flex-row h-fit text-xs gap-2'>
                        <p className='h-auto my-auto'>length</p>
                        <Input className='p-1 text-xs my-auto h-fit w-16'
                            value={timelineLength}
                            // onChange={handleLengthInputChange}
                            type='number'
                        ></Input>
                    </div>
                    <button className={"bg-transparent bg-opacity-70 border ml-auto text-xs p-1 h-fit w-fit flex hover:bg-neutral-800 border-neutral-600 rounded-2xl cursor-pointer "}
                        onClick={() => setTimelineEditorAttached(!timelineEditorAttached)}
                    >
                        {timelineEditorAttached
                            ? <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M12 13C12.5523 13 13 12.5523 13 12V3C13 2.44771 12.5523 2 12 2H3C2.44771 2 2 2.44771 2 3V6.5C2 6.77614 2.22386 7 2.5 7C2.77614 7 3 6.77614 3 6.5V3H12V12H8.5C8.22386 12 8 12.2239 8 12.5C8 12.7761 8.22386 13 8.5 13H12ZM9 6.5C9 6.5001 9 6.50021 9 6.50031V6.50035V9.5C9 9.77614 8.77614 10 8.5 10C8.22386 10 8 9.77614 8 9.5V7.70711L2.85355 12.8536C2.65829 13.0488 2.34171 13.0488 2.14645 12.8536C1.95118 12.6583 1.95118 12.3417 2.14645 12.1464L7.29289 7H5.5C5.22386 7 5 6.77614 5 6.5C5 6.22386 5.22386 6 5.5 6H8.5C8.56779 6 8.63244 6.01349 8.69139 6.03794C8.74949 6.06198 8.80398 6.09744 8.85143 6.14433C8.94251 6.23434 8.9992 6.35909 8.99999 6.49708L8.99999 6.49738" fill="currentColor"></path></svg>
                            : <svg className='rotate-180' width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M12 13C12.5523 13 13 12.5523 13 12V3C13 2.44771 12.5523 2 12 2H3C2.44771 2 2 2.44771 2 3V6.5C2 6.77614 2.22386 7 2.5 7C2.77614 7 3 6.77614 3 6.5V3H12V12H8.5C8.22386 12 8 12.2239 8 12.5C8 12.7761 8.22386 13 8.5 13H12ZM9 6.5C9 6.5001 9 6.50021 9 6.50031V6.50035V9.5C9 9.77614 8.77614 10 8.5 10C8.22386 10 8 9.77614 8 9.5V7.70711L2.85355 12.8536C2.65829 13.0488 2.34171 13.0488 2.14645 12.8536C1.95118 12.6583 1.95118 12.3417 2.14645 12.1464L7.29289 7H5.5C5.22386 7 5 6.77614 5 6.5C5 6.22386 5.22386 6 5.5 6H8.5C8.56779 6 8.63244 6.01349 8.69139 6.03794C8.74949 6.06198 8.80398 6.09744 8.85143 6.14433C8.94251 6.23434 8.9992 6.35909 8.99999 6.49708L8.99999 6.49738" fill="currentColor"></path></svg>

                        }
                    </button>

                </motion.div>
            )}
        </AnimatePresence>
    )
})

export const TimelineSelect = () => {
    const currentTimelineID = useAnimationEngineAPI(state => state.currentTimelineID)
    const timelines = useAnimationEngineAPI(state => state.timelines)

    const animationEngine = useVXEngine(state => state.animationEngine)

    return (
        <Select
            defaultValue={currentTimelineID}
            onValueChange={(value) => {
                animationEngine.setCurrentTimeline(value)
            }}>
            <SelectTrigger className="w-[180px] h-7 my-auto">
                <SelectValue placeholder="Select a Timeline" />
            </SelectTrigger>
            <SelectContent>
                <SelectGroup>
                    {Object.entries(timelines).map(([key, timeline]) =>
                        <SelectItem value={timeline.id} key={key}>{timeline.name}</SelectItem>
                    )}
                </SelectGroup>
            </SelectContent>
        </Select>
    )
}

export const TimelineTools: React.FC<{
    visible: boolean,
}> = ({ visible }) => {
    return (
        <AnimatePresence>
            {visible && (
                <motion.div
                    className='absolute left-[-54px] z-10 top-0 '
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0, transition: { delay: 0.3 } }}
                    exit={{ opacity: 0, x: 50 }}
                >
                    <div className=" gap-2 p-1 backdrop-blur-sm bg-neutral-900  bg-opacity-85 border-neutral-800 border-[1px] rounded-xl flex flex-col">
                        <button className={"bg-neutral-950 border pb-[5px] hover:bg-neutral-800 border-neutral-600 p-1 rounded-lg cursor-pointer "}

                        >
                            <Navigation2 fill='white' className='scale-75 ml-[-1px] mt-[-1px]  rotate-[-45deg]' />
                        </button>
                        <button className={"bg-neutral-950 border hover:bg-neutral-800 border-neutral-600 p-1 rounded-lg cursor-pointer "}

                        >
                            <svg width="24" height="24" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M11.5 3.04999C11.7485 3.04999 11.95 3.25146 11.95 3.49999V7.49999C11.95 7.74852 11.7485 7.94999 11.5 7.94999C11.2515 7.94999 11.05 7.74852 11.05 7.49999V4.58639L4.58638 11.05H7.49999C7.74852 11.05 7.94999 11.2515 7.94999 11.5C7.94999 11.7485 7.74852 11.95 7.49999 11.95L3.49999 11.95C3.38064 11.95 3.26618 11.9026 3.18179 11.8182C3.0974 11.7338 3.04999 11.6193 3.04999 11.5L3.04999 7.49999C3.04999 7.25146 3.25146 7.04999 3.49999 7.04999C3.74852 7.04999 3.94999 7.25146 3.94999 7.49999L3.94999 10.4136L10.4136 3.94999L7.49999 3.94999C7.25146 3.94999 7.04999 3.74852 7.04999 3.49999C7.04999 3.25146 7.25146 3.04999 7.49999 3.04999L11.5 3.04999Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
                        </button>
                        <button className={"bg-neutral-950 border hover:bg-neutral-800 border-neutral-600 p-1 rounded-lg cursor-pointer "}

                        >
                            <svg width="24" height="24" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M11.5 3.04999C11.7485 3.04999 11.95 3.25146 11.95 3.49999V7.49999C11.95 7.74852 11.7485 7.94999 11.5 7.94999C11.2515 7.94999 11.05 7.74852 11.05 7.49999V4.58639L4.58638 11.05H7.49999C7.74852 11.05 7.94999 11.2515 7.94999 11.5C7.94999 11.7485 7.74852 11.95 7.49999 11.95L3.49999 11.95C3.38064 11.95 3.26618 11.9026 3.18179 11.8182C3.0974 11.7338 3.04999 11.6193 3.04999 11.5L3.04999 7.49999C3.04999 7.25146 3.25146 7.04999 3.49999 7.04999C3.74852 7.04999 3.94999 7.25146 3.94999 7.49999L3.94999 10.4136L10.4136 3.94999L7.49999 3.94999C7.25146 3.94999 7.04999 3.74852 7.04999 3.49999C7.04999 3.25146 7.25146 3.04999 7.49999 3.04999L11.5 3.04999Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
                        </button>

                    </div>
                    <div className='pt-2'>

                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}