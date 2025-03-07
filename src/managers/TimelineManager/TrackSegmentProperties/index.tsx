import React, { useEffect, useMemo } from 'react'
import BezierCurveEditor from '@vxengine/managers/TimelineManager/TrackSegmentProperties/components/BezierCurveEditor'
import CollapsiblePanel from '@vxengine/core/components/CollapsiblePanel'
import { useTimelineManagerAPI } from '../store'
import { Input } from '@vxengine/components/shadcn/input'
import { useTimelineEditorAPI } from '../TimelineEditor/store'
import { create } from 'zustand'
import { CurveStoreProps } from './types'

const TrackSegmentProperties = React.memo(() => {
    const selectedTrackSegment = useTimelineEditorAPI(state => state.selectedTrackSegment)

    return (
        <>
            {selectedTrackSegment?.trackKey &&
                <CollapsiblePanel
                    title="Track Segment Props."
                    contentClassName='gap-2 '
                >
                    <TrackSegmentEditor trackSegment={selectedTrackSegment} />
                    <p className='font-roboto-mono text-xs font-medium antialiased text-neutral-300'>{`trackKey: ${selectedTrackSegment?.trackKey}`}</p>
                </CollapsiblePanel>
            }
        </>
    )
})
export default TrackSegmentProperties

export const createCurveStore = (defaultValues) =>
    create<CurveStoreProps>((set) => ({
        value: defaultValues,
        movingStartHandle: false,
        movingEndHandle: false,
        movingStartHandleStart: { x: 0, y: 0 },
        movingEndHandleStart: { x: 0, y: 0 },

        setValue: (newValue) => set({ value: newValue }),
        setMovingStartHandle: (isMoving) => set({ movingStartHandle: isMoving }),
        setMovingEndHandle: (isMoving) => set({ movingEndHandle: isMoving }),
        setMovingStartHandleStart: (coords) => set({ movingStartHandleStart: coords }),
        setMovingEndHandleStart: (coords) => set({ movingEndHandleStart: coords }),
    }));


interface Props {
    trackSegment: {
        firstKeyframeKey: string;
        secondKeyframeKey: string;
        trackKey: string;
    }
}

export const TrackSegmentEditor: React.FC<Props> = ({ trackSegment }) => {
    const setKeyframeHandles = useTimelineManagerAPI(state => state.setKeyframeHandles)
    const trackKey = trackSegment.trackKey

    const firstKeyframe = useTimelineManagerAPI(state => state.tracks[trackKey]?.keyframes[trackSegment.firstKeyframeKey])
    const secondKeyframe = useTimelineManagerAPI(state => state.tracks[trackKey]?.keyframes[trackSegment.secondKeyframeKey])

    const defaultHandleLeft = { x: 0.3, y: 0.3 };   // bottom left thing
    const defaultHandleRight = { x: 0.7, y: 0.7 };  // top right thing

    const firstKeyframeOutHandle = firstKeyframe?.handles?.out || defaultHandleLeft
    const firstKeyframeInHandle = firstKeyframe?.handles?.in || defaultHandleRight
    const secondKeyframeInHandle = secondKeyframe?.handles?.in || defaultHandleRight
    const secondKeyframeOutHandle = secondKeyframe?.handles?.out || defaultHandleLeft

    const handleOnCurveChange = (value: [number, number, number, number]) => {
        let [outHandleX, outHandleY, inHandleX, inHandleY] = value;
        // out handles are the left bottom ones
        // in handles are the right top ones

        const truncateToTwoDecimals = (num: number) => {
            return Math.round(num * 100) / 100;
        };

        outHandleX = truncateToTwoDecimals(outHandleX);
        outHandleY = truncateToTwoDecimals(outHandleY);
        inHandleX = truncateToTwoDecimals(inHandleX);
        inHandleY = truncateToTwoDecimals(inHandleY);

        // update first keyframe
        setKeyframeHandles(
            trackSegment?.firstKeyframeKey,
            trackSegment?.trackKey,
            firstKeyframeInHandle,
            { x: outHandleX, y: outHandleY },
            false
        );

        // update second keyframe
        setKeyframeHandles(
            trackSegment?.secondKeyframeKey,
            trackSegment?.trackKey,
            { x: inHandleX, y: inHandleY },
            secondKeyframeOutHandle,
            true
        );
    };

    return (
        <div className='flex flex-row gap-2'>
            <div className='border w-[150px] border-neutral-300/10 bg-neutral-800/20 shadow-black/20 shadow-md py-2 rounded-lg'>
                <BezierCurveEditor
                    size={130}
                    outerAreaSize={0}
                    handleLineStrokeWidth={2}
                    borderRadiusContainer={8}
                    handleLineColor={"#64B5FF"}
                    onChange={handleOnCurveChange}
                    value={[
                        firstKeyframeOutHandle.x, firstKeyframeOutHandle.y,
                        secondKeyframeInHandle.x, secondKeyframeInHandle.y
                    ]}
                />
            </div>
            <div className='flex flex-col justify-between'>
                <div className='flex flex-col gap-2'>
                    <Input
                        className="h-fit text-[10px] p-0.5 w-10"
                        max={1}
                        min={0}
                        step={0.1}
                        type='number'
                        value={firstKeyframeOutHandle.x}
                        onChange={(e: any) => {
                            setKeyframeHandles(
                                trackSegment?.firstKeyframeKey,
                                trackSegment?.trackKey,
                                { x: firstKeyframeInHandle.x, y: firstKeyframeInHandle.y },
                                { x: e.target.value, y: firstKeyframeOutHandle.y },
                                true
                            )

                        }}
                    />
                    <Input
                        className="h-fit text-[10px] p-0.5 w-10"
                        max={1}
                        min={0}
                        step={0.1}
                        type='number'
                        value={firstKeyframeOutHandle.y}
                        onChange={(e: any) => {
                            setKeyframeHandles(
                                trackSegment?.firstKeyframeKey,
                                trackSegment?.trackKey,
                                { x: firstKeyframeInHandle.x, y: firstKeyframeInHandle.y },
                                { x: firstKeyframeOutHandle.x, y: e.target.value },
                                true
                            )
                        }}
                    />
                </div>
                <div className='flex flex-col gap-2 ml-auto'>
                    <Input
                        className="h-fit text-[10px] p-0.5 w-10"
                        max={1}
                        min={0}
                        step={0.1}
                        type='number'
                        value={secondKeyframeInHandle.x}
                        onChange={(e: any) => {
                            setKeyframeHandles(
                                trackSegment?.secondKeyframeKey,
                                trackSegment?.trackKey,
                                { x: e.target.value, y: secondKeyframeInHandle.y },
                                { x: secondKeyframeOutHandle.x, y: secondKeyframeOutHandle.y },
                                true
                            )
                        }}
                    />
                    <Input
                        className="h-fit text-[10px] p-0.5 w-10"
                        max={1}
                        min={0}
                        step={0.1}
                        type='number'
                        value={secondKeyframeInHandle.y}
                        onChange={(e: any) => {
                            setKeyframeHandles(
                                trackSegment?.secondKeyframeKey,
                                trackSegment?.trackKey,
                                { x: secondKeyframeInHandle.x, y: e.target.value },
                                { x: secondKeyframeOutHandle.x, y: secondKeyframeOutHandle.y },
                                true
                            )
                        }}
                    />
                </div>

            </div>
        </div>
    )
}

