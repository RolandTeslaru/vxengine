// VXEngine - VEXR Labs' proprietary toolset for React Three Fiber
// (c) 2024 VEXR Labs. All Rights Reserved.
// See the LICENSE file in the root directory of this source tree for licensing information.

import React, { useRef } from 'react';
import { TimelineEditor as ITimelineEditor, TimelineRow, TimelineState } from '@vxengine/AnimationEngine/interface/timeline';
import { DEFAULT_SCALE_WIDTH, MIN_SCALE_COUNT, PREFIX, START_CURSOR_TIME } from '@vxengine/AnimationEngine/interface/const';
import useAnimationEngineEvent from '@vxengine/AnimationEngine/utils/useAnimationEngineEvent';
import { useRefStore } from '@vxengine/utils/useRefStore';
import { checkProps } from '../../utils/check_props';
import { useTimelineEditorAPI } from '../..';
import { handleSetCursor } from '../../utils/handleSetCursor';
import { TimeArea } from './TimeArea';
import { EditArea } from './EditArea';

export const startLeft = 0;

const TimelineArea: React.FC<ITimelineEditor> = ((props) => {
  const checkedProps = checkProps(props);

  const scale = useTimelineEditorAPI(state => state.scale)
  const scaleCount = useTimelineEditorAPI(state => state.scaleCount);
  const width = useTimelineEditorAPI(state => state.width);
  const setWidth = useTimelineEditorAPI(state => state.setWidth);
  const setScrollLeft = useTimelineEditorAPI(state => state.setScrollLeft);

  const editAreaRef = useRefStore(state => state.editAreaRef)
  const trackListRef = useRefStore(state => state.trackListRef)
  const autoScrollWhenPlay = useRef<boolean>(true);

  /** Set scroll left */
  const handleDeltaScrollLeft = (delta: number) => {
    console.log("Width in handleDelta Scroll ", width)
    const scrollLeft = useTimelineEditorAPI.getState().scrollLeft
    // Disable automatic scrolling when the maximum distance is exceeded
    const data = scrollLeft + delta;
    if (data > scaleCount * (DEFAULT_SCALE_WIDTH - 1) + startLeft - width) return;
    setScrollLeft(useTimelineEditorAPI.getState().scrollLeft + delta)
  };

  // Process runner related data
  useAnimationEngineEvent(
    'timeUpdatedAutomatically',
    ({ time }) => handleSetCursor({ time, rerender: false })
  );

  useAnimationEngineEvent('timeUpdatedAutomatically', ({ time }) => {
    if (autoScrollWhenPlay.current) {
      const autoScrollFrom = useTimelineEditorAPI.getState().clientWidth * 70 / 100;
      const left = time * (DEFAULT_SCALE_WIDTH / scale) + startLeft - autoScrollFrom;
      editAreaRef.current.scrollLeft = left;
      setScrollLeft(left);
    }
  })

  const handleScroll = (e) => {
    const scrollContainer = e.target;

    trackListRef.current.scrollTop =  scrollContainer.scrollTop;
  };

  return (
    <div className={`w-full h-full border border-neutral-800 border-opacity-70 bg-neutral-950 rounded-2xl relative flex flex-col overflow-hidden  `}>
      <div
        ref={editAreaRef}
        onScroll={handleScroll} // Ensure this is not interfering with default behavior
        className={"w-full h-full !overflow-x-scroll !overflow-y-scroll"}
      >
        <TimeArea 
          deltaScrollLeft={handleDeltaScrollLeft}
        />
        <EditArea
          {...checkedProps}
          deltaScrollLeft={handleDeltaScrollLeft}
        />
      </div>
      
    </div>
  );
});


export default TimelineArea