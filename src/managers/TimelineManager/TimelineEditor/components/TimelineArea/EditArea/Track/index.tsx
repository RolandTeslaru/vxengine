import React, { FC,memo, useEffect } from 'react';
import { useTimelineManagerAPI } from '@vxengine/managers/TimelineManager';
import Keyframe from '../Keyframe';
import TrackSegment from './TrackSegment';
import { useTimelineEditorAPI } from '@vxengine/managers/TimelineManager/TimelineEditor/store';
import { DragEvent } from "@interactjs/types"

export type EditRowProps = {
    trackKey: string
    style?: React.CSSProperties;
    snap?: boolean
    handleOnTrackSegmentMove: (e, deltaX, trackKey, firstKeyframeKey, secondKeyframeKey) => void
    handleOnTrackSegmentMoveEnd: (e) => void,
    handleOnKeyframeMove: (
        e: DragEvent, 
        deltaXRef: { current: number }, 
        trackKey: string, 
        keyframeKey: string, 
    ) => void
    handleOnKeyframeMoveEnd: (e: DragEvent) => void 
};

const Track: FC<EditRowProps> = memo(({ trackKey, snap, handleOnTrackSegmentMove, handleOnTrackSegmentMoveEnd, handleOnKeyframeMove, handleOnKeyframeMoveEnd }) => {
    const orderedKeyframeKeys = useTimelineManagerAPI(state => state.tracks[trackKey]?.orderedKeyframeKeys);
    const selectedKeyframeKeysOnTrack = useTimelineEditorAPI(state => state.selectedKeyframeKeys[trackKey])

    if(!orderedKeyframeKeys) return null

    return (
        <>
            {/* Render Keyframes */}
            {orderedKeyframeKeys.map((keyframeKey, index) =>
                <Keyframe
                    key={keyframeKey}
                    keyframeKey={keyframeKey}
                    nextKeyframeKey={orderedKeyframeKeys[index + 1]}
                    prevKeyframeKey={orderedKeyframeKeys[index - 1]}
                    trackKey={trackKey}
                    snap={snap}
                    isSelected={selectedKeyframeKeysOnTrack?.[keyframeKey]}
                    handleOnMove={handleOnKeyframeMove}
                    handleOnMoveEnd={handleOnKeyframeMoveEnd}
                />
            )}

            {/* Render Track Segments */}
            {orderedKeyframeKeys.map((keyframeKey: string, index: number) => {
                if (index === 0) 
                    return null;

                const firstKeyframeKey = orderedKeyframeKeys[index - 1];
                const secondKeyframeKey = keyframeKey
                return (
                    <TrackSegment
                        key={`segment-${firstKeyframeKey}-${secondKeyframeKey}`}
                        firstKeyframeKey={firstKeyframeKey}
                        secondKeyframeKey={secondKeyframeKey}
                        trackKey={trackKey}
                        handleOnMove={handleOnTrackSegmentMove}
                        handleOnMoveEnd={handleOnTrackSegmentMoveEnd}
                    />
                )
            })}
        </>
    );
});

export default Track
