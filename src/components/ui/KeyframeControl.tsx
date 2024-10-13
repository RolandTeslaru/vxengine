import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Square, ChevronLeft, ChevronRight } from '@geist-ui/icons';
import { useTimelineEditorAPI } from '@vxengine/managers/TimelineManager/store';
import { IKeyframe } from '@vxengine/AnimationEngine/types/track';

interface TimelineKeyframeControlProps {
    trackKey?: string,
    disabled?: boolean
}

const KeyframeControl: React.FC<TimelineKeyframeControlProps> = React.memo(({ trackKey, disabled }) => {
    const createKeyframe = useTimelineEditorAPI(state => state.createKeyframe)
    const moveToNextKeyframe = useTimelineEditorAPI(state => state.moveToNextKeyframe)
    const moveToPreviousKeyframe = useTimelineEditorAPI(state => state.moveToPreviousKeyframe)
    const makePropertyTracked = useTimelineEditorAPI(state => state.makePropertyTracked)

    const [isOnKeyframe, setIsOnKeyframe] = useState(false);
    const keyframeKeysForTrack = useTimelineEditorAPI(state => state.tracks[trackKey]?.keyframes)

    const keyframesOnTrack = useMemo(() => {
        return useTimelineEditorAPI.getState().getKeyframesForTrack(trackKey);
    }, [trackKey, keyframeKeysForTrack]);

    const isPropertyTracked = useMemo(() => {
        if (keyframesOnTrack.length > 0)
            return true
        else
            return false
    }, [keyframesOnTrack])

    const checkIfOnKeyframe = () => {
        if (trackKey) {
            const isCursorOnKeyframe = keyframesOnTrack.some((kf: IKeyframe) => kf.time === useTimelineEditorAPI.getState().cursorTime);
            setIsOnKeyframe(isCursorOnKeyframe);
        }
    };

    useEffect(() => {
        const unsubscribe = useTimelineEditorAPI.subscribe(() => checkIfOnKeyframe());
        return () => unsubscribe();
    }, [trackKey, keyframesOnTrack]);

    useEffect(() => {
        checkIfOnKeyframe()
    }, [trackKey, keyframesOnTrack])

    const handleMiddleButton = () => {
        if(isPropertyTracked === true){
            createKeyframe({trackKey}) // auto sets the value to the ref property path of the object
        }
        else if ( isPropertyTracked === false) {
            // This is a singular static prop
            const staticPropKey = trackKey;
            makePropertyTracked(staticPropKey)
        }
    }

    return (
        <div className={`flex flex-row h-[12px] ${disabled && "opacity-0"}`}>
            {isPropertyTracked &&
                <button
                    onClick={() => moveToPreviousKeyframe(keyframesOnTrack)}
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
                    onClick={() => moveToNextKeyframe(keyframesOnTrack)}
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