import React, { useEffect, useMemo } from 'react'
import BezierCurveEditor from '@vxengine/managers/TimelineManager/TrackSegmentProperties/components/BezierCurveEditor'
import CollapsiblePanel from '@vxengine/ui/components/CollapsiblePanel'
import { useTimelineManagerAPI } from '../store'
import { Input } from '@vxengine/ui/foundations/input'
import { useTimelineEditorAPI } from '../TimelineEditor/store'
import { create } from 'zustand'
import { CurveStoreProps } from './types'

const TrackSegmentProperties = React.memo(() => {
    const numSelectedTrackSegments = useTimelineEditorAPI(state => Object.entries(state.selectedTrackSegments).length)

    return (
        <>
            {numSelectedTrackSegments > 0 &&
                <CollapsiblePanel
                    title="Bezier Curve Editor"
                    contentClassName='gap-2 '
                >
                    <TrackSegmentEditor />
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


export const TrackSegmentEditor = () => {
    const setKeyframeHandles = useTimelineManagerAPI(state => state.setKeyframeHandles)
    const selectedTrackSegments = useTimelineEditorAPI(state => state.selectedTrackSegments)
    const selectedTrackSegmentsArray = useMemo(() => Object.values(selectedTrackSegments), [selectedTrackSegments])
    const tracks = useTimelineManagerAPI(state => state.tracks);

    const firstSelectedSegment = Object.values(selectedTrackSegments)[0]

    const firstKeyframe = tracks[firstSelectedSegment.trackKey]?.keyframes[firstSelectedSegment.firstKeyframeKey]
    const secondKeyframe = tracks[firstSelectedSegment.trackKey]?.keyframes[firstSelectedSegment.secondKeyframeKey]

    const defaultHandleLeft = { x: 0.3, y: 0.3 };   // bottom left thing
    const defaultHandleRight = { x: 0.7, y: 0.7 };  // top right thing

    const firstKeyframeOutHandle = firstKeyframe?.handles?.out || defaultHandleLeft
    const secondKeyframeInHandle = secondKeyframe?.handles?.in || defaultHandleRight

    const areHandlesInSync = useMemo(() => {
        if (selectedTrackSegmentsArray.length <= 1) return true;

        const firstOutHandle = firstKeyframeOutHandle;
        const firstInHandle = secondKeyframeInHandle;

        return selectedTrackSegmentsArray.every(segment => {
            const outHandle = tracks[segment.trackKey]?.keyframes[segment.firstKeyframeKey]?.handles?.out || defaultHandleLeft;
            const inHandle = tracks[segment.trackKey]?.keyframes[segment.secondKeyframeKey]?.handles?.in || defaultHandleRight;
            return (
                outHandle.x === firstOutHandle.x &&
                outHandle.y === firstOutHandle.y &&
                inHandle.x === firstInHandle.x &&
                inHandle.y === firstInHandle.y
            );
        });
    }, [selectedTrackSegments, tracks, firstKeyframeOutHandle, secondKeyframeInHandle]);

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

        selectedTrackSegmentsArray.forEach((_trackSegment) => {
            const _trackKey = _trackSegment.trackKey;
            const _firstKEyframeKey = _trackSegment.firstKeyframeKey
            const _secondKeyframeKey = _trackSegment.secondKeyframeKey

            const _firstKeyframe = tracks[_trackKey].keyframes[_firstKEyframeKey]
            const _secondKeyframe = tracks[_trackKey].keyframes[_secondKeyframeKey]

            const _firstKfInHandle = _firstKeyframe.handles.in || defaultHandleRight
            const _secondKfOutHandle = _secondKeyframe.handles.out || defaultHandleLeft

            setKeyframeHandles(
                _firstKEyframeKey,
                _trackKey,
                _firstKfInHandle,
                { x: outHandleX, y: outHandleY },
                false
            )

            setKeyframeHandles(
                _secondKeyframeKey,
                _trackKey,
                { x: inHandleX, y: inHandleY },
                _secondKfOutHandle,
                false
            )
        })
    };

    // Generic function to update a specific handle component across all segments
    const updateHandle = (
        handleType: 'firstOutX' | 'firstOutY' | 'secondInX' | 'secondInY',
        newValue: number
    ) => {
        selectedTrackSegmentsArray.forEach(segment => {
            const _trackKey = segment.trackKey;
            const _firstKeyframeKey = segment.firstKeyframeKey;
            const _secondKeyframeKey = segment.secondKeyframeKey;

            const _firstKeyframe = tracks[_trackKey]?.keyframes[_firstKeyframeKey];
            const _secondKeyframe = tracks[_trackKey]?.keyframes[_secondKeyframeKey];

            if (handleType.startsWith('firstOut')) {
                const currentOutHandle = _firstKeyframe?.handles?.out || defaultHandleLeft;
                const newOutHandle =
                    handleType === 'firstOutX'
                        ? { x: newValue, y: currentOutHandle.y }
                        : { x: currentOutHandle.x, y: newValue };
                setKeyframeHandles(
                    _firstKeyframeKey,
                    _trackKey,
                    _firstKeyframe?.handles?.in || defaultHandleRight,
                    newOutHandle,
                    true
                );
            } else {
                const currentInHandle = _secondKeyframe?.handles?.in || defaultHandleRight;
                const newInHandle =
                    handleType === 'secondInX'
                        ? { x: newValue, y: currentInHandle.y }
                        : { x: currentInHandle.x, y: newValue };
                setKeyframeHandles(
                    _secondKeyframeKey,
                    _trackKey,
                    newInHandle,
                    _secondKeyframe?.handles?.out || defaultHandleLeft,
                    true
                );
            }
        });
    };

    return (
        <div className='flex flex-col gap-2'>
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
                    <div className="flex flex-col gap-2 ml-auto">
                        <Input
                            className="h-fit text-[10px] p-0.5 w-10"
                            max={1}
                            min={0}
                            step={0.1}
                            type="number"
                            value={secondKeyframeInHandle.x}
                            onChange={(e: any) => updateHandle('secondInX', parseFloat(e.target.value))}
                        />
                        <Input
                            className="h-fit text-[10px] p-0.5 w-10"
                            max={1}
                            min={0}
                            step={0.1}
                            type="number"
                            value={secondKeyframeInHandle.y}
                            onChange={(e: any) => updateHandle('secondInY', parseFloat(e.target.value))}
                        />
                    </div>
                    <div className="flex flex-col gap-2">
                        <Input
                            className="h-fit text-[10px] p-0.5 w-10"
                            max={1}
                            min={0}
                            step={0.1}
                            type="number"
                            value={firstKeyframeOutHandle.x}
                            onChange={(e: any) => updateHandle('firstOutX', parseFloat(e.target.value))}
                        />
                        <Input
                            className="h-fit text-[10px] p-0.5 w-10"
                            max={1}
                            min={0}
                            step={0.1}
                            type="number"
                            value={firstKeyframeOutHandle.y}
                            onChange={(e: any) => updateHandle('firstOutY', parseFloat(e.target.value))}
                        />
                    </div>

                </div>
            </div>
            {selectedTrackSegmentsArray.length > 1 ?
                <div className='text-xs flex flex-col gap-1 font-bold font-roboto-mono antialiased'>
                    {areHandlesInSync ?
                        <p className='text-green-500'>{selectedTrackSegmentsArray.length} segments in sync</p>
                        :
                        <p className='text-red-600'>{selectedTrackSegmentsArray.length} segments out of Sync</p>
                    }
                </div>
                :
                <>
                    <p className='text-xs font-bold font-roboto-mono antialiased text-white'>{Object.entries(selectedTrackSegments).length} segment selected</p>
                </>
            }
        </div>
    )
}

