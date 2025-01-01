import React, { FC,memo, useEffect } from 'react';
import { useTimelineEditorAPI } from '@vxengine/managers/TimelineManager';
import Keyframe from '../Keyframe';
import TrackSegment from './TrackSegment';

export type EditRowProps = {
    trackKey: string
    style?: React.CSSProperties;
    snap?: boolean
};

const Track: FC<EditRowProps> = memo(({ trackKey, snap }) => {
    const orderedKeyframeKeys = useTimelineEditorAPI(state => state.tracks[trackKey].orderedKeyframeKeys);
    const selectedKeyframeKeysOnTrack = useTimelineEditorAPI(state => state.selectedKeyframeKeys[trackKey])

    useEffect(() => {
        console.log("Effect triggered by Ordered Keyframe Keys ", orderedKeyframeKeys)
    }, [orderedKeyframeKeys])

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
                />
            )}

            {/* Render Track Segments */}
            {orderedKeyframeKeys.map((keyframeKey: string, index: number) => {
                if (index === 0) return null;

                const firstKeyframeKey = orderedKeyframeKeys[index - 1];
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
        </>
    );
});

export default Track
