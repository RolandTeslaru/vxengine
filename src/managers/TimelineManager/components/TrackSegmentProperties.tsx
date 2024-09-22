import React from 'react'
import BezierCurveEditor from 'vxengine/components/ui/BezierCurveEditor'
import CollapsiblePanel from 'vxengine/components/ui/CollapsiblePanel'
import { useTimelineEditorAPI } from '../store'

const TrackSegmentProperties = React.memo(() => {
    const selectedTrackSegment = useTimelineEditorAPI(state => state.selectedTrackSegment)

    return (
        <CollapsiblePanel
            title="Track Segment Props."
        >
            {selectedTrackSegment
                ? <TrackSegmentEditor />
                : <p className='font-sans-menlo text-xs'>Select a track segment</p>
            }
        </CollapsiblePanel>
    )
})
export default TrackSegmentProperties

const TrackSegmentEditor = () => {
    const selectedTrackSegment = useTimelineEditorAPI(state => state.selectedTrackSegment)
    const setKeyframeHandles = useTimelineEditorAPI(state => state.setKeyframeHandles)

    const firstKeyframe = useTimelineEditorAPI(state => state.keyframes[selectedTrackSegment?.firstKeyframeKey])
    const secondKeyframe = useTimelineEditorAPI(state => state.keyframes[selectedTrackSegment?.secondKeyframeKey])

    const graphInHandles = firstKeyframe?.handles?.out || { x: 1, y: 1 };
    const graphOutHandles = secondKeyframe?.handles?.in || { x: 0, y: 0 };



    const handleOnCurveChange = (value: [number, number, number, number]) => {
        const [inHandleX, inHandleY, outHandleX, outHandleY] = value;

        // Set updated handles for the first and second keyframe
        setKeyframeHandles(
            selectedTrackSegment?.firstKeyframeKey,
            selectedTrackSegment?.trackKey, // Ensure trackKey is passed here
            firstKeyframe.handles.in, // Keep the existing out-handle for the first keyframe
            { x: inHandleX, y: inHandleY }, // In-handle for the first keyframe
            false // Avoid immediate re-render
        );

        setKeyframeHandles(
            selectedTrackSegment?.secondKeyframeKey,
            selectedTrackSegment?.trackKey, // Ensure trackKey is passed here
            { x: outHandleX, y: outHandleY }, // Out-handle for the second keyframe
            secondKeyframe.handles.out, // Keep the existing in-handle for the second keyframe
            true // Trigger re-render after updating the second keyframe
        );
    };

    return (
        <div className='border border-neutral-800 py-2 rounded-lg'>
            <BezierCurveEditor
                size={180}
                outerAreaSize={0}
                handleLineStrokeWidth={2}
                borderRadiusContainer={8}
                handleLineColor={"#64B5FF"}
                axisColor={"transparent"}
                outerAreaColor={"#fafafa"}
                onChange={handleOnCurveChange}
                value={[
                    graphInHandles.x, graphInHandles.y,
                    graphOutHandles.x, graphOutHandles.y
                ]}
            />
        </div>
    )
}

