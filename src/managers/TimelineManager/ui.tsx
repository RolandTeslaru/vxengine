// VXEngine - VEXR Labs' proprietary toolset for React Three Fiber
// (c) 2024 VEXR Labs. All Rights Reserved.
// See the LICENSE file in the root directory of this source tree for licensing information.

import React, { useEffect, useRef, useState } from 'react'
import { cloneDeep } from 'lodash';
import { RefreshCcw, PlayFill, PauseFill, Square, ChevronRight, Navigation2, SkipBack, SkipForward, ChevronLeft } from "@geist-ui/icons"
import { AnimatePresence, motion } from "framer-motion"
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from 'vxengine/components/shadcn/select';
import { Slider } from 'vxengine/components/shadcn/slider';
import { Switch } from 'vxengine/components/shadcn/switch';
import { TimelineEffect } from 'vxengine/AnimationEngine/interface/effect';
import { TimelineAction, TimelineRow, TimelineState } from 'vxengine/AnimationEngine/interface/timeline';
import { useVXEngine } from 'vxengine/engine';
import { IEditorData, ITrack } from 'vxengine/AnimationEngine/types/track';
import useAnimationEngineEvent from 'vxengine/AnimationEngine/utils/useAnimationEngineEvent';
import { useTimelineEditorStore } from './store';
import { useVXObjectStore } from 'vxengine/store';
import { useShallow } from 'zustand/react/shallow'
import { shallow } from 'zustand/shallow';
import { StoredObjectProps } from 'vxengine/types/objectStore';
import { handleSetCursor } from './utils/handleSetCursor';
import TrackVerticalList from './components/TrackVerticalList';
import TimelineEditor from './components/TimelineEditor';
import { useVXAnimationStore } from 'vxengine/store/AnimationStore';

export const scaleWidth = 160;
export const scale = 5;


const TimelineEditorUI: React.FC<{
    visible: boolean,
    setVisible: React.Dispatch<React.SetStateAction<boolean>>
}> = ({ visible, setVisible }) => {
    const { setScale, setSnap, snap, scale } = useTimelineEditorStore(state => ({
        setScale: state.setScale,
        setSnap: state.setSnap,
        snap: state.snap,
        scale: state.scale
    }), shallow);

    return (
        <>
            <div className="flex flex-row gap-2 w-full min-w-[800px] pr-2 ">
                <button className={" h-7 w-7 flex hover:bg-neutral-800 rounded-2xl cursor-pointer "}
                    onClick={() => setVisible(!visible)}
                >
                    <ChevronRight className={`${visible === true && " rotate-90 "}  scale-[90%] m-auto`} />
                </button>

                <p className='font-sans-menlo text-sm my-auto h-auto'>
                    Timeline Editor
                </p>

                <TimelineSelect />

                <ProgressionControls />
            </div>
            <div className='relative flex flex-row  overflow-hidden'>
                <TrackVerticalList />
                <TimelineEditor />
            </div>
            <AnimatePresence>
                {visible && (
                    <motion.div className='relative px-2 flex flex-row gap-2 font-sans-menlo'
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <div className='flex flex-row gap-2'>
                            <p className='text-xs'>Scale {scale}</p>
                            <Slider
                                defaultValue={[scale]}
                                max={10}
                                step={0.5}
                                min={0.0}
                                className='w-52'
                                onValueChange={(value) => {
                                    setScale(value[0])
                                }}
                            />
                        </div>
                        <div className='flex flex-row gap-2'>
                            <p className='text-xs'>Snap</p>
                            <Switch onClick={() => setSnap(!snap)} checked={snap} />
                        </div>
                        <div className='flex flex-row font-sans-menlo gap-2'>
                            <p>Counts</p>
                            <Slider
                                defaultValue={[50]}
                                max={100}
                                step={1}
                                className='w-52'
                            />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    )
}

export default TimelineEditorUI

const tree = [{
    name: "RedBox",
    files: [
        {
            name: "material.thing1",
            files: [
                {
                    name: "thing2",
                    tracks: [
                        {
                            name: "value1",
                            value: 1,
                        },
                        {
                            name: "value2",
                            value: 2,
                        }
                    ]
                },
                {
                    name: "thing3.thing4",
                    tracks: [
                        {
                            name: "value",
                            value: 1
                        }
                    ]
                }
            ]
        },
        {
            name: "position",
            tracks: [
                {
                    name: "x",
                    value: 1
                },
                {
                    name: "y",
                    value: 1
                },
                {
                    name: "z",
                    value: 1
                }
            ]
        }
    ]
}]

const getFileTree = (editorData: IEditorData[], objects) => {
    const tree = editorData.map((objectData) => {
        const { vxkey, tracks } = objectData;
        if (objects[vxkey] === undefined) return;
        const masterObjectName = objects[vxkey].name;

        // Initialize the root node for the object
        const rootNode = {
            name: masterObjectName,
            files: [],
        };

        // Helper function to group tracks by their parent keys
        const groupTracksByParent = (tracks: ITrack[]) => {
            const groupedTracks: Record<string, any> = {};

            tracks.forEach((track) => {
                const pathSegments = track.propertyPath.split('.');

                let currentGroup = groupedTracks;

                pathSegments.forEach((key, index) => {
                    if (!currentGroup[key]) {
                        currentGroup[key] = { children: {}, tracks: [] };
                    }

                    if (index === pathSegments.length - 1) {
                        currentGroup[key].tracks.push({
                            name: key,
                            value: track,
                        });
                    } else {
                        currentGroup = currentGroup[key].children;
                    }
                });
            });

            return groupedTracks;
        };

        // Convert the grouped tracks into the file tree format
        const convertToFileTree = (groupedTracks: Record<string, any>) => {
            return Object.entries(groupedTracks).map(([key, group]) => {
                const node = {
                    name: key,
                    files: [],
                };

                if (group.tracks.length > 0) {
                    node.files = group.tracks;
                }

                if (Object.keys(group.children).length > 0) {
                    node.files.push(...convertToFileTree(group.children));
                }

                return node;
            });
        };

        // Group tracks by their parent keys
        const groupedTracks = groupTracksByParent(tracks);

        // Convert grouped tracks into the final tree structure
        rootNode.files = convertToFileTree(groupedTracks);

        return rootNode;
    });

    return tree;
};


const ProgressionControls = () => {
    const { animationEngine } = useVXEngine();
    const { isPlaying } = useVXAnimationStore(state => ({
        isPlaying: state.isPlaying
    }), shallow)

    //Start or pause
    const handlePlayOrPause = () => {
        if (isPlaying)
            animationEngine.pause();
        else
            animationEngine.play({ autoEnd: true });
    };

    const handleReset = () => { animationEngine.setCurrentTime(0, true) }

    return (
        <div className='flex flex-row gap-2 w-auto ml-auto'>
            <p className="font-sans-menlo text-lg text-center h-auto my-auto mx-2">
                <TimeRender />
            </p>
            <button className={"bg-neutral-950 border h-7 w-7 flex hover:bg-neutral-800 border-neutral-600 rounded-lg cursor-pointer "}
                onClick={handleReset}
            >
                <Square fill="white" className='scale-[65%] m-auto' />
            </button>
            <button className={"bg-neutral-950 border h-7 w-7 flex hover:bg-neutral-800 border-neutral-600 rounded-lg cursor-pointer "}
                onClick={handleReset}
            >
                <SkipBack fill="white" className='scale-[65%] m-auto' />
            </button>
            <button className={"bg-neutral-950 border h-7 w-7 flex hover:bg-neutral-800 border-neutral-600 rounded-lg cursor-pointer "}
                onClick={handlePlayOrPause}
            >
                {isPlaying ? (
                    <PauseFill className='scale-[65%] m-auto' />
                ) : (
                    <PlayFill className='scale-[65%] m-auto' />
                )}
            </button>
            <button className={"bg-neutral-950 border h-7 w-7 flex hover:bg-neutral-800 border-neutral-600 rounded-lg cursor-pointer "}
                onClick={handleReset}
            >
                <SkipForward fill="white" className='scale-[65%] m-auto' />
            </button>
        </div>
    )
}

const TimeRender = () => {
    const { currentTime } = useVXAnimationStore(state => ({ currentTime: state.currentTime }));
    const float = (parseInt((currentTime % 1) * 100 + '') + '').padStart(2, '0');
    const min = (parseInt(currentTime / 60 + '') + '').padStart(2, '0');
    const second = (parseInt((currentTime % 60) + '') + '').padStart(2, '0');
    return <>{`${min}:${second}.${float.replace('0.', '')}`}</>;
};

export const TimelineSelect = () => {
    const { currentTimeline, timelines } = useVXAnimationStore(state => ({
        currentTimeline: state.currentTimeline,
        timelines: state.timelines
    }), shallow)
    const { animationEngine } = useVXEngine()

    return (
        <Select
            defaultValue={currentTimeline.id}
            onValueChange={(value) => {
                animationEngine.setCurrentTimeline(value)
            }}>
            <SelectTrigger className="w-[180px] h-7 my-auto">
                <SelectValue placeholder="Select a Timeline" />
            </SelectTrigger>
            <SelectContent>
                <SelectGroup>
                    {timelines.map((timeline, index) =>
                        <SelectItem value={timeline.id} key={index}>{timeline.name}</SelectItem>
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