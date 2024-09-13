import React, { FC, useRef, useLayoutEffect, useState } from 'react';
import { parserPixelToTime, parserTimeToPixel } from '../../utils/deal_data';
import { RowDnd } from '../row_rnd/row_rnd';
import { CommonProp } from 'vxengine/AnimationEngine/interface/common_prop';
import { IKeyframe, ITrack } from 'vxengine/AnimationEngine/types/track';
import { useTimelineEditorStore } from '../../store';
import { useVXEngine } from 'vxengine/engine';
import { shallow } from 'zustand/shallow';

export type EditKeyframeProps = {
    track: ITrack;
    keyframe: IKeyframe;
    handleTime: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => number;
};

export const EditKeyframe: FC<EditKeyframeProps> = ({
    keyframe,
    rowHeight,
    handleTime,
}) => {
    const startLeft = 12;
    const { scale, snap, scaleWidth, addChange } = useTimelineEditorStore(state => ({
        scale: state.scale,
        snap: state.snap,
        scaleWidth: state.scaleWidth,
        addChange: state.addChange
    }), shallow);
    const [left, setLeft] = useState(() => {
        return parserTimeToPixel(keyframe.time, { startLeft, scale, scaleWidth });
    });

    useLayoutEffect(() => {
        setLeft(parserTimeToPixel(keyframe.time, { startLeft, scale, scaleWidth }));
    }, [keyframe.time, startLeft, scaleWidth, scale]);

    // Handle dragging event

    const handleOnDrag = (data: { left: number}) => {
        const newTime = parserPixelToTime(data.left, {startLeft, scale, scaleWidth})
        useTimelineEditorStore.getState().setKeyframeTime(keyframe.id, newTime);
    }

    return (
        <RowDnd
            left={left}
            width={rowHeight / 2} // Keyframe width
            start={startLeft}
            grid={snap ? scaleWidth / 10 : 1} // Adjust grid size based on snapping
            enableDragging={true}
            enableResizing={false} // Disable resizing for keyframes
            bounds={{
                left: 0, // Adjust according to the timeline's start
                right: scaleWidth * 1000 // Adjust according to the timeline's end
            }}
            onDragEnd={handleOnDrag}
            onDrag={handleOnDrag}
        >
            <div
                className="absolute h-2 w-[11px] fill-white hover:fill-blue-600"
                style={{
                    left: `${left}px`,
                    top: `${rowHeight / 4}px`,
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
                    <polygon points="50,0 100,50 50,100 0,50" />
                </svg>
            </div>
        </RowDnd>
    );
};