import React, { useEffect, useRef, useState } from 'react'
import { TimelineVisualEditor } from './components/TimelinevisualEditor'
import { cloneDeep } from 'lodash';
import { RefreshCcw, PlayFill, PauseFill, Square, ChevronRight, Navigation2, SkipBack, SkipForward } from "@geist-ui/icons"
import { AnimatePresence, motion } from "framer-motion"
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from 'vxengine/components/shadcn/select';
import { Slider } from 'vxengine/components/shadcn/slider';
import { Switch } from 'vxengine/components/shadcn/switch';
import { TimelineEffect } from 'vxengine/AnimationEngine/interface/effect';
import { TimelineAction, TimelineRow, TimelineState } from 'vxengine/AnimationEngine/interface/timeline';
import { useVXEngine } from 'vxengine/engine';
import { ITrack } from 'vxengine/AnimationEngine/types/track';
import { useVXTimelineStore } from 'vxengine/store/TimelineStore';
import useAnimationEngineEvent from 'vxengine/AnimationEngine/utils/useAnimationEngineEvent';
import { useTimelineEditorStore } from './store';
import { useVXObjectStore } from 'vxengine/store';

export const scaleWidth = 160;
export const scale = 5;


const TimelineEditorUI: React.FC<{
    visible: boolean,
    setVisible: React.Dispatch<React.SetStateAction<boolean>>
}> = ({ visible, setVisible }) => {
    const { setScale, setSnap, snap, scale } = useTimelineEditorStore();

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
                <TimelineTrackList />
                <TimelineVisualEditor />
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
                        {/* <div className='flex flex-row font-sans-menlo gap-2'>
                            <p>Scale</p>
                            <Slider
                                defaultValue={[50]}
                                max={100}
                                step={1}
                                className='w-52'
                            />
                        </div> */}
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    )
}

export default TimelineEditorUI


export const TimelineTrackList = () => {
    const { editorData } = useTimelineEditorStore();
    const { objects } = useVXObjectStore();

    // Helper function to group tracks by their parent keys
    const groupTracksByParent = (tracks: ITrack[]) => {
        const groupedTracks: Record<string, any> = {};

        tracks.forEach((track) => {
            const pathSegments = track.propertyPath.split('.');

            let currentGroup = groupedTracks;

            pathSegments.forEach((key, index) => {
                if (!currentGroup[key]) {
                    currentGroup[key] = { children: {}, track: null };
                }

                if (index === pathSegments.length - 1) {
                    currentGroup[key].track = track;
                } else {
                    currentGroup = currentGroup[key].children;
                }
            });
        });

        return groupedTracks;
    };

    const renderGroupedTracks = (groupedTracks: Record<string, any>, depth = 1, shouldIndent = false) => {
        return Object.entries(groupedTracks).map(([key, group]) => {
            const hasChildren = group.children && Object.keys(group.children).length > 0;
    
            // Determine if the group has multiple children
            const isColGroup = hasChildren && Object.keys(group.children).length > 1;
    
            const isFinalGroup = hasChildren && Object.values(group.children).every(
                (child: any) => child.track && (!child.children || Object.keys(child.children).length === 0)
            );
    
            // Determine if padding should be added based on sibling relationships
            const shouldIndentChildren = isColGroup && !group.track && !isFinalGroup ;

            // console.log(key, " isColGroup", isColGroup, " hasChildren", hasChildren, " shouldIndent", shouldIndentChildren);
    
            return (
                <div key={key} className={`${key} w-full flex ${isColGroup ? "flex-col" : "flex-row"}`} style={{paddingLeft: shouldIndent && 16}}>
                    <div className={`h-8 flex items-center`} style={{ marginLeft: group.track ? "auto" : undefined }}>
                        <p className={`${group.track ? 'text-neutral-500' : 'font-bold'} mr-2`}>
                            {key}
                        </p>
                        {group.track && (
                            <div>
                                <button>(key)</button>
                            </div>
                        )}
                    </div>
                    {!group.track && hasChildren && renderGroupedTracks(group.children, depth + 1, shouldIndentChildren)}
                </div>
            );
        });
    };

    return (
        <div className="bg-neutral-950 mr-2 mt-[34px] w-fit text-xs rounded-2xl py-2 px-4">
            {editorData?.map(({ vxkey, tracks }) => {
                const object = objects[vxkey];
                const groupedTracks = groupTracksByParent(tracks);

                return (
                    <div key={vxkey} className="flex flex-col ">
                        <div className='h-8 bg-neutral-900 flex'>
                            <p className="font-bold h-auto my-auto text-white">{object?.name}</p>
                        </div>
                        <div className="flex flex-col rounded-md">
                            {renderGroupedTracks(groupedTracks, 0, true)}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

const ProgressionControls = () => {
    const { animationEngine } = useVXEngine();
    const { isPlaying } = useVXTimelineStore()

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
    const { currentTime } = useVXTimelineStore();
    const float = (parseInt((currentTime % 1) * 100 + '') + '').padStart(2, '0');
    const min = (parseInt(currentTime / 60 + '') + '').padStart(2, '0');
    const second = (parseInt((currentTime % 60) + '') + '').padStart(2, '0');
    return <>{`${min}:${second}.${float.replace('0.', '')}`}</>;
};

export const TimelineSelect = () => {
    const { timelines, currentTimeline } = useVXTimelineStore();
    const { animationEngine } = useVXEngine();

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
                            <svg width="24" height="24" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M11.5 3.04999C11.7485 3.04999 11.95 3.25146 11.95 3.49999V7.49999C11.95 7.74852 11.7485 7.94999 11.5 7.94999C11.2515 7.94999 11.05 7.74852 11.05 7.49999V4.58639L4.58638 11.05H7.49999C7.74852 11.05 7.94999 11.2515 7.94999 11.5C7.94999 11.7485 7.74852 11.95 7.49999 11.95L3.49999 11.95C3.38064 11.95 3.26618 11.9026 3.18179 11.8182C3.0974 11.7338 3.04999 11.6193 3.04999 11.5L3.04999 7.49999C3.04999 7.25146 3.25146 7.04999 3.49999 7.04999C3.74852 7.04999 3.94999 7.25146 3.94999 7.49999L3.94999 10.4136L10.4136 3.94999L7.49999 3.94999C7.25146 3.94999 7.04999 3.74852 7.04999 3.49999C7.04999 3.25146 7.25146 3.04999 7.49999 3.04999L11.5 3.04999Z" fill="currentColor" fill-rule="evenodd" clip-rule="evenodd"></path></svg>
                        </button>
                        <button className={"bg-neutral-950 border hover:bg-neutral-800 border-neutral-600 p-1 rounded-lg cursor-pointer "}

                        >
                            <svg width="24" height="24" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M11.5 3.04999C11.7485 3.04999 11.95 3.25146 11.95 3.49999V7.49999C11.95 7.74852 11.7485 7.94999 11.5 7.94999C11.2515 7.94999 11.05 7.74852 11.05 7.49999V4.58639L4.58638 11.05H7.49999C7.74852 11.05 7.94999 11.2515 7.94999 11.5C7.94999 11.7485 7.74852 11.95 7.49999 11.95L3.49999 11.95C3.38064 11.95 3.26618 11.9026 3.18179 11.8182C3.0974 11.7338 3.04999 11.6193 3.04999 11.5L3.04999 7.49999C3.04999 7.25146 3.25146 7.04999 3.49999 7.04999C3.74852 7.04999 3.94999 7.25146 3.94999 7.49999L3.94999 10.4136L10.4136 3.94999L7.49999 3.94999C7.25146 3.94999 7.04999 3.74852 7.04999 3.49999C7.04999 3.25146 7.25146 3.04999 7.49999 3.04999L11.5 3.04999Z" fill="currentColor" fill-rule="evenodd" clip-rule="evenodd"></path></svg>
                        </button>

                    </div>
                    <div className='pt-2'>

                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}