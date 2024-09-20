import React, { FC, useRef, useLayoutEffect, useState, useEffect } from 'react';
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
    keyframeKey: string;
    globalKeyframeClickHandle: (event, keyframeKey) => void;
    rowHeight: number
};

export const EditKeyframe: FC<EditKeyframeProps> = ({
    keyframeKey,
    track,
    rowHeight,
    globalKeyframeClickHandle
}) => {
    const keyframe = useTimelineEditorAPI(state => state.keyframes[keyframeKey])

    const removeKeyframe = useTimelineEditorAPI(state => state.removeKeyframe)
    const scale = useTimelineEditorAPI(state => state.scale)
    const snap = useTimelineEditorAPI(state => state.snap)
    const scaleWidth = useTimelineEditorAPI(state => state.scaleWidth)
    const selectedKeyframeKeys = useTimelineEditorAPI(state => state.selectedKeyframeKeys)
    const setSelectedKeyframeKeys = useTimelineEditorAPI(state => state.setSelectedKeyframeKeys)
    
    const startLeft = 12.5;
    const [left, setLeft] = useState(() => {
        return parserTimeToPixel(keyframe.time, startLeft);
    });

    useEffect(() => {
        setLeft(parserTimeToPixel(keyframe.time, startLeft));
    }, [keyframe.time, startLeft, scaleWidth, scale]);


    // Handle dragging event
    const handleOnDrag = (data: { left: number, lastLeft: number }) => {
        // Single Keyframe Drag
        if(selectedKeyframeKeys.length == 1){
            const newTime = parserPixelToTime(data.left, startLeft)
            useTimelineEditorAPI.getState().setKeyframeTime(keyframe.id, newTime);
        }
        // Multiple Keyframe Drag
        else if(selectedKeyframeKeys.length > 1){
            const lastTime = parserPixelToTime(data.lastLeft, startLeft)
            const newTime = parserPixelToTime(data.left, startLeft)
            const deltaTime = newTime - lastTime;

            selectedKeyframeKeys.forEach(keyframeKey => {
                const oldKeyframetime = useTimelineEditorAPI.getState().keyframes[keyframeKey].time
                const newKeyframeTime = oldKeyframetime + deltaTime
                if (newKeyframeTime !== null && newKeyframeTime !== undefined && !isNaN(newKeyframeTime)){
                    useTimelineEditorAPI.getState().setKeyframeTime(keyframeKey, parseFloat(newKeyframeTime.toFixed(4)))
                }
            })
        }
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
                    globalKeyframeClickHandle(e, keyframe.id);
                    // Handle keyframe click event here
                }}
                onDoubleClick={(e) => {
                    // Handle keyframe double click event here
                }}
                onContextMenu={(e) => {
                    setSelectedKeyframeKeys([ keyframe.id ])
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