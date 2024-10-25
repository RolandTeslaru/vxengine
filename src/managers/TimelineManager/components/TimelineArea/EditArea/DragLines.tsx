
import { prefix } from "@vxengine/managers/TimelineManager/utils/deal_class_prefix";
import React, { FC, useEffect, useState } from "react";

export interface DragLineData {
  isMoving: boolean;
  movePositions: number[];
  assistPositions: number[];
}

export type DragLineProps = DragLineData & {scrollLeft: number};

export const DragLines: FC<DragLineProps> = ({
  isMoving,
  movePositions = [],
  assistPositions = [],
  scrollLeft,
}) => {
  return(
    <div className={prefix('drag-line-container')}>
      {
        isMoving && movePositions.filter(item => assistPositions.includes(item)).map(((linePos, index) => {
          return (
            <div key={index} className={prefix('drag-line')} style={{left: linePos - scrollLeft}} />
          )
        }))
      }
    </div>
  )
}
