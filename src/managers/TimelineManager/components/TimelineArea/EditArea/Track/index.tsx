import React, { FC, useEffect, useMemo, useState } from 'react';
import { ContextMenu, ContextMenuTrigger } from '@vxengine/components/shadcn/contextMenu';
import { useTimelineEditorAPI } from '@vxengine/managers/TimelineManager';
import { parserPixelToTime, parserTimeToPixel } from '@vxengine/managers/TimelineManager/utils/deal_data';
import TrackContextMenu from './TrackContextMenu';
import Keyframe from '../Keyframe';
import { DragLineData } from '../DragLines';
import { RowDnd } from '../RowDnd';
import KeyframeContextMenu from '../Keyframe/KeyframeContextMenu';

export type EditRowProps = {
    trackKey: string
    style?: React.CSSProperties;
};

const startLeft = 22

const Track: FC<EditRowProps> = React.memo(({ trackKey }) => {
    const keyframes = useTimelineEditorAPI(state => state.tracks[trackKey]?.keyframes)

    if (!keyframes) return
    return (
        <div
            className='relative  py-4 border-y  border-neutral-900'
        >
            <ContextMenu>
                {keyframes.map((keyframeKey: string, index: number) => {
                    if (index === 0) return null;

                    const firstKeyframeKey = keyframes[index - 1]
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
                <TrackContextMenu trackKey={trackKey} />
            </ContextMenu>

            {/* Render Keyframes */}

            {keyframes.map((keyframeKey: string, index) => (
                <>
                    <Keyframe
                        key={index}
                        track={useTimelineEditorAPI.getState().tracks[trackKey]}
                        keyframeKey={keyframeKey}
                    />
                </>
            ))}
        </div>
    );
});

export default Track


const TrackSegment = React.memo(({ firstKeyframeKey, secondKeyframeKey, trackKey, }:
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

    // When deleting a keyframe an issue appeasr with the endX where it cant read 
    // the time on the secondKeyframe becuase its deleted
    if (!firstKeyframe || !secondKeyframe) return

    const scale = useTimelineEditorAPI(state => state.scale)

    const [startX, endX] = useMemo(() => {
        const startX = parserTimeToPixel(firstKeyframe.time, startLeft)
        const endX = parserTimeToPixel(secondKeyframe.time, startLeft);

        return [startX, endX];
    }, [scale, firstKeyframe.time, secondKeyframe.time]);

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
    )
})

