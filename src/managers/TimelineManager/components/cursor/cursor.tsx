import React, { FC, useEffect, useRef, useState } from 'react';
import { prefix } from '../../utils/deal_class_prefix';
import { parserPixelToTime, parserTimeToPixel } from '../../utils/deal_data';
import { RowDnd } from '../row_rnd/row_rnd';
import './cursor.scss';
import { useRefStore } from '@vxengine/utils/useRefStore';
import { cursorStartLeft, handleCursorOnDrag, handleCursorOnDragEng, handleCursorOnDragStart } from './handlers';


/** Animation timeline component parameters */
export type CursorProps = {
  deltaScrollLeft: (delta: number) => void;
};

export const CursorLine: FC<CursorProps> = ({
  deltaScrollLeft,
}) => {
  const cursorLineRef = useRefStore(state => state.cursorLineRef)
  const left = parserTimeToPixel(0, cursorStartLeft)

  return (
      <RowDnd
        left={left}
        start={cursorStartLeft}
        ref={cursorLineRef}
        deltaScrollLeft={deltaScrollLeft}
        enableDragging={true}
        enableResizing={false}
        onDragStart={handleCursorOnDragStart}
        onDragEnd={handleCursorOnDragEng}
        onDrag={handleCursorOnDrag}
      >
        <div className={" absolute cursor-ew-resize box-border top-0 h-full border-x border-blue-500 z-[1]"}
          style={{ transform: "translateX(-25%) scaleX(0.5)"}}
        >
          <div className={prefix('cursor-area')} />
        </div>
      </RowDnd>
  );
};


export const CursorThumb: FC<CursorProps> = ({
  deltaScrollLeft,
}) => {
  const cursorThumbRef = useRefStore(state => state.cursorThumbRef)
  const left = parserTimeToPixel(0, cursorStartLeft)

  return (
      <RowDnd
        left={left}
        start={cursorStartLeft}
        ref={cursorThumbRef}
        deltaScrollLeft={deltaScrollLeft}
        enableDragging={true}
        enableResizing={false}
        onDragStart={handleCursorOnDragStart}
        onDragEnd={handleCursorOnDragEng}
        onDrag={handleCursorOnDrag}
      >
        <div className={" absolute cursor-ew-resize box-border bottom-0 h-[12px]  z-[1]"}
          style={{ transform: "translateX(-25%) scaleX(0.5)"}}
        >
          <svg className={prefix('cursor-top')} width="8" height="12" viewBox="0 0 8 12" fill="none">
            <path
              d="M0 1C0 0.447715 0.447715 0 1 0H7C7.55228 0 8 0.447715 8 1V9.38197C8 9.76074 7.786 10.107 7.44721 10.2764L4.44721 11.7764C4.16569 11.9172 3.83431 11.9172 3.55279 11.7764L0.552786 10.2764C0.214002 10.107 0 9.76074 0 9.38197V1Z"
              fill="#5297FF"
            />
          </svg>
        </div>
      </RowDnd>
  );
};



