import React, { useEffect, useRef, useState } from 'react'
import { Timeline } from './components/timeline'
import { cloneDeep } from 'lodash';
import { RefreshCcw, PlayFill, PauseFill, Square, ChevronRight, Navigation2, SkipBack, SkipForward } from "@geist-ui/icons"
import { AnimatePresence, motion } from "framer-motion"
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from 'vxengine/components/shadcn/select';
import { Slider } from 'vxengine/components/shadcn/slider';
import { Switch } from 'vxengine/components/shadcn/switch';
import { TimelineEffect } from 'vxengine/AnimationEngine/interface/effect';
import { TimelineAction, TimelineRow, TimelineState } from 'vxengine/AnimationEngine/interface/timeline';

export interface CustomTimelineAction extends TimelineAction {
    data: {
        src: string;
        name: string;
    };
}

export interface CusTomTimelineRow extends TimelineRow {
    actions: CustomTimelineAction[];
}


const mockData: TimelineRow[] = [
    {
        id: "0",
        actions: [
            {
                id: "action00",
                start: 0,
                end: 2,
                effectId: "effect0",
            },
        ],
    },
    {
        id: "1",
        actions: [
            {
                id: "action10",
                start: 1.5,
                end: 5,
                effectId: "effect1",
            }
        ],
    }
]

const defaultEditorData = cloneDeep(mockData);

const mockEffect: Record<string, TimelineEffect> = {
    effect0: {
        id: "effect0",
        name: "效果0",
    },
    effect1: {
        id: "effect1",
        name: "效果1",
    },
};

export const scaleWidth = 160;
export const scale = 5;
export const startLeft = 20;

const TimelineEditor: React.FC<{
    visible: boolean,
    setVisible: React.Dispatch<React.SetStateAction<boolean>>
}> = ({ visible, setVisible }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [time, setTime] = useState(0);
    const timelineState = useRef<TimelineState>();
    const [data, setData] = useState(defaultEditorData);
    const autoScrollWhenPlay = useRef<boolean>(true);
    const [scale, setScale] = useState(1)
    const [activeTool, setActiveTool] = useState("mouse")
    const [snap, setSnap] = useState(true);

    useEffect(() => {
        if (!timelineState.current) return;
        const engine = timelineState.current;
        engine.listener.on('play', () => setIsPlaying(true));
        engine.listener.on('paused', () => setIsPlaying(false));
        engine.listener.on('afterSetTime', ({ time }) => setTime(time));
        engine.listener.on('setTimeByTick', ({ time }) => {
            setTime(time);

            if (autoScrollWhenPlay.current) {
                const autoScrollFrom = 500;
                const left = time * (scaleWidth / scale) + startLeft - autoScrollFrom;
                timelineState.current.setScrollLeft(left)
            }
        });

        return () => {
            if (!engine) return;
            engine.pause();
            engine.listener.offAll();
        };
    }, [])
    //Start or pause
    const handlePlayOrPause = () => {
        if (!timelineState.current) return;
        if (timelineState.current.isPlaying) {
            timelineState.current.pause();
        } else {
            timelineState.current.play({ autoEnd: true });
        }
    };

    const handleReset = () => {
        if (!timelineState.current) return;
        timelineState.current.setTime(0);
    }

    //Set playback rate
    const handleRateChange = (rate: number) => {
        if (!timelineState.current) return;
        timelineState.current.setPlayRate(rate);
    };

    //time display
    const timeRender = (time: number) => {
        const float = (parseInt((time % 1) * 100 + '') + '').padStart(2, '0');
        const min = (parseInt(time / 60 + '') + '').padStart(2, '0');
        const second = (parseInt((time % 60) + '') + '').padStart(2, '0');
        return <>{`${min}:${second}.${float.replace('0.', '')}`}</>;
    };

    return (
        <>
            <div className="flex flex-row gap-2 w-full pr-2 "
            >
                <button className={" h-7 w-7 flex hover:bg-neutral-800 rounded-2xl cursor-pointer "}
                    onClick={() => setVisible(!visible)}
                >
                    <ChevronRight className={`${visible === true && " rotate-90 "}  scale-[90%] m-auto`} />
                </button>
                <p className='font-sans-menlo text-sm my-auto h-auto'>
                    Timeline Editor
                </p>
                <TimelineSelect />

                <div className='flex flex-row gap-2 w-auto ml-auto'>
                    <p className="font-sans-menlo text-lg text-center h-auto my-auto mx-2">
                        {timeRender(time)}
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
            </div>
            <div className='relative flex flex-row max-h-fit overflow-hidden'>
                <div
                    style={{ overflow: 'overlay' }}
                    onScroll={(e) => {
                        const target = e.target as HTMLDivElement;
                        timelineState.current.setScrollTop(target.scrollTop);
                    }}
                    className={'timeline-list'}
                >
                    {data.map((item) => {
                        return (
                            <div className="timeline-list-item" key={item.id}>
                                <div className="text">{`row${item.id}`}</div>
                            </div>
                        );
                    })}
                </div>
                <Timeline
                    effects={mockEffect}
                    ref={timelineState}
                    onChange={(data) => setData(data as CusTomTimelineRow[])}
                    dragLine={snap}
                    scale={scale}
                />
            </div>
            <AnimatePresence>
                {visible && (
                    <motion.div className='relative px-2 flex flex-row gap-2 font-sans-menlo'
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <div className='flex flex-row gap-2'>
                            <p className='text-xs'>Scale</p>
                            <Slider
                                defaultValue={[scale]}
                                max={10}
                                step={0.5}
                                min={0.1}
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

export default TimelineEditor

export const TimelineSelect = () => {
    return (
        <Select>
            <SelectTrigger className="w-[180px] h-7 my-auto">
                <SelectValue placeholder="Select a Timeline" />
            </SelectTrigger>
            <SelectContent>
                <SelectGroup>
                    <SelectItem value="apple">Intro Timeline</SelectItem>
                    <SelectItem value="banana">Outro Timeline</SelectItem>
                    <SelectItem value="blueberry">Blueberry</SelectItem>
                    <SelectItem value="grapes">Grapes</SelectItem>
                    <SelectItem value="pineapple">Pineapple</SelectItem>
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