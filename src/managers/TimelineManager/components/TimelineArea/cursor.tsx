import React, { useEffect, useMemo } from 'react';
import { prefix } from '../../utils/deal_class_prefix';
import { parserTimeToPixel } from '../../utils/deal_data';
import { useRefStore } from '@vxengine/utils/useRefStore';
import { cursorStartLeft, handleCursorOnDrag, handleCursorOnDragEng, handleCursorOnDragStart } from '../../utils/cursorHandlers';
import { RowDnd } from './EditArea/RowDnd';
import { useTimelineEditorAPI } from '../..';
import { DEFAULT_ROW_HEIGHT } from '@vxengine/AnimationEngine/interface/const';
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuSub, ContextMenuSubContent, ContextMenuSubTrigger, ContextMenuTrigger } from '@vxengine/components/shadcn/contextMenu';
import ArrowRight from '@geist-ui/icons/arrowRight';
import Maximize2 from '@geist-ui/icons/maximize2';
import ArrowLeft from '@geist-ui/icons/arrowLeft';
import { forEach } from 'lodash';

export const CursorLine = ({ rows }: { rows: number }) => {
  const cursorLineRef = useRefStore(state => state.cursorLineRef)
  const left = useMemo(() => parserTimeToPixel(0, cursorStartLeft), [])

  const scale = useTimelineEditorAPI(state => state.scale);

  useEffect(() => {
    const cursorTime = useTimelineEditorAPI.getState().cursorTime;
    const newLeft = parserTimeToPixel(cursorTime, cursorStartLeft);

    cursorLineRef.current.updateLeft(newLeft);
  }, [scale])

  return (
    <ContextMenu>
      <ContextMenuTrigger>
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
          <div className={" absolute cursor-ew-resize box-border top-0 border-x border-blue-500 z-[1]"}
            style={{
              transform: "translateX(-25%) scaleX(0.5)",
              height: `${rows * DEFAULT_ROW_HEIGHT}px`
            }}
          >
            <div className={prefix('cursor-area')} />
          </div>
        </RowDnd>
      </ContextMenuTrigger>
      <CursorContextMenu />
    </ContextMenu>
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
    <ContextMenu>
      <ContextMenuTrigger>
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
            style={{ transform: "translateX(-25%) scaleX(0.5)" }}
          >
            <svg
              className="absolute top-0 left-1/2 margin-auto"
              style={{ transform: "translate(-50%, 0) scaleX(2)" }}
              width="8" height="12" viewBox="0 0 8 12" fill="none"
            >
              <path
                d="M0 1C0 0.447715 0.447715 0 1 0H7C7.55228 0 8 0.447715 8 1V9.38197C8 9.76074 7.786 10.107 7.44721 10.2764L4.44721 11.7764C4.16569 11.9172 3.83431 11.9172 3.55279 11.7764L0.552786 10.2764C0.214002 10.107 0 9.76074 0 9.38197V1Z"
                fill="#5297FF"
              />
            </svg>
          </div>
        </RowDnd>
      </ContextMenuTrigger>
      <CursorContextMenu/>
    </ContextMenu>
  );
};

const CursorContextMenu = () => {
  return (
    <ContextMenuContent>
      <ContextMenuSub>
        <ContextMenuSubTrigger>
          <p className='text-xs font-sans-menlo'>Select...</p>
        </ContextMenuSubTrigger>
        <ContextMenuSubContent>
          <ContextMenuItem onClick={selectAllKeyframesAfterCursor}>
            <ArrowRight size={15} />
            <p className='text-xs font-sans-menlo'>All Keyframes After</p>
          </ContextMenuItem>
          <ContextMenuItem onClick={selectAllKeyframes}>
            <Maximize2 size={15} className='rotate-45' />
            <p className='text-xs font-sans-menlo'>All Keyframes</p>
          </ContextMenuItem>
          <ContextMenuItem onClick={selectAllKeyframesBeforeCursor}>
            <ArrowLeft size={15} />
            <p className='text-xs font-sans-menlo'>All Keyframes Before</p>
          </ContextMenuItem>
        </ContextMenuSubContent>
      </ContextMenuSub>
    </ContextMenuContent>
  )
}

const selectAllKeyframesAfterCursor = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
  const state = useTimelineEditorAPI.getState();
  const selectKeyframe = state.selectKeyframe;
  const cursorTime = state.cursorTime;

  Object.entries(state.tracks).forEach(([trackKey, track]) => {
    Object.entries(track.keyframes).forEach(([keyframeKey, keyframe]) => {
      if(keyframe.time >= cursorTime){
        selectKeyframe(trackKey, keyframeKey)
      }
    })
  })

  event.preventDefault();
}
const selectAllKeyframesBeforeCursor = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
  const state = useTimelineEditorAPI.getState();
  const selectKeyframe = state.selectKeyframe;
  const cursorTime = state.cursorTime;

  Object.entries(state.tracks).forEach(([trackKey, track]) => {
    Object.entries(track.keyframes).forEach(([keyframeKey, keyframe]) => {
      if(keyframe.time <= cursorTime){
        selectKeyframe(trackKey, keyframeKey)
      }
    })
  })

  event.preventDefault()
}

const selectAllKeyframes = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
  const state = useTimelineEditorAPI.getState();
  const selectKeyframe = state.selectKeyframe;

  Object.entries(state.tracks).forEach(([trackKey, track]) => {
    Object.entries(track.keyframes).forEach(([keyframeKey, keyframe]) => {
        selectKeyframe(trackKey, keyframeKey)
    })
  })

  event.preventDefault();
}

