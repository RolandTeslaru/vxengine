import React, { FC, useRef, useLayoutEffect, useState } from 'react';
import { parserPixelToTime, parserTimeToPixel } from '../../utils/deal_data';
import { RowDnd } from '../row_rnd/row_rnd';
import { CommonProp } from 'vxengine/AnimationEngine/interface/common_prop';
import { IKeyframe, ITrack } from 'vxengine/AnimationEngine/types/track';
import { useTimelineEditorAPI } from '../../store';
import { useVXEngine } from 'vxengine/engine';
import { shallow } from 'zustand/shallow';

export type EditKeyframeProps = {
    track: ITrack;
    keyframe: IKeyframe;
    handleTime: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => number;
    globalKeyframeClickHandle: (event, keyframeKey) => void;
};

export const EditKeyframe: FC<EditKeyframeProps> = ({
    keyframe,
    rowHeight,
    handleTime,
    globalKeyframeClickHandle
}) => {
    const startLeft = 12;
    const { scale, snap, scaleWidth, addChange } = useTimelineEditorAPI(state => ({
        scale: state.scale,
        snap: state.snap,
        scaleWidth: state.scaleWidth,
        addChange: state.addChange
    }), shallow);
    const [left, setLeft] = useState(() => {
        return parserTimeToPixel(keyframe.time, { startLeft, scale, scaleWidth });
    });

    const selectedKeyframeKeys = useTimelineEditorAPI(state => state.selectedKeyframeKeys)

    useLayoutEffect(() => {
        setLeft(parserTimeToPixel(keyframe.time, { startLeft, scale, scaleWidth }));
    }, [keyframe.time, startLeft, scaleWidth, scale]);

    // Handle dragging event

    const handleOnDrag = (data: { left: number, lastLeft: number }) => {
        const newTime = parserPixelToTime(data.left, { startLeft, scale, scaleWidth })
        useTimelineEditorAPI.getState().setKeyframeTime(keyframe.id, newTime);
        // const selectedKeyframes = useTimelineEditorAPI.getState().selectedKeyframeKeys
        // if(selectedKeyframeKeys.length == 1){
        //     const newTime = parserPixelToTime(data.left, { startLeft, scale, scaleWidth })
        //     useTimelineEditorAPI.getState().setKeyframeTime(keyframe.id, newTime);
        // }
        // else if(selectedKeyframeKeys.length > 1){
        //     const delta = data.left - data.lastLeft 
        //     console.log("Dragging multiple keys  w delta", delta)
        //     selectedKeyframeKeys.forEach(keyframeKey => {

        //         const oldKeyframetime = useTimelineEditorAPI.getState().keyframes[keyframeKey].time
        //         const parsedOldKeyframeTime = parserTimeToPixel(oldKeyframetime, { startLeft, scale, scaleWidth });
        //         const newTime = parserPixelToTime(delta + parsedOldKeyframeTime, { startLeft, scale, scaleWidth });
        //         console.log("oldTime ", oldKeyframetime, " vs new Time", newTime)
        //         useTimelineEditorAPI.getState().setKeyframeTime(keyframeKey, newTime)
        //     })
        // }
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
                className={`absolute h-2 w-[11px] fill-white hover:fill-blue-600 
                    ${selectedKeyframeKeys.includes(keyframe.id) && "!fill-yellow-300"} `
                }
                style={{
                    left: `${left}px`,
                    top: `${rowHeight / 4}px`,
                }}
                onClick={(e) => {
                    const time = handleTime(e);
                    globalKeyframeClickHandle(e, keyframe.id);
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
                <svg viewBox="0 0 100 100">
                    <polygon
                        points="50,0 100,50 50,100 0,50"
                        stroke="black"        
                        strokeWidth="5"      
                    />
                </svg>
            </div>
        </RowDnd>
    );
};