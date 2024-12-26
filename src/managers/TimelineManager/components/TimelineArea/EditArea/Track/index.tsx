import React, { FC, useEffect, useMemo, useState, memo, useCallback } from 'react';
import { ContextMenu, ContextMenuTrigger } from '@vxengine/components/shadcn/contextMenu';
import { useTimelineEditorAPI } from '@vxengine/managers/TimelineManager';
import { parserPixelToTime, parserTimeToPixel } from '@vxengine/managers/TimelineManager/utils/deal_data';
import TrackContextMenu from './TrackContextMenu';
import Keyframe from '../Keyframe';
import { DragLineData } from '../DragLines';
import { RowDnd } from '../RowDnd';
import KeyframeContextMenu from '../Keyframe/KeyframeContextMenu';
import { IKeyframe } from '@vxengine/AnimationEngine/types/track';


export type EditRowProps = {
    trackKey: string
    style?: React.CSSProperties;
    snap?: boolean
};

const startLeft = 22

const Track: FC<EditRowProps> = memo(({ trackKey, snap }) => {
    const track = useTimelineEditorAPI(state => state.tracks[trackKey])
    const scale = useTimelineEditorAPI(state => state.scale)
    // Sorted keyframes by time
    const sortedKeyframes = Object.values(track.keyframes).sort((a, b) => a.time - b.time);
    const selectedKeyframeKeysOnTrack = useTimelineEditorAPI(state => state.selectedKeyframeKeys[trackKey])

    return (
        <>
            <ContextMenu>
                {sortedKeyframes.map((keyframe: IKeyframe, index: number) => {
                    if (index === 0) return null;

                    const firstKeyframe = sortedKeyframes[index - 1];
                    const secondKeyframe = keyframe
                    return (
                        <TrackSegment
                            key={`segment-${firstKeyframe.id}-${secondKeyframe.id}`}
                            firstKeyframe={firstKeyframe}
                            secondKeyframe={secondKeyframe}
                            trackKey={trackKey}
                            scale={scale}
                        />
                    )
                })}
                <TrackContextMenu trackKey={trackKey} />
            </ContextMenu>

            {/* Render Keyframes */}

            {sortedKeyframes.map((keyframe: IKeyframe, index) => (
                <Keyframe
                    key={`keyframe-${keyframe.id}`}
                    track={useTimelineEditorAPI.getState().tracks[trackKey]}
                    keyframe={keyframe}
                    scale={scale}
                    snap={snap}
                    isSelected={selectedKeyframeKeysOnTrack?.[keyframe.id]}
                />
            ))}
        </>
    );
});

export default Track






const TrackSegment = memo(({ firstKeyframe, secondKeyframe, trackKey, scale }:
    { firstKeyframe: IKeyframe, secondKeyframe: IKeyframe, trackKey: string, scale: number }
) => {
    const firstKeyframeKey = firstKeyframe.id
    const secondKeyframeKey = secondKeyframe.id;
    const isSelectedFromKeyframes = useTimelineEditorAPI(
        state => state.selectedKeyframeKeys[trackKey]?.[firstKeyframeKey] && state.selectedKeyframeKeys[trackKey]?.[secondKeyframeKey]
    );
    const isSelectedFromTrackSegments = useTimelineEditorAPI(
        state =>
            state.selectedTrackSegment?.firstKeyframeKey === firstKeyframeKey &&
            state.selectedTrackSegment?.secondKeyframeKey === secondKeyframeKey
    );
    const setSelectedTrackSegment = useTimelineEditorAPI(state => state.setSelectedTrackSegment);
    const selectKeyframe = useTimelineEditorAPI(state => state.selectKeyframe);
    const clearSelectedKeyframes = useTimelineEditorAPI(state => state.clearSelectedKeyframes);
    const setKeyframeTime = useTimelineEditorAPI(state => state.setKeyframeTime);


    const handleOnDragSegment = (data: { left: number, lastLeft: number}) => {
        const tracks = useTimelineEditorAPI.getState().tracks;
        const trackKey = `${firstKeyframe.vxkey}.${firstKeyframe.propertyPath}`;
    
        const newTime = parserPixelToTime(data.left, startLeft);
        const oldTime = parserPixelToTime(data.lastLeft, startLeft);
        const deltaTime = newTime - oldTime;
    
        const oldFirstKeyframeTime = tracks[trackKey]?.keyframes[firstKeyframeKey]?.time;
        const oldSecondKeyframeTime = tracks[trackKey]?.keyframes[secondKeyframeKey]?.time;
    
        const newFirstKeyframeTime = oldFirstKeyframeTime + deltaTime;
        const newSecondKeyframeTime = oldSecondKeyframeTime + deltaTime;
    
        setKeyframeTime(firstKeyframe.id, trackKey, newFirstKeyframeTime);
        setKeyframeTime(secondKeyframe.id, trackKey, newSecondKeyframeTime);
    };

    // When deleting a keyframe an issue appeasr with the endX where it cant read 
    // the time on the secondKeyframe becuase its deleted
    if (!firstKeyframe || !secondKeyframe) return


    const [startX, endX] = useMemo(() => {
        const startX = parserTimeToPixel(firstKeyframe.time, startLeft)
        const endX = parserTimeToPixel(secondKeyframe.time, startLeft);

        return [startX, endX];
    }, [scale, firstKeyframe, secondKeyframe]);

    const handleOnClick = () => {
        clearSelectedKeyframes();
        selectKeyframe(trackKey, firstKeyframe.id)
        selectKeyframe(trackKey, secondKeyframe.id)
        setSelectedTrackSegment(firstKeyframeKey, secondKeyframeKey, trackKey)
    }

    return (
        <ContextMenuTrigger>
            <RowDnd
                enableDragging={isSelectedFromTrackSegments}
                onDrag={handleOnDragSegment}
                left={startX}
                start={startLeft}
                width={endX - startX}
            >
                <div className='absolute h-full flex '
                    onClick={handleOnClick}
                >
                    <div
                        key={`line-${firstKeyframe.id}-${secondKeyframe.id}`}
                        className={`bg-white my-auto w-full hover:bg-neutral-300 h-[1.5px] flex ${isSelectedFromKeyframes && "bg-yellow-400"} ${isSelectedFromTrackSegments && "!bg-blue-500"}`}
                    />
                </div>
            </RowDnd>
        </ContextMenuTrigger>
    )
})

