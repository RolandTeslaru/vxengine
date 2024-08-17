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

export const Timeline = React.forwardRef<TimelineState, TimelineEditor>((props, ref) => {
  const checkedProps = checkProps(props);
  const { style } = props;
  let {
    effects,
    scrollTop,
    autoScroll,
    hideCursor,
    disableDrag,
    scale,
    scaleWidth,
    startLeft,
    minScaleCount,
    maxScaleCount,
    onChange,
    autoReRender = true,
    onScroll: onScrollVertical,
  } = checkedProps;

  const { VX_AnimationEngine } = useVXEngine();
  const domRef = useRef<HTMLDivElement>();
  const areaRef = useRef<HTMLDivElement>();
  const scrollSync = useRef<ScrollSync>();

  // Editor data
  const [editorData, setEditorData] = useState<TimelineRow[]>(() => {
    return VX_AnimationEngine.currentTimeline?.rows || [];
  });
  const [scaleCount, setScaleCount] = useState(MIN_SCALE_COUNT);
  const [cursorTime, setCursorTime] = useState(START_CURSOR_TIME);
  const [width, setWidth] = useState(Number.MAX_SAFE_INTEGER);
  const [isPlaying, setIsPlaying] = useState(false);

  /** Monitor data changes */
  
  useEffect(() => {
    VX_AnimationEngine.effects = effects;
  }, [effects]);

  useEffect(() => {
    VX_AnimationEngine.data = editorData;
  }, [editorData]);

  useEffect(() => {
    autoReRender && VX_AnimationEngine.reRender();
  }, [editorData]);

  // deprecated
  useEffect(() => {
    scrollSync.current && scrollSync.current.setState({ scrollTop: scrollTop });
  }, [scrollTop]);

  /** Dynamically set scale count */
  const handleSetScaleCount = (value: number) => {
    const data = Math.min(maxScaleCount, Math.max(minScaleCount, value));
    setScaleCount(data);
  };

  /** Handle proactive data changes */
  const handleEditorDataChange = (editorData: TimelineRow[]) => {
    const result = onChange(editorData);
    if (result !== false) {
      VX_AnimationEngine.data = editorData;
      autoReRender && VX_AnimationEngine.reRender();
    }
  };

  /** Handle cursor */
  const handleSetCursor = (param: { left?: number; time?: number; updateTime?: boolean }) => {
    let { left, time, updateTime = true } = param;
    if (typeof left === 'undefined' && typeof time === 'undefined') return;

    if (typeof time === 'undefined') {
      if (typeof left === 'undefined') left = parserTimeToPixel(time, { startLeft, scale, scaleWidth });
      time = parserPixelToTime(left, { startLeft, scale, scaleWidth });
    }

    let result = true;
    if (updateTime) {
      result = VX_AnimationEngine.setTime(time);
      autoReRender && VX_AnimationEngine.reRender();
    }
    result && setCursorTime(time);
    return result;
  };

  /** Set scroll left */
  const handleDeltaScrollLeft = (delta: number) => {
    // Disable automatic scrolling when the maximum distance is exceeded
    const data = scrollSync.current.state.scrollLeft + delta;
    if (data > scaleCount * (scaleWidth - 1) + startLeft - width) return;
    scrollSync.current && scrollSync.current.setState({ scrollLeft: Math.max(scrollSync.current.state.scrollLeft + delta, 0) });
  };

  // Process runner related data
  useEffect(() => {
    const handleTime = ({ time }) => {
      handleSetCursor({ time, updateTime: false });
    };
    const handlePlay = () => setIsPlaying(true);
    const handlePaused = () => setIsPlaying(false);
    VX_AnimationEngine.on('setTimeByTick', handleTime);
    VX_AnimationEngine.on('play', handlePlay);
    VX_AnimationEngine.on('paused', handlePaused);
  }, []);

  // ref data
  useImperativeHandle(ref, () => ({
    get target() {
      return domRef.current;
    },
    get listener() {
      return VX_AnimationEngine;
    },
    get isPlaying() {
      return VX_AnimationEngine.isPlaying;
    },
    get isPaused() {
      return VX_AnimationEngine.isPaused;
    },
    setPlayRate: VX_AnimationEngine.setPlayRate.bind(VX_AnimationEngine),
    getPlayRate: VX_AnimationEngine.getPlayRate.bind(VX_AnimationEngine),
    setTime: (time: number) => handleSetCursor({ time }),
    getTime: VX_AnimationEngine.getTime.bind(VX_AnimationEngine),
    reRender: VX_AnimationEngine.reRender.bind(VX_AnimationEngine),
    play: (param: Parameters<TimelineState['play']>[0]) => VX_AnimationEngine.play({ ...param }),
    pause: VX_AnimationEngine.pause.bind(VX_AnimationEngine),
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
              disableDrag={disableDrag || isPlaying}
              setCursor={handleSetCursor}
              cursorTime={cursorTime}
              editorData={editorData}
              scaleCount={scaleCount}
              setScaleCount={handleSetScaleCount}
              onScroll={onScroll}
              scrollLeft={scrollLeft}
            />
            <EditArea
              {...checkedProps}
              timelineWidth={width}
              ref={(ref) => ((areaRef.current as any) = ref?.domRef.current)}
              disableDrag={disableDrag || isPlaying}
              editorData={editorData}
              cursorTime={cursorTime}
              scaleCount={scaleCount}
              setScaleCount={handleSetScaleCount}
              scrollTop={scrollTop}
              scrollLeft={scrollLeft}
              setEditorData={handleEditorDataChange}
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
                disableDrag={isPlaying}
                scrollLeft={scrollLeft}
                scaleCount={scaleCount}
                setScaleCount={handleSetScaleCount}
                setCursor={handleSetCursor}
                cursorTime={cursorTime}
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
