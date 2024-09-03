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

interface KeyframeControlProps {
  propertyPath: string;
  isOnKeyframe: boolean
  isPropertyTracked: boolean
}

export const KeyframeControl: React.FC<KeyframeControlProps> = ({ propertyPath, isOnKeyframe, isPropertyTracked }) => {
  const createNewKeyframe = useTimelineEditorStore(state => state.createNewKeyframe);
  const moveToNextKeyframe = useTimelineEditorStore(state => state.moveToNextKeyframe);
  const moveToPreviousKeyframe = useTimelineEditorStore(state => state.moveToPreviousKeyframe);

  const vxkey = useObjectManagerStore(state => state.selectedObjects[0]?.vxkey, shallow);

  const { animationEngine } = useVXEngine();

  return (
    <div className='flex flex-row h-[12px]'>
      {isPropertyTracked &&
        <button onClick={() => moveToPreviousKeyframe(animationEngine, vxkey, propertyPath)} className='hover:*:stroke-[5] hover:*:stroke-white'>
          <ChevronLeft className=' w-3 h-3' />
        </button>
      }
      <button
        disabled={isOnKeyframe ? true : false}
        onClick={() => createNewKeyframe(
          animationEngine,
          vxkey,
          propertyPath,
          getNestedProperty(useObjectManagerStore.getState().selectedObjects[0].ref.current, propertyPath)
        )}
        className="hover:*:stroke-[5] hover:*:stroke-white "
      >
        <Square className={`rotate-45 w-2 h-2 ${isOnKeyframe ? "fill-blue-500 stroke-blue-400 scale-110" : ""} ${!isPropertyTracked && " scale-90 fill-neutral-800 stroke-neutral-800"}`} />
      </button>
      {isPropertyTracked &&
        <button onClick={() => moveToNextKeyframe(animationEngine, vxkey, propertyPath)} className='hover:*:stroke-[5] hover:*:stroke-white'>
          <ChevronRight className='w-3 h-3 ' />
        </button>
      }
    </div>
  );
}

export default KeyframeControl;