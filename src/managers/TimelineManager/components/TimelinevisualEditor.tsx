import React, { useEffect, useImperativeHandle, useLayoutEffect, useRef, useState } from 'react';
import { ScrollSync } from 'react-virtualized';
import { IAnimationEngine, AnimationEngine } from 'vxengine/AnimationEngine/engine';
import { checkProps } from '../utils/check_props';
import { getScaleCountByRows, parserPixelToTime, parserTimeToPixel } from '../utils/deal_data';
import { Cursor } from './cursor/cursor';
import { EditArea } from './edit_area/edit_area';
import './timeline.scss';
import { TimeArea } from './time_area/time_area';
import { TimelineEditor, TimelineRow, TimelineState } from 'vxengine/AnimationEngine/interface/timeline';
import { MIN_SCALE_COUNT, PREFIX, START_CURSOR_TIME } from 'vxengine/AnimationEngine/interface/const';
import { useVXEngine } from 'vxengine/engine';
import { ITrack } from 'vxengine/AnimationEngine/types/track';
import { useVXTimelineStore } from 'vxengine/store/TimelineStore';
import useAnimationEngineEvent from 'vxengine/AnimationEngine/utils/useAnimationEngineEvent';
import { useTimelineEditorStore } from '../store';
import { handleSetCursor } from '../utils/handleSetCursor';

export const TimelineVisualEditor = React.forwardRef<TimelineState, TimelineEditor>((props, ref) => {
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
  const { isPlaying } = useVXTimelineStore();
  const { editorData, scale, setCursorTime, scaleCount, width, setWidth } = useTimelineEditorStore();
  const domRef = useRef<HTMLDivElement>();
  const areaRef = useRef<HTMLDivElement>();
  const scrollSync = useRef<ScrollSync>();

  // deprecated
  useEffect(() => {
    scrollSync.current && scrollSync.current.setState({ scrollTop: scrollTop });
  }, [scrollTop]);

  /** Set scroll left */
  const handleDeltaScrollLeft = (delta: number) => {
    // Disable automatic scrolling when the maximum distance is exceeded
    const data = scrollSync.current.state.scrollLeft + delta;
    if (data > scaleCount * (scaleWidth - 1) + startLeft - width) return;
    scrollSync.current && scrollSync.current.setState({ scrollLeft: Math.max(scrollSync.current.state.scrollLeft + delta, 0) });
  };

  // Process runner related data
  useAnimationEngineEvent(
    'timeUpdatedAutomatically',
    ({ time }) => handleSetCursor({ time, animationEngine, scale, setCursorTime })
  );

  // ref data
  useImperativeHandle(ref, () => ({
    get target() {
      return domRef.current;
    },
    setScrollLeft: (val) => {
      scrollSync.current && scrollSync.current.setState({ scrollLeft: Math.max(val, 0) });
    },
    setScrollTop: (val) => {
      scrollSync.current && scrollSync.current.setState({ scrollTop: Math.max(val, 0) });
    },
  }));

  // Monitor timeline area width changes
  useEffect(() => {
    if (areaRef.current) {
      const resizeObserver = new ResizeObserver(() => {
        if (!areaRef.current) return;
        setWidth(areaRef.current.getBoundingClientRect().width);
      });
      resizeObserver.observe(areaRef.current!);
      return () => {
        resizeObserver && resizeObserver.disconnect();
      };
    }
  }, []);

  return (
    <div ref={domRef} className={"max-h-[600px] h-[420px] bg-neutral-950 rounded-2xl bg-opacity-80 w-full relative flex flex-col overflow-hidden " + " " + `${PREFIX} ${disableDrag ? PREFIX + '-disable' : ''}`}>
      <ScrollSync ref={scrollSync}>
        {({ scrollLeft, scrollTop, onScroll }) => (
          <>
            <TimeArea
              {...checkedProps}
              timelineWidth={width}
              onScroll={onScroll}
              scrollLeft={scrollLeft}
            />
            <EditArea
              {...checkedProps}
              timelineWidth={width}
              ref={(ref) => ((areaRef.current as any) = ref?.domRef.current)}
              scaleCount={scaleCount}
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
                timelineWidth={width}
                scrollLeft={scrollLeft}
                scaleCount={scaleCount}
                editorData={editorData}
                areaRef={areaRef}
                scrollSync={scrollSync}
                deltaScrollLeft={autoScroll && handleDeltaScrollLeft}
              />
            )}
          </>
        )}
      </ScrollSync>
    </div>
  );
});
