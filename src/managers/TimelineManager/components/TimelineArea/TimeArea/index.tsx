import React, { useEffect, useRef } from 'react';
import './timeArea.scss';
import { useTimelineEditorAPI } from '@vxengine/managers/TimelineManager';
import { prefix } from '@vxengine/managers/TimelineManager/utils/deal_class_prefix';
import { parserPixelToTime } from '@vxengine/managers/TimelineManager/utils/deal_data';
import { handleSetCursor } from '@vxengine/managers/TimelineManager/utils/handleSetCursor';
import { CursorThumb } from '../cursor';
import { useAnimationEngineAPI } from '@vxengine/AnimationEngine';
import { ONE_SECOND_UNIT_WIDTH } from '@vxengine/managers/constants';
import { useRefStore } from '@vxengine/utils';

const maxScaleCount = 100;

export const TimeArea = () => {
  const scale = useTimelineEditorAPI((state) => state.scale);

  const currentTimelineID = useAnimationEngineAPI(
    (state) => state.currentTimelineID
  );
  const timelineLength = useAnimationEngineAPI(
    (state) => state.timelines[currentTimelineID]?.length
  );

  
  const startLeft = 20;
  const timelineClientWidth = startLeft + timelineLength * ONE_SECOND_UNIT_WIDTH / scale
  
  const OneSecondUnitSplitCount = Math.max(1, Math.floor(10 / scale));
  const totalUnits = OneSecondUnitSplitCount * timelineLength;

  const handleOnClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const position = e.clientX - rect.x;

    const scrollLeft = useRefStore.getState().scrollLeftRef.current
    const left = Math.max(position + scrollLeft, startLeft);
    if (left > maxScaleCount * ONE_SECOND_UNIT_WIDTH + startLeft - scrollLeft) return;

    const time = parserPixelToTime(left - scrollLeft, startLeft);
    handleSetCursor({ time });
  };

  const displayInterval = Math.ceil(scale); // Adjust display interval smoothly with scale

  return (
    <>
      <div
        className="sticky top-0 h-[32px] bg-neutral-950 z-10"
        style={{width: `${timelineClientWidth}px`}}
        onClick={handleOnClick}
      >
        <CursorThumb />
        {Array.from({ length: totalUnits + 1 }).map((_, index) => {
          const isIntegerUnit = index % OneSecondUnitSplitCount === 0;
          const classNames = ["time-unit"];

          // Adjust unit width based on the dynamic split count
          const unitWidth = (ONE_SECOND_UNIT_WIDTH / OneSecondUnitSplitCount) / scale;

          // Display only at multiples of the displayInterval
          const shouldDisplayNumber = isIntegerUnit && (index / OneSecondUnitSplitCount) % displayInterval === 0;

          if (isIntegerUnit) classNames.push("time-unit-big");
          return (
            <div
              key={index}
              style={{
                position: "absolute",
                left: `${startLeft + unitWidth * index}px`,
              }}
              className={prefix(...classNames)}
            >
              {shouldDisplayNumber && (
                <div className={prefix("time-unit-scale")}>
                  {index / OneSecondUnitSplitCount}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
};