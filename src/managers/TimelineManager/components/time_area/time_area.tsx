import React, { FC, useEffect, useRef } from 'react';
import { Grid, GridCellRenderer, OnScrollParams } from 'react-virtualized';
import { prefix } from '../../utils/deal_class_prefix';
import './time_area.scss';
import { parserPixelToTime } from '../../utils/deal_data';
import { CommonProp } from 'vxengine/AnimationEngine/interface/common_prop';
import { useTimelineEditorStore } from '../../store';
import { useVXEngine } from 'vxengine/engine';
import { handleSetCursor } from '../../utils/handleSetCursor';
import { shallow } from 'zustand/shallow';
import AutoSizer from '../AutoSizer';

const maxScaleCount = 100;

/** Animation timeline component */
export const TimeArea = () => {
  const { scaleCount, setCursorTime, scaleSplitCount, scaleWidth, scale, startLeft, scrollLeft } = useTimelineEditorStore(state => ({
    scaleCount: state.scaleCount,
    setCursorTime: state.setCursorTime,
    scaleSplitCount: state.scaleSplitCount, 
    scaleWidth: state.scaleWidth,
    scale: state.scale,
    startLeft: state.startLeft,
    scrollLeft: state.scrollLeft,
  }), shallow);
  const { animationEngine } = useVXEngine();
  const gridRef = useRef<Grid>();
  /** Whether to display subdivision scales */
  const showUnit = scaleSplitCount > 0;

  /** Get the rendering content of each cell */
  const cellRenderer: GridCellRenderer = ({ columnIndex, key, style }) => {
    const isShowScale = showUnit ? columnIndex % scaleSplitCount === 0 : true;
    const classNames = ['time-unit'];
    if (isShowScale) classNames.push('time-unit-big');
    const item = (showUnit ? columnIndex / scaleSplitCount : columnIndex) * scale;
    return (
      <div key={key} style={style} className={prefix(...classNames)}>
        {isShowScale &&
          <div className={prefix('time-unit-scale')}>
            {item}
          </div>
        }
      </div>
    );
  };

  useEffect(() => {
    gridRef.current?.recomputeGridSize();
  }, [scaleWidth, startLeft]);

  /** Get column width*/
  const getColumnWidth = (data: { index: number }) => {
    switch (data.index) {
      case 0:
        return startLeft;
      default:
        return showUnit ? scaleWidth / scaleSplitCount : scaleWidth;
    }
  };
  const estColumnWidth = getColumnWidth({ index: 1 });
  return (
    <div className={prefix('time-area')}>
      <AutoSizer>
        {({ width, height }) => {
          return (
            <>
              <Grid
                ref={gridRef}
                columnCount={showUnit ? scaleCount * scaleSplitCount + 1 : scaleCount}
                columnWidth={getColumnWidth}
                estimatedColumnSize={estColumnWidth}
                rowCount={1}
                rowHeight={height}
                width={width}
                height={height}
                overscanRowCount={0}
                overscanColumnCount={10}
                cellRenderer={cellRenderer}
                scrollLeft={scrollLeft}
              ></Grid>
              <div
                style={{ width, height }}
                onClick={(e) => {
                  const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                  const position = e.clientX - rect.x;
                  const left = Math.max(position + scrollLeft, startLeft);
                  if (left > maxScaleCount * scaleWidth + startLeft - scrollLeft) return;

                  const time = parserPixelToTime(left, { startLeft, scale, scaleWidth });
                  // const result = onClickTimeArea && onClickTimeArea(time, e);
                  // if (result === false) return; //返回false时阻止设置时间
                  handleSetCursor({ time, animationEngine })
                }}
                className={prefix('time-area-interact')}
              ></div>
            </>
          );
        }}
      </AutoSizer>
    </div>
  );
};