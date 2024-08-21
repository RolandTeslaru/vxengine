import React, { FC, useLayoutEffect, useRef, useState } from 'react';
import { prefix } from '../../utils/deal_class_prefix';
import { parserTimeToPixel, parserTimeToTransform } from '../../utils/deal_data';
import { IKeyframe, ITrack } from 'vxengine/AnimationEngine/types/track';
import { CommonProp } from 'vxengine/AnimationEngine/interface/common_prop';
import { useTimelineEditorStore } from '../../store';
import { useVXEngine } from 'vxengine/engine';
import { startLeft } from '../../ui';
import { DEFAULT_START_LEFT } from 'vxengine/AnimationEngine/interface/const';

export type EditKeyframeProps = CommonProp & {
    track: ITrack;
    keyframe: IKeyframe;
    areaRef: React.MutableRefObject<HTMLDivElement>;
    handleTime: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => number;
};

export const EditKeyframe: FC<EditKeyframeProps> = ({
    track,
    keyframe,
    rowHeight,
    scaleWidth,
    handleTime,
    areaRef,
}) => {
    const startLeft = 12;
    const { scale } = useTimelineEditorStore();
    const [left, setLeft] = useState(() => {
        const val = parserTimeToPixel(keyframe.time, { startLeft, scale, scaleWidth })
        return val
    });

    useLayoutEffect(() => {
        setLeft(parserTimeToPixel(keyframe.time, { startLeft, scale, scaleWidth }));
    }, [keyframe.time, startLeft, scaleWidth, scale]);

    return (
        <div
            className='absolute'
            style={{
                left: `${left}px`,
                top: `${rowHeight / 4}px`,
                width: `${rowHeight / 2}px`,
                height: `${rowHeight / 2}px`,
            }}
            onClick={(e) => {
                const time = handleTime(e);
                // Handle keyframe click event here
            }}
            onDoubleClick={(e) => {
                const time = handleTime(e);
                // Handle keyframe double click event here
            }}
            onContextMenu={(e) => {
                const time = handleTime(e);
                // Handle keyframe context menu event here
            }}
        >
            {/* Diamond Shape for Keyframe */}
            <svg viewBox="0 0 100 100">
                <polygon className='bg-white fill-white' points="50,0 100,50 50,100 0,50" />
            </svg>
        </div>
    );
};