import React, { useMemo, useState, FC, memo, useLayoutEffect, useCallback } from 'react';
import { moveToNextKeyframeSTATIC, moveToPreviousKeyframeSTATIC } from '@vxengine/managers/TimelineManager/TimelineEditor/store';
import { useTimelineManagerAPI } from '@vxengine/managers/TimelineManager/store';
import { useAnimationEngineEvent } from '@vxengine/AnimationEngine';
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuSub, ContextMenuSubContent, ContextMenuSubTrigger, ContextMenuTrigger } from '../shadcn/contextMenu';
import { ALERT_MakePropertyStatic, ALERT_ResetProperty } from './DialogAlerts/Alert';
import { pushDialogStatic } from '@vxengine/managers/UIManager/store';
import animationEngineInstance from '@vxengine/singleton';
import { ChevronLeft, ChevronRight, Lambda, Square } from './icons';
import StaticPropData from './DataContextContext/StaticProp';
import SideEffectData from './DataContextContext/SideEffect';
import { TrackData } from './DataContextContext/Track';
import { EditorTrack } from '@vxengine/types/data/editorData';

interface TimelineKeyframeControlProps {
    vxkey: string,
    param: { propertyPath: string }
    disabled?: boolean
    horizontal?: boolean
}

const handleMiddleButton = (generalKey: string, isPropertyTracked: boolean) => {
    const makePropertyTracked = useTimelineManagerAPI.getState().makePropertyTracked;
    const createKeyframe = useTimelineManagerAPI.getState().createKeyframe
    if (isPropertyTracked === true) {
        const trackKey = generalKey;
        createKeyframe({ trackKey }) // auto sets the value to the ref property path of the object
    }
    else if (isPropertyTracked === false) {
        // This is a singular static prop
        const staticPropKey = generalKey;
        makePropertyTracked(staticPropKey)
    }
}

const checkIfOnKeyframe = (time: number, track: EditorTrack, setIsOnKeyframe: (value: boolean) => void, isPropertyTracked: boolean, orderedKeyframeKeys: string[]) => {
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
}



const KeyframeControl: FC<TimelineKeyframeControlProps> = memo(({ vxkey, param: { propertyPath }, disabled, horizontal = false }) => {
    const trackKey = `${vxkey}.${propertyPath}`;
    const [isOnKeyframe, setIsOnKeyframe] = useState(false);

    const track = useTimelineManagerAPI(state => state.tracks[trackKey]);
    const orderedKeyframeKeys = track?.orderedKeyframeKeys
    const isPropertyTracked = !!track;

    const hasSideEffect = useMemo(() => {
        return animationEngineInstance.hasSideEffect(trackKey)
    }, [vxkey, propertyPath])
    // Initialize
    useLayoutEffect(() => {
        const time = animationEngineInstance.currentTime
        checkIfOnKeyframe(time, track, setIsOnKeyframe, isPropertyTracked, orderedKeyframeKeys)
    }, [vxkey, propertyPath, orderedKeyframeKeys])

    useAnimationEngineEvent("timeUpdated", ({ time }) => checkIfOnKeyframe(time, track, setIsOnKeyframe, isPropertyTracked, orderedKeyframeKeys))

    return (
        <ContextMenu>
            <ContextMenuTrigger className={`flex ${horizontal && "flex-col-reverse"} gap-2`}>
                {hasSideEffect && <Lambda size={10} className={`${horizontal ? "mx-auto" : "my-auto"} text-neutral-500!`} />}
                <div className={`flex gap-[1px] h-[12px] w-[26px] ${disabled && "opacity-0"}`}>
                    {isPropertyTracked &&
                        <button
                            onClick={() => moveToPreviousKeyframeSTATIC(trackKey)}
                            className='hover:*:stroke-5 hover:*:stroke-white'
                            disabled={disabled}
                        >
                            <ChevronLeft className=' w-2 h-2 scale-150' />
                        </button>
                    }
                    <button
                        onClick={() => handleMiddleButton(trackKey, isPropertyTracked)}
                        className="hover:*:stroke-5 mx-auto hover:*:stroke-white "
                        disabled={disabled}
                    >
                        <Square className={`rotate-45 w-2 h-2 ${isOnKeyframe ? "fill-blue-500 stroke-blue-400 scale-110" : ""} ${!isPropertyTracked && " scale-90 fill-neutral-800 stroke-neutral-800"}`} />
                    </button>
                    {isPropertyTracked &&
                        <button
                            onClick={() => moveToNextKeyframeSTATIC(trackKey)}
                            className='hover:*:stroke-5 hover:*:stroke-white'
                            disabled={disabled}
                        >
                            <ChevronRight className='w-2 h-2 scale-150' />
                        </button>

                    }
                </div>
            </ContextMenuTrigger>
            <ContextMenuContent className='flex flex-col'>
                <ContextMenuSub>
                    {isPropertyTracked ?
                        <>
                            <ContextMenuSubTrigger>
                                Show Track Data
                            </ContextMenuSubTrigger>
                            <ContextMenuSubContent>
                                <TrackData trackKey={trackKey} />
                            </ContextMenuSubContent>
                        </>
                        :
                        <>
                            <ContextMenuSubTrigger>
                                <p>Show StaticProp Data</p>
                            </ContextMenuSubTrigger>
                            <ContextMenuSubContent>
                                <StaticPropData staticPropKey={trackKey} />
                            </ContextMenuSubContent>
                        </>
                    }
                </ContextMenuSub>
                {hasSideEffect && (
                    <ContextMenuSub>
                        <ContextMenuSubTrigger>
                            <p>Show SideEffect</p>
                        </ContextMenuSubTrigger>
                        <ContextMenuSubContent>
                            <SideEffectData trackKey={trackKey} />
                        </ContextMenuSubContent>
                    </ContextMenuSub>
                )}
                {isPropertyTracked &&
                    <ContextMenuItem
                        onClick={(e) => pushDialogStatic({
                            content: <ALERT_MakePropertyStatic vxkey={vxkey} propertyPath={propertyPath} />,
                            type: "alert"
                        })}
                        className='text-red-500'
                    >
                            Make Property Static
                    </ContextMenuItem>
                }
                <ContextMenuItem
                    onClick={() => pushDialogStatic({
                        content: <ALERT_ResetProperty vxkey={vxkey} propertyPath={propertyPath} />,
                        type: "alert"
                    })}
                    className='text-red-500'
                >
                    Remove Property
                </ContextMenuItem>
            </ContextMenuContent>
        </ContextMenu>
    )
});

export default KeyframeControl;