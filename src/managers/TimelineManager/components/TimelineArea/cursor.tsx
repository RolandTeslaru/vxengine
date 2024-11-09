import React, { useEffect, useMemo } from 'react';
import { prefix } from '../../utils/deal_class_prefix';
import { parserTimeToPixel } from '../../utils/deal_data';
import { useRefStore } from '@vxengine/utils/useRefStore';
import { cursorStartLeft, handleCursorOnDrag, handleCursorOnDragEng, handleCursorOnDragStart } from '../../utils/cursorHandlers';
import { RowDnd } from './EditArea/RowDnd';
import { useTimelineEditorAPI } from '../..';

export const CursorLine = () => {
  const cursorLineRef = useRefStore(state => state.cursorLineRef)
  const left = useMemo(() => parserTimeToPixel(0, cursorStartLeft), [])

  const scale = useTimelineEditorAPI(state => state.scale);

  useEffect(() => {
    const cursorTime = useTimelineEditorAPI.getState().cursorTime;
    const newLeft = parserTimeToPixel(cursorTime, cursorStartLeft);

    cursorLineRef.current.updateLeft(newLeft);
  }, [scale])

  return (
      <RowDnd
        left={left}
        start={cursorStartLeft}
        ref={cursorLineRef}
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


export const CursorThumb = () => {
  const cursorThumbRef = useRefStore(state => state.cursorThumbRef)
  const left = useMemo(() => parserTimeToPixel(0, cursorStartLeft), [])

  const scale = useTimelineEditorAPI(state => state.scale);

  useEffect(() => {
    const cursorTime = useTimelineEditorAPI.getState().cursorTime;
    const newLeft = parserTimeToPixel(cursorTime, cursorStartLeft);

    cursorThumbRef.current.updateLeft(newLeft);
  }, [scale])

  return (
      <RowDnd
        left={left}
        start={cursorStartLeft}
        ref={cursorThumbRef}
        enableDragging={true}
        enableResizing={false}
        onDragStart={handleCursorOnDragStart}
        onDragEnd={handleCursorOnDragEng}
        onDrag={handleCursorOnDrag}
      >
        <div className={" absolute cursor-ew-resize box-border bottom-0 h-[12px]  z-[1]"}
          style={{ transform: "translateX(-25%) scaleX(0.5)"}}
        >
          <svg 
            className="absolute top-0 left-1/2 margin-auto" 
            style={{ transform: "translate(-50%, 0) scaleX(2)"}}
            width="8" height="12" viewBox="0 0 8 12" fill="none"
          >
            <path
              d="M0 1C0 0.447715 0.447715 0 1 0H7C7.55228 0 8 0.447715 8 1V9.38197C8 9.76074 7.786 10.107 7.44721 10.2764L4.44721 11.7764C4.16569 11.9172 3.83431 11.9172 3.55279 11.7764L0.552786 10.2764C0.214002 10.107 0 9.76074 0 9.38197V1Z"
              fill="#5297FF"
            />
          </svg>
        </div>
      </RowDnd>
  );
};