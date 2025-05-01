import React, { useCallback } from 'react';
import './timeArea.scss';
import { useTimelineManagerAPI } from '@vxengine/managers/TimelineManager';
import { prefix } from '@vxengine/managers/TimelineManager/utils/deal_class_prefix';
import { ONE_SECOND_UNIT_WIDTH } from '@vxengine/managers/constants';
import { useRefStore } from '@vxengine/utils';
import { useTimelineEditorAPI } from '@vxengine/managers/TimelineManager/TimelineEditor/store';
import { useWindowContext } from '@vxengine/core/components/VXEngineWindow';
import { cursorBoundsLeft } from '../EditorCursor/utils';
import { useTimelineEditorContext } from '../../../context';
const maxScaleCount = 100;

const timeAreaStartLeft = 20;

export const TimeArea = () => {
  const [scale, setTimeByPixel] = useTimelineEditorAPI(state => [state.scale, state.setTimeByPixel])

  const currentTimelineLength = useTimelineManagerAPI((state) => state.currentTimelineLength);
  const { externalContainer } = useWindowContext();
  const { scrollLeftRef } = useTimelineEditorContext()
  
  const timelineClientWidth = timeAreaStartLeft + currentTimelineLength * ONE_SECOND_UNIT_WIDTH / scale

  const OneSecondUnitSplitCount = Math.max(1, Math.floor(10 / scale));
  const totalUnits = OneSecondUnitSplitCount * currentTimelineLength;

  const handleOnClick = useCallback((e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const position = e.clientX - rect.x;

    const scrollLeft = scrollLeftRef.current
    const left = Math.max(position, timeAreaStartLeft);
    if (left > maxScaleCount * ONE_SECOND_UNIT_WIDTH + timeAreaStartLeft - scrollLeft) return;

    setTimeByPixel(left)
  }, [setTimeByPixel, scrollLeftRef])

  const displayInterval = Math.ceil(scale); // Adjust display interval smoothly with scale

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const div = e.currentTarget;
    const divRect = div.getBoundingClientRect(); // Get div position

    const targetDocument = externalContainer?.ownerDocument || document;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      let relativeX = moveEvent.clientX - divRect.left;

      if(relativeX < cursorBoundsLeft)
        relativeX = cursorBoundsLeft
      setTimeByPixel(relativeX);
    };

    const handleMouseUp = () => {
      targetDocument.removeEventListener("mousemove", handleMouseMove);
      targetDocument.removeEventListener("mouseup", handleMouseUp);
    };

    targetDocument.addEventListener("mousemove", handleMouseMove);
    targetDocument.addEventListener("mouseup", handleMouseUp);
  }, [setTimeByPixel, externalContainer])

  return (
    <div
      className="sticky top-0 h-[28px] bg-neutral-950/90 z-20 border-b border-neutral-800"
      style={{ width: `${timelineClientWidth}px` }}
      onClick={handleOnClick}
      onMouseDown={handleMouseDown}
    >
      {Array.from({ length: totalUnits + 1 }).map((_, index) => {
        const isIntegerUnit = index % OneSecondUnitSplitCount === 0;
        const classNames = ["time-unit"];

        // Adjust unit width based on the dynamic split count
        const unitWidth = (ONE_SECOND_UNIT_WIDTH / OneSecondUnitSplitCount) / scale;

        // Display only at multiples of the displayInterval
        const shouldDisplayNumber = isIntegerUnit && (index / OneSecondUnitSplitCount) % displayInterval === 0;

        if (isIntegerUnit)
          classNames.push("time-unit-big");

        return (
          <div
            key={index}
            style={{
              position: "absolute",
              left: `${timeAreaStartLeft + unitWidth * index}px`,
            }}
            className={prefix(...classNames)}
          >
            {shouldDisplayNumber && (
              <div className={prefix("time-unit-scale") + " font-medium select-none"} style={{ fontSize: "10px" }}>
                <p className='text-white' style={{ fontSize: "10px" }}>
                  {index / OneSecondUnitSplitCount}
                </p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};