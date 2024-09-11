// VXEngine - VEXR Labs' proprietary toolset for React Three Fiber
// (c) 2024 VEXR Labs. All Rights Reserved.
// See the LICENSE file in the root directory of this source tree for licensing information.

import React, { useEffect, useImperativeHandle, useLayoutEffect, useRef, useState } from 'react';
import { ScrollSync } from 'react-virtualized';
import { checkProps } from '../utils/check_props';
import { getScaleCountByRows, parserPixelToTime, parserTimeToPixel } from '../utils/deal_data';
import { Cursor } from './cursor/cursor';
import { EditArea } from './edit_area/edit_area';
import './timeline.scss';
import { TimeArea } from './time_area/time_area';
import { TimelineEditor as ITimelineEditor, TimelineRow, TimelineState } from 'vxengine/AnimationEngine/interface/timeline';
import { DEFAULT_SCALE_WIDTH, MIN_SCALE_COUNT, PREFIX, START_CURSOR_TIME } from 'vxengine/AnimationEngine/interface/const';
import { useVXEngine } from 'vxengine/engine';
import useAnimationEngineEvent from 'vxengine/AnimationEngine/utils/useAnimationEngineEvent';
import { useTimelineEditorStore } from '../store';
import { handleSetCursor } from '../utils/handleSetCursor';
import { shallow } from 'zustand/shallow';

export const startLeft = 0;

const TimelineEditor = React.forwardRef<TimelineState, ITimelineEditor>((props, ref) => {
  const checkedProps = checkProps(props);

  const { animationEngine } = useVXEngine();
  const { scale, setCursorTime, scaleCount, width, setWidth, editAreaRef, scrollLeft, setScrollLeft, } = useTimelineEditorStore(state => ({
    scale: state.scale,
    setCursorTime: state.setCursorTime,
    scaleCount: state.scaleCount,
    width: state.width,
    setWidth: state.setWidth,
    editAreaRef: state.editAreaRef,
    scrollLeft: state.scrollLeft,
    setScrollLeft: state.setScrollLeft,
  }), shallow);
  const domRef = useRef<HTMLDivElement | null>();
  const autoScrollWhenPlay = useRef<boolean>(true);

  /** Set scroll left */
  const handleDeltaScrollLeft = (delta: number) => {
    // Disable automatic scrolling when the maximum distance is exceeded
    const data = scrollLeft + delta;
    if (data > scaleCount * (DEFAULT_SCALE_WIDTH - 1) + startLeft - width) return;
    setScrollLeft(useTimelineEditorStore.getState().scrollLeft + delta)
  };

  // Process runner related data
  useAnimationEngineEvent(
    'timeUpdatedAutomatically',
    ({ time }) => handleSetCursor({ time, animationEngine })
  );

  useAnimationEngineEvent('timeUpdatedAutomatically', ({ time }) => {
    if (autoScrollWhenPlay.current) {
      const autoScrollFrom = useTimelineEditorStore.getState().clientWidth * 70 / 100;
      const left = time * (DEFAULT_SCALE_WIDTH / scale) + startLeft - autoScrollFrom;
      editAreaRef.current.scrollLeft = left;
      setScrollLeft(left);
    }
  })


  // Monitor timeline area width changes
  useEffect(() => {
    if (editAreaRef.current) {
      const resizeObserver = new ResizeObserver(() => {
        if (!editAreaRef.current) return;
        setWidth(editAreaRef.current.getBoundingClientRect().width);
      });
      resizeObserver.observe(editAreaRef.current!);
      return () => {
        resizeObserver && resizeObserver.disconnect();
      };
    }
  }, []);

  return (
    <div ref={domRef} className={`w-full h-full border border-neutral-800 border-opacity-70 bg-neutral-950 rounded-2xl relative flex flex-col overflow-hidden  `}>
      <TimeArea />
      <EditArea
        {...checkedProps}
        deltaScrollLeft={handleDeltaScrollLeft}
      />
      <Cursor
        {...checkedProps}
        deltaScrollLeft={handleDeltaScrollLeft}
      />
    </div>
  );
});


export default TimelineEditor