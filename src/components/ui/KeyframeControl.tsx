import React, { useEffect, useMemo, useRef, useState, FC, memo, useLayoutEffect } from 'react';
import Square from "@geist-ui/icons/square"
import ChevronLeft from "@geist-ui/icons/chevronLeft"
import ChevronRight from "@geist-ui/icons/chevronRight"
import { useTimelineEditorAPI } from '@vxengine/managers/TimelineManager/store';
import { IKeyframe } from '@vxengine/AnimationEngine/types/track';
import { useAnimationEngineEvent } from '@vxengine/AnimationEngine';
import { getVXEngineState } from '@vxengine/engine';

interface TimelineKeyframeControlProps {
    propertyKey: string,
    disabled?: boolean
}

const KeyframeControl: FC<TimelineKeyframeControlProps> = memo(({ propertyKey, disabled }) => {        
    const createKeyframe = useTimelineEditorAPI(state => state.createKeyframe)
    const moveToNextKeyframe = useTimelineEditorAPI(state => state.moveToNextKeyframe)
    const moveToPreviousKeyframe = useTimelineEditorAPI(state => state.moveToPreviousKeyframe)
    const makePropertyTracked = useTimelineEditorAPI(state => state.makePropertyTracked)

    const [isOnKeyframe, setIsOnKeyframe] = useState(false);
    const track = useTimelineEditorAPI(state => state.tracks[propertyKey]);
    const isPropertyTracked = !!track;

    const sortedKeyframes = useMemo(() => {
        if(isPropertyTracked)
            return Object.values(track.keyframes).sort((a, b) => a.time - b.time )
        return null;
    }, [track?.keyframes])
    
    const checkIfOnKeyframe = ({ time }) => {
        if(!isPropertyTracked) return ;
        const isCursorOnKeyframe = sortedKeyframes.some(
            (kf: IKeyframe) => kf.time === time
        );
        setIsOnKeyframe(isCursorOnKeyframe);
    };

    useAnimationEngineEvent("timeUpdated", checkIfOnKeyframe)

    useLayoutEffect(() => {
        const animationEngine = getVXEngineState().getState().animationEngine;
        const time = animationEngine.getCurrentTime();
        checkIfOnKeyframe({ time })
    }, [propertyKey, sortedKeyframes])

    const handleMiddleButton = () => {
        if(isPropertyTracked === true){
            const trackKey = propertyKey
            createKeyframe({trackKey}) // auto sets the value to the ref property path of the object
        }
        else if ( isPropertyTracked === false) {
            // This is a singular static prop
            const staticPropKey = propertyKey;
            makePropertyTracked(staticPropKey)
        }
    }

    return (
        <div className={`flex flex-row h-[12px] ${disabled && "opacity-0"}`}>
            {isPropertyTracked &&
                <button
                    onClick={() => moveToPreviousKeyframe(propertyKey)}
                    className='hover:*:stroke-[5] hover:*:stroke-white'
                    disabled={disabled}
                >
                    <ChevronLeft className=' w-3 h-3' />
                </button>

            }
            <button
                onClick={handleMiddleButton}
                className="hover:*:stroke-[5] hover:*:stroke-white "
                disabled={disabled}
            >
                <Square className={`rotate-45 w-2 h-2 ${isOnKeyframe ? "fill-blue-500 stroke-blue-400 scale-110" : ""} ${!isPropertyTracked && " scale-90 fill-neutral-800 stroke-neutral-800"}`} />
            </button>
            {isPropertyTracked &&
                <button
                    onClick={() => moveToNextKeyframe(propertyKey)}
                    className='hover:*:stroke-[5] hover:*:stroke-white'
                    disabled={disabled}
                >
                    <ChevronRight className='w-3 h-3 ' />
                </button>

            }
        </div>
    )
});

export default KeyframeControl;