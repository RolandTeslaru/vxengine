import React, { useMemo, useState, FC, memo, useLayoutEffect, useCallback } from 'react';
import { moveToNextKeyframeSTATIC, moveToPreviousKeyframeSTATIC } from '@vxengine/managers/TimelineManager/TimelineEditor/store';
import { useTimelineManagerAPI } from '@vxengine/managers/TimelineManager/store';
import { useAnimationEngineEvent } from '@vxengine/AnimationEngine';
import animationEngineInstance from '@vxengine/singleton';
import { ChevronLeft, ChevronRight, Lambda, Square } from '../icons';
import { EditorTrack } from '@vxengine/types/data/editorData';
import { useTrack } from '@vxengine/managers/TimelineManager/useTrack';

interface TimelineKeyframeControlProps {
    vxkey: string,
    param: { propertyPath: string }
    disabled?: boolean
    horizontal?: boolean
}


interface KeyrameState {
    isOnKeyframe: boolean
    hasLeftKeyframe: boolean
    hasRightKeyframe: boolean
}

const EMPTY_KEYFRAME_KEYS: readonly string[] = []


const KeyframeControl: FC<TimelineKeyframeControlProps> = memo(({ vxkey, param: { propertyPath }, disabled, horizontal = false }) => {
    const trackKey = `${vxkey}.${propertyPath}`;
    const [keyframeState, setKeyframeState] = useState<KeyrameState>({
        isOnKeyframe: false,
        hasLeftKeyframe: false,
        hasRightKeyframe: false,
    });

    const { track, orderedKeyframeKeys, isPropertyTracked } = useTrack(vxkey, propertyPath)


    const hasSideEffect = useMemo(() => {
        return animationEngineInstance
                .propertyControlService
                .hasSideEffect(trackKey)
    }, [trackKey])
    // Initialize
    useLayoutEffect(() => {
        const time = animationEngineInstance.currentTime
        handleTimeChange(time, track, isPropertyTracked, orderedKeyframeKeys, setKeyframeState);
    }, [vxkey, propertyPath, orderedKeyframeKeys])

    useAnimationEngineEvent("timeUpdated", ({ time }) => handleTimeChange(time, track, isPropertyTracked, orderedKeyframeKeys, setKeyframeState))

    return (
        <div className={`flex ${horizontal && "flex-col-reverse"} gap-2`}>
            {hasSideEffect && <Lambda size={10} className={`${horizontal ? "mx-auto" : "my-auto"} text-neutral-500!`} />}
            <div className={`flex gap-[1px] h-[12px] w-[26px] ${disabled && "opacity-0"}`}>
                {isPropertyTracked &&
                    <button
                        onClick={() => moveToPreviousKeyframeSTATIC(trackKey)}
                        className={`hover:*:stroke-5 hover:*:stroke-white  disabled:opacity-20`}
                        disabled={disabled || !keyframeState.hasLeftKeyframe}
                    >
                        <ChevronLeft className='!text-label-primary w-2 h-2 scale-150' />
                    </button>
                }
                <button
                    onClick={() => handleMiddleButton(vxkey, propertyPath, isPropertyTracked)}
                    className="hover:*:stroke-5 mx-auto hover:*:stroke-white "
                    disabled={disabled}
                >
                    <Square className={`rotate-45 w-2 h-2 !text-label-primary ${keyframeState.isOnKeyframe ? "fill-blue-500 stroke-blue-400 scale-110" : ""} ${!isPropertyTracked && " scale-90 fill-primary-regular stroke-neutral-600"}`} />
                </button>
                {isPropertyTracked &&
                    <button
                        onClick={() => moveToNextKeyframeSTATIC(trackKey)}
                        className={`hover:*:stroke-5 hover:*:stroke-white  disabled:opacity-20`}
                        disabled={disabled || !keyframeState.hasRightKeyframe}
                    >
                        <ChevronRight className='w-2 h-2 scale-150 !text-label-primary' />
                    </button>

                }
            </div>
        </div>

    )
});

export default KeyframeControl;





const handleTimeChange = (
    time: number,
    track: EditorTrack,
    isPropertyTracked: boolean,
    orderedKeyframeKeys: string[],
    setKeyframeState: React.Dispatch<React.SetStateAction<KeyrameState>>
) => {
    if (!isPropertyTracked) return

    let leftIndex = 0;
    let rightIndex = orderedKeyframeKeys.length - 1
    let foundIndex = -1;

    while (leftIndex <= rightIndex) {
        const mid = Math.floor((leftIndex + rightIndex) / 2)
        const midKey = orderedKeyframeKeys[mid];
        const midTime = track.keyframes[midKey].time;

        if (midTime === time) {
            foundIndex = mid;
            break
        } else if (midTime < time) {
            leftIndex = mid + 1;
        } else {
            rightIndex = mid - 1;
        }
    }

    let newState: KeyrameState
    if (foundIndex !== -1) {
        newState = {
            isOnKeyframe: true,
            hasLeftKeyframe: foundIndex > 0,
            hasRightKeyframe: foundIndex < orderedKeyframeKeys.length - 1,
        };
    } else {
        newState = {
            isOnKeyframe: false,
            hasLeftKeyframe: leftIndex > 0,
            hasRightKeyframe: leftIndex < orderedKeyframeKeys.length,
        };
    }

    // Update state only if something changed.
    setKeyframeState((prevState) => {
        if (
            prevState.isOnKeyframe === newState.isOnKeyframe &&
            prevState.hasLeftKeyframe === newState.hasLeftKeyframe &&
            prevState.hasRightKeyframe === newState.hasRightKeyframe
        ) {
            return prevState;
        }
        return newState;
    });
}




const handleMiddleButton = (vxkey: string, propertyPath: string, isPropertyTracked: boolean) => {

    if (isPropertyTracked === true)
        useTimelineManagerAPI
            .getState()
            .createKeyframe({ vxkey, propertyPath, overlapKeyframeCheck: true })
    else if (isPropertyTracked === false)
        useTimelineManagerAPI
            .getState()
            .makePropertyTracked(vxkey, propertyPath)
}