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
    keyframe: IKeyframe;
    scale: number
    snap: boolean
    isSelected: boolean
};

const Keyframe: React.FC<EditKeyframeProps> = memo(({
    keyframe,
    track,
    scale,
    snap,
    isSelected
}) => {
    const rowHeight = DEFAULT_ROW_HEIGHT
    const trackKey = `${track.vxkey}.${track.propertyPath}`

    const selectKeyframe = useTimelineEditorAPI(state => state.selectKeyframe)
    const setLastKeyframeSelectedIndex = useTimelineEditorAPI(state => state.setLastKeyframeSelectedIndex)

    const startLeft = 12.5;
    const [left, setLeft] = useState(() => {
        return parserTimeToPixel(keyframe.time, startLeft);
    });

    useEffect(() => {
        setLeft(parserTimeToPixel(keyframe.time, startLeft));
    }, [keyframe.time, startLeft, scale]);


    const handleOnDrag = useCallback((data: { left: number, lastLeft: number }) => {
        const {selectedKeyframeKeys, setKeyframeTime } = useTimelineEditorAPI.getState();

        const selectedKeyframesFlatMap = Object.values(selectedKeyframeKeys).flatMap(track => Object.values(track));

        if (Object.entries(selectedKeyframeKeys).length === 0)
            selectKeyframe(trackKey, keyframe.id)
        // Single Keyframe Drag
        if (selectedKeyframesFlatMap.length == 1) {
            const newTime = parserPixelToTime(data.left, startLeft)
            setKeyframeTime(keyframe.id, trackKey, newTime);
        }
        // Multiple Keyframe Drag
        else if (selectedKeyframesFlatMap.length > 1) {
            const lastTime = parserPixelToTime(data.lastLeft, startLeft)
            const newTime = parserPixelToTime(data.left, startLeft)
            const deltaTime = newTime - lastTime;

            selectedKeyframesFlatMap.forEach(keyframeKey => {
                const oldKeyframeTime = keyframe.time
                const newKeyframeTime = oldKeyframeTime + deltaTime
                if (newKeyframeTime !== null && newKeyframeTime !== undefined && !isNaN(newKeyframeTime)) {
                    setKeyframeTime(keyframe.id, trackKey, parseFloat(newKeyframeTime.toFixed(4)))
                }
            })
        }
    }, [])


    const handleOnClick = (event: React.MouseEvent, trackKey: string, keyframe: IKeyframe) => {
        event.preventDefault();
        console.log("HANDLE KEYFRAME CLICK")

        const timelineEditorAPI = useTimelineEditorAPI.getState();

        const {
            selectedKeyframeKeys,
            selectKeyframe,
            removeSelectedKeyframe,
            isKeyframeSelected,
            clearSelectedKeyframes,
            getAllKeyframes,
            setLastKeyframeSelectedIndex,
            lastKeyframeSelectedIndex,
        } = timelineEditorAPI;
        // Get keyframes and their indices
        const keyframes = getAllKeyframes(); // Retrieve all keyframes for the track
        
        const selectedKeyframesFlatMap = Object.values(selectedKeyframeKeys).flatMap(track => Object.keys(track));
        // Find the index of the clicked keyframe
        const keyframeIndex = keyframes.findIndex(kf => kf.id === keyframe.id)
        console.log("Keyframe Index ", keyframeIndex)

        if (keyframeIndex === -1) return; // Keyframe not found


        // Click + CTRL key ( command key on macOS )
        // CTRL or Meta key (multi-select)
        if (event.metaKey || event.ctrlKey) {
            console.log("Keyframe Control click")
            if (isKeyframeSelected(trackKey, keyframe.id)) {
                // If already selected, remove the selection
                removeSelectedKeyframe(trackKey, keyframe.id)
            } else {
                // Add the keyframe to the selection
                selectKeyframe(trackKey, keyframe.id);
            }
        }
        else if (event.shiftKey && lastKeyframeSelectedIndex !== null) {
            console.log("Keyframe Shift click")
            const start = Math.min(lastKeyframeSelectedIndex, keyframeIndex);
            const end = Math.max(lastKeyframeSelectedIndex, keyframeIndex);

            // Select all keyframes in the range
            for (let i = start; i <= end; i++) {
                selectKeyframe(trackKey, selectedKeyframesFlatMap[i]);
            }
        }
        // Normal Click
        else {
            console.log("Keyframe Normal click")
            clearSelectedKeyframes();
            selectKeyframe(trackKey, keyframe.id);
        }

        setLastKeyframeSelectedIndex(keyframeIndex)
    }

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
                onClick={(e) => handleOnClick(e, trackKey, keyframe)}
                onContextMenu={(e) => { setSelectedKeyframeKeys() }}
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
                    <KeyframeContextMenu trackKey={trackKey} keyframeKey={keyframe.id} />
                </ContextMenu>

            </div>
        </RowDnd>
    );
})


export default Keyframe
