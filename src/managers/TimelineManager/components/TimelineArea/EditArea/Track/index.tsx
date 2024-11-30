import React, { FC, useEffect, useMemo, useState, memo, useCallback } from 'react';
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
    scale: number
};

const startLeft = 22

const Track: FC<EditRowProps> = memo(({ trackKey, scale }) => {
    const keyframeKeys = useTimelineEditorAPI(state => state.tracks[trackKey]?.keyframes)

    if (!keyframeKeys) return
    return (
        <div
            className='relative  py-4 border-y  border-neutral-900'
        >
            <ContextMenu>
                {keyframeKeys.map((keyframeKey: string, index: number) => {
                    if (index === 0) return null;

                    const firstKeyframeKey = keyframeKeys[index - 1]
                    const secondKeyframeKey = keyframeKey
                    return (
                        <TrackSegment
                            key={`segment-${firstKeyframeKey}-${secondKeyframeKey}`}
                            firstKeyframeKey={firstKeyframeKey}
                            secondKeyframeKey={secondKeyframeKey}
                            trackKey={trackKey}
                        />
                    )
                })}
                <TrackContextMenu trackKey={trackKey} />
            </ContextMenu>

            {/* Render Keyframes */}

            {keyframeKeys.map((keyframeKey: string, index) => (
                <Keyframe
                    key={`keyframe-${keyframeKey}`}
                    track={useTimelineEditorAPI.getState().tracks[trackKey]}
                    keyframeKey={keyframeKey}
                />
            ))}
        </div>
    );
});

export default Track


const TrackSegment = memo(({ firstKeyframeKey, secondKeyframeKey, trackKey, }:
    { firstKeyframeKey: string, secondKeyframeKey: string, trackKey: string }
) => {
    const firstKeyframe = useTimelineEditorAPI(state => state.keyframes[firstKeyframeKey]);
    const secondKeyframe = useTimelineEditorAPI(state => state.keyframes[secondKeyframeKey]);
    const isSelectedFromKeyframes = useTimelineEditorAPI(
        state => state.selectedKeyframeKeys.includes(firstKeyframeKey) && state.selectedKeyframeKeys.includes(secondKeyframeKey)
    );
    const isSelectedFromTrackSegments = useTimelineEditorAPI(
        state =>
            state.selectedTrackSegment?.firstKeyframeKey === firstKeyframeKey &&
            state.selectedTrackSegment?.secondKeyframeKey === secondKeyframeKey
    );
    const scale = useTimelineEditorAPI(state => state.scale);
    const setSelectedTrackSegment = useTimelineEditorAPI(state => state.setSelectedTrackSegment);
    const setSelectedKeyframeKeys = useTimelineEditorAPI(state => state.setSelectedKeyframeKeys);


    // When deleting a keyframe an issue appeasr with the endX where it cant read 
    // the time on the secondKeyframe becuase its deleted
    if (!firstKeyframe || !secondKeyframe) return


    const [startX, endX] = useMemo(() => {
        const startX = parserTimeToPixel(firstKeyframe.time, startLeft)
        const endX = parserTimeToPixel(secondKeyframe.time, startLeft);

        return [startX, endX];
    }, [scale, firstKeyframe.time, secondKeyframe.time]);

    const handleOnDrag = useCallback((data: { left: number, lastLeft: number }) => {
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
    }, [])

    const handleOnClick = useCallback(() => {
        setSelectedKeyframeKeys([firstKeyframe.id, secondKeyframe.id])
        setSelectedTrackSegment(firstKeyframeKey, secondKeyframeKey, trackKey)
    }, [])

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
                    className={`absolute bg-white hover:bg-neutral-300 h-[6px] flex ${isSelectedFromKeyframes && "bg-yellow-400"} ${isSelectedFromTrackSegments && "!bg-blue-500"}`}
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

