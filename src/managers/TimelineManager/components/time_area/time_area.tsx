import React, { useEffect, useRef } from 'react';
import { prefix } from '../../utils/deal_class_prefix';
import './time_area.scss';
import { parserPixelToTime } from '../../utils/deal_data';
import { useTimelineEditorAPI } from '../../store';
import { handleSetCursor } from '../../utils/handleSetCursor';
import { shallow } from 'zustand/shallow';
import { CursorThumb } from '../cursor/cursor';

const maxScaleCount = 100;

/** Animation timeline component */
export const TimeArea = ({deltaScrollLeft}) => {
  const {
    scaleCount,
    scaleSplitCount,
    scaleWidth,
    scale,
  } = useTimelineEditorAPI(
    (state) => ({
      scaleCount: state.scaleCount,
      scaleSplitCount: state.scaleSplitCount,
      scaleWidth: state.scaleWidth,
      scale: state.scale,
    }),
    shallow
  );

  /** Whether to display subdivision scales */
  const showUnit = scaleSplitCount > 0;
  const startLeft = 20;

  // Calculate the total width of the timeline
  const timelineClientWidth = scaleCount * scaleWidth + startLeft;

  const renderTimeUnits = () => {
    const units = [];
    const totalUnits = showUnit ? scaleCount * scaleSplitCount + 1 : scaleCount;
    let left = 4;

    for (let columnIndex = 0; columnIndex < totalUnits; columnIndex++) {
      const isShowScale = showUnit ? columnIndex % scaleSplitCount === 0 : true;
      const classNames = ['time-unit'];
      if (isShowScale) 
        classNames.push('time-unit-big');
      const item =
        (showUnit ? columnIndex / scaleSplitCount : columnIndex) * scale;

      const unitWidth = showUnit
        ? scaleWidth / scaleSplitCount
        : scaleWidth;

      units.push(
        <div
          key={columnIndex}
          style={{
            position: 'absolute',
            left: `${left}px`,
            width: `${unitWidth}px`,
          }}
          className={prefix(...classNames)}
        >
          {isShowScale && (
            <div className={prefix('time-unit-scale')}>{item}</div>
          )}
        </div>
      );

      left += unitWidth;
    }
    return units;
  };


  return (
    <>
      <div
        style={{
          width: `${timelineClientWidth}px`,
        }}
        className='sticky top-0  h-[32px] bg-neutral-950 z-10'
        onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const position = e.clientX - rect.x;

          const scrollLeft = useTimelineEditorAPI.getState().scrollLeft
          const left = Math.max(position + scrollLeft, startLeft);
          if (left > maxScaleCount * scaleWidth + startLeft - scrollLeft)
            return;

          const time = parserPixelToTime(left, startLeft);
          handleSetCursor({ time });
        }}
      >
        <CursorThumb
          deltaScrollLeft={deltaScrollLeft}
        />
        {renderTimeUnits()}
      </div>  
    </>
  );
};