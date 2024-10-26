// VXEngine - VEXR Labs' proprietary toolset for React Three Fiber
// (c) 2024 VEXR Labs. All Rights Reserved.
// See the LICENSE file in the root directory of this source tree for licensing information.

import React, { useEffect, useRef, useState } from 'react';
import { TimelineEditor as ITimelineEditor, TimelineRow, TimelineState } from '@vxengine/AnimationEngine/interface/timeline';
import { DEFAULT_SCALE_WIDTH, MIN_SCALE_COUNT, PREFIX, START_CURSOR_TIME } from '@vxengine/AnimationEngine/interface/const';
import useAnimationEngineEvent from '@vxengine/AnimationEngine/utils/useAnimationEngineEvent';
import { useRefStore } from '@vxengine/utils/useRefStore';
import { useTimelineEditorAPI } from '../..';
import { handleSetCursor } from '../../utils/handleSetCursor';
import { TimeArea } from './TimeArea';
import { EditArea } from './EditArea';

export const startLeft = 0;

const TimelineArea = (() => {
  const scale = useTimelineEditorAPI(state => state.scale)
  const setScrollLeft = useTimelineEditorAPI(state => state.setScrollLeft);

  const editAreaRef = useRefStore(state => state.editAreaRef)
  const trackListRef = useRefStore(state => state.trackListRef)
  const autoScrollWhenPlay = useRef<boolean>(true);

  // Sync Cursor with Engine time
  useAnimationEngineEvent(
    'timeUpdatedAutomatically',
    ({ time }) => {
      handleSetCursor({ time, rerender: false })

      if (autoScrollWhenPlay.current) {
        const autoScrollFrom = useTimelineEditorAPI.getState().clientWidth * 70 / 100;
        const left = time * (DEFAULT_SCALE_WIDTH / scale) + startLeft - autoScrollFrom;
        editAreaRef.current.scrollLeft = left;
        setScrollLeft(left);
      }
    }
  );

  const handleScroll = (e) => {
    const scrollContainer = e.target;

    trackListRef.current.scrollTop = scrollContainer.scrollTop;
  };

  return (
    <div className={`w-full h-full min-h-[414px] border border-neutral-800 border-opacity-70 bg-neutral-950 rounded-2xl relative flex flex-col overflow-hidden  `}>
      <div
        ref={editAreaRef}
        onScroll={handleScroll} // Ensure this is not interfering with default behavior
        className={"w-full h-full !overflow-x-scroll !overflow-y-scroll"}
      >
        <TimeArea />
        <EditArea />
      </div>

    </div>
  );
});


export default TimelineArea