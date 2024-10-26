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
import { ONE_SECOND_UNIT_WIDTH } from '@vxengine/managers/constants';

export const startLeft = 0;

const TimelineArea = (() => {
  const timelineAreaRef = useRefStore(state => state.timelineAreaRef);
  const scrollLeftRef = useRefStore(state => state.scrollLeftRef)

  // Sync Cursor with Engine time
  useAnimationEngineEvent(
    'timeUpdatedAutomatically',
    ({ time }) => {
      handleSetCursor({ time, rerender: false })

      const scale = useTimelineEditorAPI.getState().scale
      
      const autoScrollFrom = useTimelineEditorAPI.getState().clientWidth * 70 / 100;
      const left = time * (ONE_SECOND_UNIT_WIDTH / scale) + startLeft - autoScrollFrom;
      timelineAreaRef.current.scrollLeft = left;
      scrollLeftRef.current = left
    }
  );

  return (
    <div className={`w-full h-full min-h-[414px] border border-neutral-800 border-opacity-70 bg-neutral-950 rounded-2xl relative flex flex-col overflow-hidden  `}>
      <div
        ref={timelineAreaRef}
        className={"w-full h-full !overflow-y-scroll"}
      >
        <TimeArea />
        <EditArea />
      </div>

    </div>
  );
});


export default TimelineArea