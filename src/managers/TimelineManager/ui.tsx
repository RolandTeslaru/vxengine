// VXEngine - VEXR Labs' proprietary toolset for React Three Fiber
// (c) 2024 VEXR Labs. All Rights Reserved.
// See the LICENSE file in the root directory of this source tree for licensing information.

import React, { useEffect, useRef, useState } from 'react'
import ChevronRight from "@geist-ui/icons/chevronRight"
import Navigation2 from "@geist-ui/icons/navigation2"

import { AnimatePresence, motion } from "framer-motion"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@vxengine/components/shadcn/select';
import { Slider } from '@vxengine/components/shadcn/slider';
import { Switch } from '@vxengine/components/shadcn/switch';
import { useVXEngine } from '@vxengine/engine';
import { useTimelineEditorAPI } from './store';
import TrackVerticalList from './components/TrackVerticalList';
import TimelineArea from './components/TimelineArea';
import { useUIManagerAPI } from "@vxengine/managers/UIManager/store"
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@vxengine/components/shadcn/Resizeable';
import { useAnimationEngineAPI } from '@vxengine/AnimationEngine/store';
import { Input } from '@vxengine/components/shadcn/input';
import ProgressionControls from './components/ProgressionControls';
import { MenubarItem, MenubarSub, MenubarSubContent, MenubarSubTrigger } from '@vxengine/components/shadcn/menubar';
import { DIALOG_createKeyframe, DIALOG_createStaticProp, DIALOG_makePropertyStatic, DIALOG_makePropertyTracked, DIALOG_moveToNextKeyframe, DIALOG_moveToPreviousKeyframe, DIALOG_removeKeyframe, DIALOG_removeStaticProp, DIALOG_setKeyframeTime, DIALOG_setKeyframeValue, DIALOG_setStaticPropValue } from './components/dialogs';

export const scaleWidth = 160;
export const scale = 5;

interface Props{
    id: string
}

export const TimelineEditorUI = React.memo(({id}: Props) => {
    const timelineEditorAttached = useUIManagerAPI(state =>state.getAttachmentState(id))

    return (
        <>
            {/*  H E A D E R */}
            <div className={`flex flex-row gap-2 w-full  
                            ${timelineEditorAttached ? "pr-2" : "px-2"}`}
            >
                <MinimizeButton id={id}/>

                <p className='font-sans-menlo text-sm my-auto h-auto'>
                    Timeline Editor
                </p>

                <TimelineSelect />

                <ProgressionControls />
            </div>

            {/* M A I N  */}
            <TimelineEditorContent />

            {/* F O O T E R */}
            <TimelineEditorFooter />
        </>
    )
})

const MinimizeButton = ({id}: {id: string}) => {
    const timelineEditorAttached = useUIManagerAPI(state => state.getAttachmentState(id))
    const setOpen = useUIManagerAPI(state => state.setTimelineEditorOpen)
    const open = useUIManagerAPI(state => state.timelineEditorOpen);

    if (!timelineEditorAttached) return null;

    return (
        <button
            className={"h-7 w-7 flex hover:bg-neutral-800 rounded-2xl cursor-pointer "}
            onClick={() => setOpen(!open)}
        >
            <ChevronRight className={`${open === true && " rotate-90 "}  scale-[90%] m-auto`} />
        </button>
    )
}

const TimelineEditorContent = () => {
    return (
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
    )
}

const shouldIgnoreKeyEvent = (event: KeyboardEvent): boolean => {
    const selectedWindow = useUIManagerAPI.getState().selectedWindow;

    if (selectedWindow !== "VXEngineTimelinePanel") {
        return true;
    }

    const target = event.target as HTMLElement;
    if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)) {
        return true;
    }

    return false;
}

const TimelineEditorFooter = () => {
    const setCurrentTimelineLength = useTimelineEditorAPI(state => state.setCurrentTimelineLength)
    const currentTimelineLength = useTimelineEditorAPI(state => state.currentTimelineLength)
    const createKeyframe = useTimelineEditorAPI(state => state.createKeyframe);
    const setSnap = useTimelineEditorAPI(state => state.setSnap)
    const snap = useTimelineEditorAPI(state => state.snap);

    const open = useUIManagerAPI(state => state.timelineEditorOpen)

    const handleTimelineLengthChange = (e: any) => {
        const value = e.target.value;
        setCurrentTimelineLength(value);
    }

    useEffect(() => {
        const handleCopy = (event: KeyboardEvent) => {
            if (shouldIgnoreKeyEvent(event))
                return

            if ((event.ctrlKey || event.metaKey) && event.key === "c") {
                const selectedKeyframeKeys = useTimelineEditorAPI.getState().selectedKeyframeKeys
                const setClipboard = useTimelineEditorAPI.getState().setClipboard;
                setClipboard(selectedKeyframeKeys);
            }
        }

        window.addEventListener('keydown', handleCopy);
        return () => window.removeEventListener("keydown", handleCopy);
    }, [])

    useEffect(() => {
        const handlePaste = (event: KeyboardEvent) => {
            if (shouldIgnoreKeyEvent(event))
                return

            if ((event.ctrlKey || event.metaKey) && event.key === "v") {
                const clipboard = useTimelineEditorAPI.getState().clipboard;
                const selectedKeyframes = clipboard.map((key, index) => {
                    return useTimelineEditorAPI.getState().getKeyframe(key);
                })
                selectedKeyframes.forEach((keyframe) => {
                    const { vxkey, propertyPath, value } = keyframe
                    createKeyframe({
                        trackKey: `${vxkey}.${propertyPath}`,
                        value
                    })
                })
            }
        }

        window.addEventListener("keydown", handlePaste);
        return () => window.removeEventListener("keydown", handlePaste);
    })

    return (
        <AnimatePresence>
            {open && (
                <motion.div className='mt-auto relative pl-2 flex flex-row gap-2 font-sans-menlo'
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                    <ScaleSlider />
                    <div className='flex flex-row gap-2'>
                        <p className='text-xs h-auto my-auto'>Snap</p>
                        <Switch
                            className='my-auto scale-75'
                            onClick={() => setSnap(!snap)}
                            checked={snap}
                        />
                    </div>
                    <div className='flex flex-row h-fit text-xs gap-2'>
                        <p className='h-auto my-auto'>length</p>
                        <Input className='p-1 text-xs my-auto h-fit w-16'
                            value={currentTimelineLength}
                            onChange={handleTimelineLengthChange}
                            type='number'
                        ></Input>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}

const ScaleSlider = () => {
    const scale = useTimelineEditorAPI(state => state.scale);
    const setScale = useTimelineEditorAPI(state => state.setScale);

    return (
        <div className='flex flex-row gap-2'>
            <p className='text-xs h-auto my-auto w-20 whitespace-nowrap'>Scale {scale}</p>
            <Slider
                defaultValue={[scale]}
                max={20}
                step={0.1}
                min={0.1}
                className='w-24 my-auto'
                onValueChange={(value) => {
                    setScale(value[0])
                }}
            />
        </div>
    )
}

export const TimelineSelect = () => {
    const currentTimelineID = useAnimationEngineAPI(state => state.currentTimelineID);
    const timelines = useAnimationEngineAPI(state => state.timelines)

    const animationEngine = useVXEngine(state => state.animationEngine)

    return (
        <Select
            defaultValue={currentTimelineID}
            onValueChange={(value) => {
                animationEngine.setCurrentTimeline(value)
            }}
            value={currentTimelineID}
        >
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


export const TimelineManagerSubMenu = () => {
    const pushDialog = useUIManagerAPI(state => state.pushDialog);

    return (
        <MenubarSub>
            <MenubarSubTrigger>Timeline Editor API</MenubarSubTrigger>
            <MenubarSubContent>
                {/* Keyframe sub menu */}
                <MenubarSub>
                    <MenubarSubTrigger>Keyframe</MenubarSubTrigger>
                    <MenubarSubContent>
                        <MenubarItem onClick={() => pushDialog(<DIALOG_createKeyframe/>, "normal")}>Create Keyframe</MenubarItem>
                        <MenubarItem onClick={() => pushDialog(<DIALOG_setKeyframeTime/>, "normal")}>Set Keyframe Time</MenubarItem>
                        <MenubarItem onClick={() => pushDialog(<DIALOG_setKeyframeValue/>, "normal")}>Set Keyframe Value</MenubarItem>
                        <MenubarItem onClick={() => pushDialog(<DIALOG_removeKeyframe/>, "normal")}>Remove Keyframe</MenubarItem>
                    </MenubarSubContent>
                </MenubarSub>
                {/* Static Prop Sub menu */}
                <MenubarSub>
                    <MenubarSubTrigger>StaticProp</MenubarSubTrigger>
                    <MenubarSubContent>
                        <MenubarItem onClick={() => pushDialog(<DIALOG_createStaticProp/>, "normal")}>
                            Create StaticProp
                        </MenubarItem>
                        <MenubarItem onClick={() => pushDialog(<DIALOG_setStaticPropValue/>, "normal")}>
                            Set StaticProp Value
                        </MenubarItem>
                        <MenubarItem onClick={() => pushDialog(<DIALOG_removeStaticProp/>, "normal")}>
                            Remove StaticProp
                        </MenubarItem>
                    </MenubarSubContent>
                </MenubarSub>
                {/* Get */}
                <MenubarSub>
                    <MenubarSubTrigger>Get</MenubarSubTrigger>
                    <MenubarSubContent>
                        <MenubarItem>get Track</MenubarItem>
                        <MenubarItem>get Keyframe</MenubarItem>
                        <MenubarItem>get StaticProp</MenubarItem>
                        <MenubarItem>get Tracks For Object</MenubarItem>
                        <MenubarItem>get StaticProps For Object</MenubarItem>
                        <MenubarItem>get Keyframes For Track</MenubarItem>
                    </MenubarSubContent>
                </MenubarSub>
                {/* Move Cursor */}
                <MenubarSub>
                    <MenubarSubTrigger>Move Cursor</MenubarSubTrigger>
                    <MenubarSubContent>
                        <MenubarItem onClick={() => pushDialog(<DIALOG_moveToNextKeyframe/>, "normal")}>
                            Move To Next Keyframe
                        </MenubarItem>
                        <MenubarItem onClick={() => pushDialog(<DIALOG_moveToPreviousKeyframe/>, "normal")}>
                            Move To Previous Keyframe
                        </MenubarItem>
                    </MenubarSubContent>
                </MenubarSub>
                {/* Make */}
                <MenubarSub>
                    <MenubarSubTrigger>Make</MenubarSubTrigger>
                    <MenubarSubContent>
                        <MenubarItem onClick={() => pushDialog(<DIALOG_makePropertyTracked/>, "normal")}>
                            Make Property Tracked
                        </MenubarItem>
                        <MenubarItem onClick={() => pushDialog(<DIALOG_makePropertyStatic/>, "normal")}>
                            Make Property Static
                        </MenubarItem>
                    </MenubarSubContent>
                </MenubarSub>
            </MenubarSubContent>
        </MenubarSub>
    )
}
