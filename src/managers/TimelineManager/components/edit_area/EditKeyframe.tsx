import React, { FC, useRef, useLayoutEffect, useState } from 'react';
import { parserPixelToTime, parserTimeToPixel } from '../../utils/deal_data';
import { RowDnd } from '../row_rnd/row_rnd';
import { CommonProp } from 'vxengine/AnimationEngine/interface/common_prop';
import { IKeyframe, ITrack } from 'vxengine/AnimationEngine/types/track';
import { useTimelineEditorAPI } from '../../store';
import { useVXEngine } from 'vxengine/engine';
import { shallow } from 'zustand/shallow';
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from 'vxengine/components/shadcn/contextMenu';

export type EditKeyframeProps = {
    track: ITrack;
    keyframe: IKeyframe;
    handleTime: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => number;
    globalKeyframeClickHandle: (event, keyframeKey) => void;
    rowHeight: number
};

export const EditKeyframe: FC<EditKeyframeProps> = ({
    keyframe,
    track,
    rowHeight,
    handleTime,
    globalKeyframeClickHandle
}) => {
    const startLeft = 12.5;
    const { scale, snap, scaleWidth, addChange } = useTimelineEditorAPI(state => ({
        scale: state.scale,
        snap: state.snap,
        scaleWidth: state.scaleWidth,
        addChange: state.addChange
    }), shallow);
    const removeKeyframe = useTimelineEditorAPI(state => state.removeKeyframe)
    const [left, setLeft] = useState(() => {
        return parserTimeToPixel(keyframe.time, startLeft);
    });

    const selectedKeyframeKeys = useTimelineEditorAPI(state => state.selectedKeyframeKeys)

    useLayoutEffect(() => {
        setLeft(parserTimeToPixel(keyframe.time, startLeft));
    }, [keyframe.time, startLeft, scaleWidth, scale]);

    // Handle dragging event

    const handleOnDrag = (data: { left: number, lastLeft: number }) => {
        const newTime = parserPixelToTime(data.left, startLeft)
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
            width={rowHeight / 2} 
            start={startLeft}
            grid={snap ? scaleWidth / 10 : 1} 
            enableDragging={true}
            enableResizing={false} 
            bounds={{
                left: 0, 
                right: scaleWidth * 1000 
            }}
            // @ts-expect-error
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
                <ContextMenu>
                    <ContextMenuTrigger>
                        <svg viewBox="0 0 100 100">
                            <polygon
                                points="50,0 100,50 50,100 0,50"
                                stroke="black"
                                strokeWidth="5"
                            />
                        </svg>


                    </ContextMenuTrigger>
                    <ContextMenuContent>
                        <ContextMenuItem>
                            <p className=''>
                                Show Handles
                            </p>
                        </ContextMenuItem>
                        <ContextMenuItem
                            onClick={() => {
                                const trackKey = `${track.vxkey}.${track.propertyPath}`
                                removeKeyframe(trackKey, keyframe.id, true)
                            }}
                        >
                            <p className=' text-red-700'>
                                Delete Keyframe
                            </p>
                        </ContextMenuItem>
                    </ContextMenuContent>
                </ContextMenu>

            </div>
        </RowDnd>
    );
};