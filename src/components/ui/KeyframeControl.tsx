import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Square, ChevronLeft, ChevronRight } from '@geist-ui/icons';
import { useTimelineEditorStore } from 'vxengine/managers/TimelineManager/store';
import { useVXEngine } from 'vxengine/engine';
import { useObjectManagerStore } from 'vxengine/managers/ObjectManager/store';
import { shallow } from 'zustand/shallow';
import { handleSetCursor } from 'vxengine/managers/TimelineManager/utils/handleSetCursor';
import { ITrack } from 'vxengine/AnimationEngine/types/track';
import { useVXAnimationStore } from 'vxengine/store/AnimationStore';
import { getNestedProperty } from 'vxengine/utils/nestedProperty';

interface TimelineKeyframeControlProps {
    trackKeys?: string[],
}

const KeyframeControl: React.FC<TimelineKeyframeControlProps> = React.memo(({ trackKeys }) => {
    const { createKeyframe, moveToNextKeyframe, moveToPreviousKeyframe, makePropertyTracked } = useTimelineEditorStore(state => ({
        createKeyframe: state.createKeyframe,
        moveToNextKeyframe: state.moveToNextKeyframe,
        moveToPreviousKeyframe: state.moveToPreviousKeyframe,
        makePropertyTracked: state.makePropertyTracked
    }), shallow)

    const [isOnKeyframe, setIsOnKeyframe] = useState(false);

    const keyframesOnTrack = useTimelineEditorStore(
        (state) => trackKeys.flatMap((trackKey) => state.getKeyframesForTrack(trackKey)),
        shallow
    );

    const isPropertyTracked = useMemo(() => {
        if (keyframesOnTrack.length > 0)
            return true
        else
            return false
    }, [keyframesOnTrack])

    const checkIfOnKeyframe = () => {
        if (trackKeys) {
            const isCursorOnKeyframe = keyframesOnTrack.some(kf => kf.time === useTimelineEditorStore.getState().cursorTime);
            setIsOnKeyframe(isCursorOnKeyframe);
        }
    };

    useEffect(() => {
        const unsubscribe = useTimelineEditorStore.subscribe(() => checkIfOnKeyframe());
        return () => unsubscribe();
    }, [trackKeys, keyframesOnTrack]);

    useEffect(() => {
        checkIfOnKeyframe()
    }, [trackKeys, keyframesOnTrack])

    const handleMiddleButton = () => {
        if(isPropertyTracked === true){
            createKeyframe(trackKeys[0], 0)
        }
        else if ( isPropertyTracked === false && trackKeys.length === 1) {
            // This is a singular static prop
            const staticPropKey = trackKeys[0];
            makePropertyTracked(staticPropKey)
        }
    }

    return (
        <div className='flex flex-row h-[12px]'>
            {isPropertyTracked &&
                <button
                    onClick={() => moveToPreviousKeyframe(keyframesOnTrack)}
                    className='hover:*:stroke-[5] hover:*:stroke-white'
                >
                    <ChevronLeft className=' w-3 h-3' />
                </button>

            }
            <button
                onClick={handleMiddleButton}
                disabled={trackKeys.length > 1}
                className="hover:*:stroke-[5] hover:*:stroke-white "
            >
                <Square className={`rotate-45 w-2 h-2 ${isOnKeyframe ? "fill-blue-500 stroke-blue-400 scale-110" : ""} ${!isPropertyTracked && " scale-90 fill-neutral-800 stroke-neutral-800"}`} />
            </button>
            {isPropertyTracked &&
                <button
                    onClick={() => moveToNextKeyframe(keyframesOnTrack)}
                    className='hover:*:stroke-[5] hover:*:stroke-white'
                >
                    <ChevronRight className='w-3 h-3 ' />
                </button>

            }
        </div>
    )
});

export default KeyframeControl;