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
import { MIN_SCALE_COUNT, PREFIX, START_CURSOR_TIME } from 'vxengine/AnimationEngine/interface/const';
import { useVXEngine } from 'vxengine/engine';
import useAnimationEngineEvent from 'vxengine/AnimationEngine/utils/useAnimationEngineEvent';
import { useTimelineEditorStore } from '../store';
import { handleSetCursor } from '../utils/handleSetCursor';

export const startLeft = 0;

const TimelineEditor = React.forwardRef<TimelineState, ITimelineEditor>((props, ref) => {
  const checkedProps = checkProps(props);
  const { style } = props;
  let {
    scrollTop,
    autoScroll,
    hideCursor,
    disableDrag,
    scaleWidth,
    onChange,
    onScroll: onScrollVertical,
  } = checkedProps;

  const { animationEngine } = useVXEngine();
  const { scale, setCursorTime, scaleCount, width, setWidth, editAreaRef, scrollSyncRef } = useTimelineEditorStore(state => ({
    scale: state.scale,
    setCursorTime: state.setCursorTime,
    scaleCount: state.scaleCount,
    width: state.width,
    setWidth: state.setWidth,
    editAreaRef: state.editAreaRef,
    scrollSyncRef: state.scrollSyncRef
  }));
  const domRef = useRef<HTMLDivElement | null>();
  const autoScrollWhenPlay = useRef<boolean>(true);

  // deprecated
  useEffect(() => {
    scrollSyncRef.current && scrollSyncRef.current.setState({ scrollTop: scrollTop });
  }, [scrollTop]);

  /** Set scroll left */
  const handleDeltaScrollLeft = (delta: number) => {
    // Disable automatic scrolling when the maximum distance is exceeded
    const data = scrollSyncRef.current.state.scrollLeft + delta;
    if (data > scaleCount * (scaleWidth - 1) + startLeft - width) return;
    scrollSyncRef.current && scrollSyncRef.current.setState({ scrollLeft: Math.max(scrollSyncRef.current.state.scrollLeft + delta, 0) });
  };

  // Process runner related data
  useAnimationEngineEvent(
    'timeUpdatedAutomatically',
    ({ time }) => handleSetCursor({ time, animationEngine, scale, setCursorTime })
  );

  const setScrollLeft = (val) => {
    scrollSyncRef.current && scrollSyncRef.current.setState({ scrollLeft: Math.max(val, 0) });
  }

  useAnimationEngineEvent('timeUpdatedAutomatically', ({ time }) => {
    if (autoScrollWhenPlay.current) {
        const autoScrollFrom = 500;
        const left = time * (scaleWidth / scale) + startLeft - autoScrollFrom;
        setScrollLeft(left);
    }
})



  // ref data
  useImperativeHandle(ref, () => ({
    setScrollLeft: (val) => {
      scrollSyncRef.current && scrollSyncRef.current.setState({ scrollLeft: Math.max(val, 0) });
    },
    setScrollTop: (val) => {
      scrollSyncRef.current && scrollSyncRef.current.setState({ scrollTop: Math.max(val, 0) });
    },
  }));

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
    <div ref={domRef} className={"max-h-[600px] h-[420px] bg-neutral-950 rounded-2xl bg-opacity-80 w-full relative flex flex-col overflow-hidden " + " " + `${PREFIX} ${disableDrag ? PREFIX + '-disable' : ''}`}>
      <ScrollSync ref={scrollSyncRef}>
        {({ scrollLeft, scrollTop, onScroll }) => (
          <>
            <TimeArea
              {...checkedProps}
              onScroll={onScroll}
              scrollLeft={scrollLeft}
            />
            <EditArea
              {...checkedProps}
              scrollTop={scrollTop}
              scrollLeft={scrollLeft}
              deltaScrollLeft={autoScroll && handleDeltaScrollLeft}
              onScroll={(params) => {
                onScroll(params);
                onScrollVertical && onScrollVertical(params);
              }}
            />
            {!hideCursor && (
              <Cursor
                {...checkedProps}
                scrollLeft={scrollLeft}
                deltaScrollLeft={autoScroll && handleDeltaScrollLeft}
              />
            )}
          </>
        )}
      </ScrollSync>
    </div>
  );
});


export default TimelineEditor