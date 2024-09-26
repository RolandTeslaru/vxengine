import React, { useEffect } from 'react'
import BezierCurveEditor from '@vxengine/components/ui/BezierCurveEditor'
import CollapsiblePanel from '@vxengine/components/ui/CollapsiblePanel'
import { useTimelineEditorAPI } from '../store'
import { Input } from '@vxengine/components/shadcn/input'

const TrackSegmentProperties = React.memo(() => {
    const selectedTrackSegment = useTimelineEditorAPI(state => state.selectedTrackSegment)

    return (
        <> 
            {selectedTrackSegment && 
                <CollapsiblePanel
                    title="Track Segment Props."
                    className='gap-2'
                >
                    <TrackSegmentEditor />
                </CollapsiblePanel>
            }
        </>
    )
})
export default TrackSegmentProperties

const TrackSegmentEditor = () => {
    const selectedTrackSegment = useTimelineEditorAPI(state => state.selectedTrackSegment)
    const setKeyframeHandles = useTimelineEditorAPI(state => state.setKeyframeHandles)

    const firstKeyframe = useTimelineEditorAPI(state => state.keyframes[selectedTrackSegment?.firstKeyframeKey])
    const secondKeyframe = useTimelineEditorAPI(state => state.keyframes[selectedTrackSegment?.secondKeyframeKey])

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
            selectedTrackSegment?.firstKeyframeKey,
            selectedTrackSegment?.trackKey,
            firstKeyframeInHandle,
            { x: outHandleX, y: outHandleY },
            false
        );

        // update second keyframe
        setKeyframeHandles(
            selectedTrackSegment?.secondKeyframeKey,
            selectedTrackSegment?.trackKey,
            { x: inHandleX, y: inHandleY },
            secondKeyframeOutHandle,
            true
        );
    };

    return <>
        <div className='border border-neutral-800 py-2 rounded-lg'>
            <BezierCurveEditor
                size={180}
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
        <div className='mt-2 flex flex-row mx-2'>
            <div className='flex flex-row gap-2'>
                <Input
                    className="h-fit border-none text-[10px] bg-neutral-800 p-0.5 max-w-7"
                    max={1}
                    min={0}
                    value={firstKeyframeOutHandle.x}
                    onChange={(e: any) => {
                        setKeyframeHandles(
                            selectedTrackSegment?.firstKeyframeKey,
                            selectedTrackSegment?.trackKey,
                            { x: firstKeyframeInHandle.x, y: firstKeyframeInHandle.y },
                            { x: e.target.value, y: firstKeyframeOutHandle.y },
                            true
                        )
                    }}
                />
                <Input
                    className="h-fit border-none text-[10px] bg-neutral-800 p-0.5 max-w-7"
                    max={1}
                    min={0}
                    value={firstKeyframeOutHandle.y}
                    onChange={(e: any) => {
                        setKeyframeHandles(
                            selectedTrackSegment?.firstKeyframeKey,
                            selectedTrackSegment?.trackKey,
                            { x: firstKeyframeInHandle.x, y: firstKeyframeInHandle.y },
                            { x: firstKeyframeOutHandle.x, y: e.target.value },
                            true
                        )
                    }}
                />
            </div>
            <div className='flex flex-row gap-2 ml-auto'>
                <Input
                    className="h-fit border-none text-[10px] bg-neutral-800 p-0.5 max-w-7"
                    max={1}
                    min={0}
                    value={secondKeyframeInHandle.x}
                    onChange={(e: any) => {
                        setKeyframeHandles(
                            selectedTrackSegment?.secondKeyframeKey,
                            selectedTrackSegment?.trackKey,
                            { x: e.target.value, y: secondKeyframeInHandle.y },
                            { x: secondKeyframeOutHandle.x, y: secondKeyframeOutHandle.y },
                            true
                        )
                    }}
                />
                <Input
                    className="h-fit border-none text-[10px] bg-neutral-800 p-0.5 max-w-7"
                    max={1}
                    min={0}
                    value={secondKeyframeInHandle.y}
                    onChange={(e: any) => {
                        setKeyframeHandles(
                            selectedTrackSegment?.secondKeyframeKey,
                            selectedTrackSegment?.trackKey,
                            { x: secondKeyframeInHandle.x, y: e.target.value },
                            { x: secondKeyframeOutHandle.x, y: secondKeyframeOutHandle.y },
                            true
                        )
                    }}
                />
            </div>
        </div>
    </>

}

