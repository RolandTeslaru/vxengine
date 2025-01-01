// VXEngine - VEXR Labs' proprietary toolset for React Three Fiber
// (c) 2024 VEXR Labs. All Rights Reserved.
// See the LICENSE file in the root directory of this source tree for licensing information.

import React, { useEffect, useRef, useState } from 'react';
import { TimelineEditor as ITimelineEditor, TimelineRow, TimelineState } from '@vxengine/AnimationEngine/interface/timeline';
import { DEFAULT_SCALE_WIDTH, MIN_SCALE_COUNT, PREFIX, START_CURSOR_TIME } from '@vxengine/AnimationEngine/interface/const';
import { useAnimationEngineEvent } from '@vxengine/AnimationEngine/utils/useAnimationEngineEvent';
import { useRefStore } from '@vxengine/utils/useRefStore';
import { useTimelineEditorAPI } from '../..';
import { handleSetCursor } from '../../utils/handleSetCursor';
import { TimeArea } from './TimeArea';
import { EditArea } from './EditArea';
import { ONE_SECOND_UNIT_WIDTH } from '@vxengine/managers/constants';

export const startLeft = 0;

const TimelineArea = (() => {
  const timelineAreaRef = useRefStore(state => state.timelineAreaRef);
  const trackListRef = useRefStore(state => state.trackListRef);
  const scrollSyncId = useRefStore(state => state.scrollSyncId);
  const scrollLeftRef = useRefStore(state => state.scrollLeftRef)

  const scale = useTimelineEditorAPI(state => state.scale)

  // Sync Cursor with Engine time
  useAnimationEngineEvent(
    'timeUpdatedByEngine',
    ({ time }) => {
      handleSetCursor({ time, rerender: false })

      const clientWidth = timelineAreaRef.current.offsetWidth
      
      const autoScrollFrom = clientWidth * 70 / 100;
      const left = time * (ONE_SECOND_UNIT_WIDTH / scale) + startLeft - autoScrollFrom;
      timelineAreaRef.current.scrollLeft = left;
      scrollLeftRef.current = left
    }
  );

  const handleOnScroll = (e: React.UIEvent<HTMLDivElement, UIEvent>) => {
      const scrollContainer = e.target;
  
      if (!trackListRef.current) return;
  
      if (scrollSyncId.current) cancelAnimationFrame(scrollSyncId.current);
  
      scrollSyncId.current = requestAnimationFrame(() => {
        // @ts-expect-error
        trackListRef.current.scrollTop = scrollContainer.scrollTop;
      })
    }

  return (
    <div 
        className={`w-full h-full border border-neutral-800 bg-neutral-950 
                    rounded-2xl relative flex flex-col !overflow-hidden  `}
    >
      <div
        className={"w-full h-full relative !overflow-y-scroll"}
        ref={timelineAreaRef}
        onScroll={handleOnScroll}
      >
        <TimeArea />
        <EditArea />
      </div>

    </div>
  );
});


export default TimelineArea