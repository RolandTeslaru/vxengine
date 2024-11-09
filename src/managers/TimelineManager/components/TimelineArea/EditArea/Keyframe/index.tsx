import { ContextMenu, ContextMenuTrigger, ContextMenuContent, ContextMenuItem } from '@radix-ui/react-context-menu';
import { IKeyframe, ITrack } from '@vxengine/AnimationEngine/types/track';
import { useTimelineEditorAPI } from '@vxengine/managers/TimelineManager';
import { parserTimeToPixel, parserPixelToTime } from '@vxengine/managers/TimelineManager/utils/deal_data';
import React, { useEffect, useState, memo, useCallback } from 'react'
import KeyframeContextMenu from './KeyframeContextMenu';
import { RowDnd } from '../RowDnd';
import { DEFAULT_ROW_HEIGHT } from '@vxengine/AnimationEngine/interface/const';
import { ONE_SECOND_UNIT_WIDTH } from '@vxengine/managers/constants';
import { shallow } from 'zustand/shallow';


export type EditKeyframeProps = {
    track: ITrack;
    keyframeKey: string;
};

const Keyframe: React.FC<EditKeyframeProps> = memo(({
    keyframeKey,
    track,
}) => {
    const rowHeight = DEFAULT_ROW_HEIGHT
    const keyframe = useTimelineEditorAPI(state => state.keyframes[keyframeKey])
    const trackKey = `${track.vxkey}.${track.propertyPath}`

    const scale = useTimelineEditorAPI(state => state.scale)
    const snap = useTimelineEditorAPI(state => state.snap)
    const setSelectedKeyframeKeys = useTimelineEditorAPI(state => state.setSelectedKeyframeKeys)
    const setLastKeyframeSelectedIndex = useTimelineEditorAPI(state => state.setLastKeyframeSelectedIndex)
    const isSelected = useTimelineEditorAPI(
        state => state.selectedKeyframeKeys.includes(keyframeKey),
        shallow
    );

    const startLeft = 12.5;
    const [left, setLeft] = useState(() => {
        return parserTimeToPixel(keyframe.time, startLeft);
    });

    useEffect(() => {
        setLeft(parserTimeToPixel(keyframe.time, startLeft));
    }, [keyframe.time, startLeft, scale]);


    const handleOnDrag = useCallback((data: { left: number, lastLeft: number }) => {
        const selectedKeyframeKeys = useTimelineEditorAPI.getState().selectedKeyframeKeys;

        if (selectedKeyframeKeys.length == 0)
            setSelectedKeyframeKeys([keyframeKey])
        // Single Keyframe Drag
        if (selectedKeyframeKeys.length == 1) {
            const newTime = parserPixelToTime(data.left, startLeft)
            useTimelineEditorAPI.getState().setKeyframeTime(keyframe.id, newTime);
        }
        // Multiple Keyframe Drag
        else if (selectedKeyframeKeys.length > 1) {
            const lastTime = parserPixelToTime(data.lastLeft, startLeft)
            const newTime = parserPixelToTime(data.left, startLeft)
            const deltaTime = newTime - lastTime;

            selectedKeyframeKeys.forEach(keyframeKey => {
                const oldKeyframetime = useTimelineEditorAPI.getState().keyframes[keyframeKey].time
                const newKeyframeTime = oldKeyframetime + deltaTime
                if (newKeyframeTime !== null && newKeyframeTime !== undefined && !isNaN(newKeyframeTime)) {
                    useTimelineEditorAPI.getState().setKeyframeTime(keyframeKey, parseFloat(newKeyframeTime.toFixed(4)))
                }
            })
        }
    }, [])

    const handleOnClick = useCallback((event: React.MouseEvent) => {
        event.preventDefault();

        const selectedKeyframeKeys = useTimelineEditorAPI.getState().selectedKeyframeKeys;
        const lastKeyframeSelectedIndex = useTimelineEditorAPI.getState().lastKeyframeSelectedIndex;

        // Get the keyframe index from the keyframes object ( this is done here because of rerender)
        const keyframes = useTimelineEditorAPI.getState().keyframes;
        const keyframesArray = Object.entries(keyframes);
        const keyframeIndex = keyframesArray.findIndex(([key]) => key === keyframeKey);

        const keyframeKeys = Object.keys(keyframes)


        // Click + CTRL key ( command key on macOS )
        if (event.metaKey || event.ctrlKey) {
            const newSelectedKeys = selectedKeyframeKeys.includes(keyframeKey)
                ? selectedKeyframeKeys.filter(key => key !== keyframeKey)
                : [...selectedKeyframeKeys, keyframeKey];
            useTimelineEditorAPI.getState().setSelectedKeyframeKeys(newSelectedKeys);
        }
        else if(event.shiftKey && lastKeyframeSelectedIndex !== null){
            const start = Math.min(lastKeyframeSelectedIndex, keyframeIndex);
            const end = Math.max(lastKeyframeSelectedIndex, keyframeIndex);
            const newSelectedKeyframeKeys = keyframeKeys.slice(start, end + 1);

            useTimelineEditorAPI.getState().setSelectedKeyframeKeys(newSelectedKeyframeKeys)
        }
        // Normal Click
        else {
            useTimelineEditorAPI.getState().setSelectedKeyframeKeys([keyframeKey]);
        }

        setLastKeyframeSelectedIndex(keyframeIndex)
    }, [])

    return (
        <RowDnd
            left={left}
            width={rowHeight / 2}
            start={startLeft}
            grid={snap ? ONE_SECOND_UNIT_WIDTH / 10 : 1}
            enableDragging={true}
            enableResizing={false}
            bounds={{
                left: 0,
                right: ONE_SECOND_UNIT_WIDTH * 1000
            }}
            // @ts-expect-error
            onDragEnd={handleOnDrag}
            onDrag={handleOnDrag}
        >
            <div
                className={`absolute h-2 w-[11px] fill-white hover:fill-blue-600
                    ${isSelected && "!fill-yellow-300"} `
                }
                style={{
                    left: `${left}px`,
                    top: `${rowHeight / 4}px`,
                }}
                onClick={handleOnClick}
                onContextMenu={(e) => { setSelectedKeyframeKeys([keyframe.id]) }}
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
                    <KeyframeContextMenu trackKey={trackKey} keyframeKey={keyframeKey}/>
                </ContextMenu>

            </div>
        </RowDnd>
    );
})

export default Keyframe
