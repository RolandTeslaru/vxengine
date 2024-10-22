import React, { FC, useEffect, useState } from 'react';
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from '@vxengine/components/shadcn/contextMenu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@vxengine/components/shadcn/alertDialog';
import { useTimelineEditorAPI } from '@vxengine/managers/TimelineManager';
import { parserPixelToTime, parserTimeToPixel } from '@vxengine/managers/TimelineManager/utils/deal_data';
import { RowDnd } from '../../row_rnd/row_rnd';
import { DragLineData } from '../drag_lines';
import TrackContextMenu from './TrackContextMenu';
import Keyframe from '../Keyframe';

export type EditRowProps = {
    trackKey: string
    style?: React.CSSProperties;
    dragLineData: DragLineData;
};

const startLeft = 22

const Track: FC<EditRowProps> = (props) => {
    const { trackKey } = props;
    const track = useTimelineEditorAPI(state => state.tracks[trackKey])
    return (
        <div
            className='relative  py-4 border-y  border-neutral-900'
            style={props.style}
        >
            {track.keyframes.map((keyframeKey: string, index: number) => {
                if (index === 0) return null;

                const firstKeyframeKey = track.keyframes[index - 1]
                const secondKeyframeKey = keyframeKey
                return (
                    <TrackSegment
                        firstKeyframeKey={firstKeyframeKey}
                        secondKeyframeKey={secondKeyframeKey}
                        trackKey={trackKey}
                        key={index}
                    />
                )
            })}

            {/* Render Keyframes */}
            {track.keyframes.map((keyframeKey: string, index) => (
                // @ts-expect-error
                <Keyframe
                    key={index}
                    track={track}
                    {...props}
                    keyframeKey={keyframeKey}
                />
            ))}
        </div>
    );
};

export default Track


const TrackSegment = ({ firstKeyframeKey, secondKeyframeKey, trackKey,  }:
    { firstKeyframeKey: string, secondKeyframeKey: string, trackKey: string }
) => {
    const firstKeyframe = useTimelineEditorAPI(state => state.keyframes[firstKeyframeKey])
    const secondKeyframe = useTimelineEditorAPI(state => state.keyframes[secondKeyframeKey])
    const selectedKeyframeKeys = useTimelineEditorAPI(state => state.selectedKeyframeKeys)
    const setSelectedKeyframeKeys = useTimelineEditorAPI(state => state.setSelectedKeyframeKeys)
    const selectedTrackSegment = useTimelineEditorAPI(state => state.selectedTrackSegment)
    const setSelectedTrackSegment = useTimelineEditorAPI(state => state.setSelectedTrackSegment)

    const isSelectedFromKeyframes = selectedKeyframeKeys.includes(firstKeyframe.id) && selectedKeyframeKeys.includes(secondKeyframe.id)
    const isSelectedFromTrackSegments = selectedTrackSegment?.firstKeyframeKey === firstKeyframeKey && selectedTrackSegment?.secondKeyframeKey === secondKeyframeKey

    const startX = parserTimeToPixel(firstKeyframe.time, startLeft);
    const endX = parserTimeToPixel(secondKeyframe.time, startLeft);

    const handleOnDrag = (data: { left: number, lastLeft: number }) => {
        const setKeyframeTime = useTimelineEditorAPI.getState().setKeyframeTime

        const newTime = parserPixelToTime(data.left, startLeft)
        const oldTime = parserPixelToTime(data.lastLeft, startLeft)
        const deltaTime = newTime - oldTime

        const oldFirstKeyframeTime = useTimelineEditorAPI.getState().keyframes[firstKeyframeKey].time;
        const oldSecondKeyframeTime = useTimelineEditorAPI.getState().keyframes[secondKeyframeKey].time;

        const newFirstKeyframeTime = oldFirstKeyframeTime + deltaTime
        const newSecondKeyframeTime = oldSecondKeyframeTime + deltaTime

        setKeyframeTime(firstKeyframeKey, parseFloat(newFirstKeyframeTime.toFixed(4)))
        setKeyframeTime(secondKeyframeKey, parseFloat(newSecondKeyframeTime.toFixed(4)))
    }

    const handleOnClick = () => {
        setSelectedKeyframeKeys([firstKeyframe.id, secondKeyframe.id])
        setSelectedTrackSegment(firstKeyframeKey, secondKeyframeKey, trackKey)
    }

    return (
        <ContextMenu>
            <ContextMenuTrigger>
                <RowDnd
                    onDrag={handleOnDrag}
                    left={startX}
                    start={startLeft}
                    width={endX - startX}
                >
                    <div
                        key={`line-${firstKeyframe.id}-${secondKeyframe.id}`}
                        className={`absolute bg-white h-[6px] flex ${isSelectedFromKeyframes && "bg-yellow-400"} ${isSelectedFromTrackSegments && "!bg-blue-500"}`}
                        style={{
                            top: `calc(50% - 3px)`,
                        }}
                        onClick={handleOnClick}
                    >
                    </div>
                </RowDnd>
            </ContextMenuTrigger>
            <TrackContextMenu trackKey={trackKey}/>
        </ContextMenu>
    )
}

