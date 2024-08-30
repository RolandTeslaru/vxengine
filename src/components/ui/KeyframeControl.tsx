import React, { useEffect, useRef, useState } from 'react';
import { Square, ChevronLeft, ChevronRight } from '@geist-ui/icons';
import { useTimelineEditorStore } from 'vxengine/managers/TimelineManager/store';
import { useVXEngine } from 'vxengine/engine';
import { useObjectManagerStore } from 'vxengine/managers/ObjectManager/store';
import { shallow } from 'zustand/shallow';
import { handleSetCursor } from 'vxengine/managers/TimelineManager/utils/handleSetCursor';
import { ITrack } from 'vxengine/AnimationEngine/types/track';

interface KeyframeControlProps {
  propertyPath: string;
  value: number
}

const KeyframeControl: React.FC<KeyframeControlProps> = ({ propertyPath, value }) => {
  const { createNewKeyframe, findTrackByPropertyPath, moveToNextKeyframe, moveToPreviousKeyframe } = useTimelineEditorStore(state => ({
    createNewKeyframe: state.createNewKeyframe,
    findTrackByPropertyPath: state.findTrackByPropertyPath,
    moveToNextKeyframe: state.moveToNextKeyframe,
    moveToPreviousKeyframe: state.moveToPreviousKeyframe
  }))
  const { editorData } = useTimelineEditorStore(state => ({
    editorData: state.editorData,
  }), shallow);

  const cursorTimeRef = useRef(useTimelineEditorStore.getState().cursorTime);
  const [isOnKeyframe, setIsOnKeyframe] = useState(false);

  const vxkey = useObjectManagerStore(state => state.selectedObjects[0]?.vxkey, shallow);

  const { animationEngine } = useVXEngine();

  useEffect(() => {
    const unsubscribe = useTimelineEditorStore.subscribe(state => {
      cursorTimeRef.current = state.cursorTime;
      checkIfOnKeyframe();
    });
    return () => unsubscribe();
  }, [editorData, propertyPath]);

  const checkIfOnKeyframe = () => {
    if (track) {
      const isKeyframePresent = track.keyframes.some(kf => kf.time === cursorTimeRef.current);
      setIsOnKeyframe(isKeyframePresent);
    }
  };


  const track = findTrackByPropertyPath(vxkey, propertyPath);


  return (
    <div className='flex flex-row h-[12px]'>
      {track && 
        <button onClick={() => moveToPreviousKeyframe(animationEngine, vxkey, propertyPath)} className='hover:*:stroke-[5] hover:*:stroke-white'>
          <ChevronLeft className=' w-3 h-3' />
        </button>
      }
      <button onClick={() => createNewKeyframe(animationEngine, vxkey, propertyPath, value)} className="hover:*:stroke-[5] hover:*:stroke-white ">
        <Square className={`rotate-45 w-2 h-2 ${isOnKeyframe ? "fill-blue-500 stroke-blue-400 scale-110" : ""} ${!track && " scale-90 fill-neutral-800 stroke-neutral-800"}`} />
      </button>
      {track && 
        <button onClick={() => moveToNextKeyframe(animationEngine, vxkey, propertyPath)} className='hover:*:stroke-[5] hover:*:stroke-white'>
          <ChevronRight className='w-3 h-3 ' />
        </button>
      }
    </div>
  );
}

export default KeyframeControl;