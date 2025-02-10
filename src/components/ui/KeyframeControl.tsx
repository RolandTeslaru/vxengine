import React, { useMemo, useState, FC, memo, useLayoutEffect, useCallback } from 'react';
import Square from "@geist-ui/icons/square"
import ChevronLeft from "@geist-ui/icons/chevronLeft"
import ChevronRight from "@geist-ui/icons/chevronRight"
import { moveToNextKeyframeSTATIC, moveToPreviousKeyframeSTATIC } from '@vxengine/managers/TimelineManager/TimelineEditor/store';
import { useTimelineManagerAPI } from '@vxengine/managers/TimelineManager/store';
import { useAnimationEngineEvent } from '@vxengine/AnimationEngine';
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from '../shadcn/contextMenu';
import PopoverShowTrackData from './Popovers/PopoverShowTrackData';
import PopoverShowStaticPropData from './Popovers/PopoverShowStaticPropData';
import { ALERT_MakePropertyStatic, ALERT_ResetProperty } from './DialogAlerts/Alert';
import { pushDialogStatic } from '@vxengine/managers/UIManager/store';
import { extractDataFromTrackKey } from '@vxengine/managers/TimelineManager/utils/trackDataProcessing';
import animationEngineInstance from '@vxengine/singleton';

interface TimelineKeyframeControlProps {
    trackKey: string,
    disabled?: boolean
}

const KeyframeControl: FC<TimelineKeyframeControlProps> = memo(({ trackKey, disabled }) => {
    const {vxkey, propertyPath} = useMemo(() => {
        return extractDataFromTrackKey(trackKey)
    }, [trackKey])

    const [isOnKeyframe, setIsOnKeyframe] = useState(false);

    const track = useTimelineManagerAPI(state => state.tracks[trackKey]);
    const orderedKeyframeKeys = track?.orderedKeyframeKeys
    const isPropertyTracked = !!track;

    // Initialize
    useLayoutEffect(() => {
        const time = animationEngineInstance.getCurrentTime();
        checkIfOnKeyframe({ time })
    }, [trackKey, orderedKeyframeKeys])

    const checkIfOnKeyframe = useCallback(({ time }) => {
        if (!isPropertyTracked) return;

        let left = 0;
        let right = orderedKeyframeKeys.length - 1;

        while (left <= right) {
            const mid = Math.floor((left + right) / 2);
            const midKey = orderedKeyframeKeys[mid];
            const midTime = track.keyframes[midKey].time;
    
            if (midTime === time) {
                setIsOnKeyframe(true);
                return;
            } else if (midTime < time) {
                left = mid + 1;
            } else {
                right = mid - 1;
            }
        }
        setIsOnKeyframe(false);
    }, [track?.orderedKeyframeKeys, track?.keyframes])

    useAnimationEngineEvent("timeUpdated", checkIfOnKeyframe)

    const handleMiddleButton = useCallback(() => {
        const makePropertyTracked = useTimelineManagerAPI.getState().makePropertyTracked;
        const createKeyframe = useTimelineManagerAPI.getState().createKeyframe
        if (isPropertyTracked === true) {
            createKeyframe({ trackKey }) // auto sets the value to the ref property path of the object
        }
        else if (isPropertyTracked === false) {
            // This is a singular static prop
            const staticPropKey = trackKey;
            makePropertyTracked(staticPropKey)
        }
    }, [isPropertyTracked])

    return (
        <ContextMenu>
            <ContextMenuTrigger>
                <div className={`flex gap-[1px] h-[12px] w-[26px] ${disabled && "opacity-0"}`}>
                    {isPropertyTracked &&
                        <button
                            onClick={() => moveToPreviousKeyframeSTATIC(trackKey)}
                            className='hover:*:stroke-[5] hover:*:stroke-white'
                            disabled={disabled}
                        >
                            <ChevronLeft className=' w-2 h-2 scale-150' />
                        </button>
                    }
                    <button
                        onClick={handleMiddleButton}
                        className="hover:*:stroke-[5] mx-auto hover:*:stroke-white "
                        disabled={disabled}
                    >
                        <Square className={`rotate-45 w-2 h-2 ${isOnKeyframe ? "fill-blue-500 stroke-blue-400 scale-110" : ""} ${!isPropertyTracked && " scale-90 fill-neutral-800 stroke-neutral-800"}`} />
                    </button>
                    {isPropertyTracked &&
                        <button
                            onClick={() => moveToNextKeyframeSTATIC(trackKey)}
                            className='hover:*:stroke-[5] hover:*:stroke-white'
                            disabled={disabled}
                        >
                            <ChevronRight className='w-2 h-2 scale-150' />
                        </button>

                    }
                </div>
            </ContextMenuTrigger>
            <ContextMenuContent className='flex flex-col'>
                {isPropertyTracked ?
                    <PopoverShowTrackData trackKey={trackKey}>
                        <p>Show Data</p>
                    </PopoverShowTrackData>
                    :
                    <PopoverShowStaticPropData staticPropKey={trackKey}>
                        <p>Show Data</p>
                    </PopoverShowStaticPropData>
                }
                {isPropertyTracked &&
                    <ContextMenuItem
                        onClick={(e) => {
                            pushDialogStatic({
                                content: <ALERT_MakePropertyStatic vxkey={vxkey} propertyPath={propertyPath} />, 
                                type: "alert"
                            })
                        }}
                    >
                        <p className=' text-red-600'>
                            Make Property Static
                        </p>
                    </ContextMenuItem>
                }
                <ContextMenuItem
                    onClick={() => pushDialogStatic({
                        content: <ALERT_ResetProperty vxkey={vxkey} propertyPath={propertyPath} />, 
                        type: "alert"
                    })}
                >
                    <p className=' text-red-600'>
                        Remove Property
                    </p>
                </ContextMenuItem>
            </ContextMenuContent>
        </ContextMenu>
    )
});

export default KeyframeControl;