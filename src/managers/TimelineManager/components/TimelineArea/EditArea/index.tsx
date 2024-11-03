// VXEngine - VEXR Labs' proprietary toolset for React Three Fiber
// (c) 2024 VEXR Labs. All Rights Reserved.
// See the LICENSE file in the root directory of this source tree for licensing information.

import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { ITrack, edObjectProps, PathGroup, IKeyframe } from '@vxengine/AnimationEngine/types/track';
import { DEFAULT_ROW_HEIGHT, DEFAULT_SCALE_WIDTH } from '@vxengine/AnimationEngine/interface/const';
import { useAnimationEngineAPI } from '@vxengine/AnimationEngine/store';
import Track from './Track';
import { useTimelineEditorAPI } from '@vxengine/managers/TimelineManager';
import { useDragLine } from '@vxengine/managers/TimelineManager/hooks/use_drag_line';
import { CursorLine } from '../cursor';
import { Virtuoso, Components } from 'react-virtuoso';
import { useVXUiStore } from '@vxengine/components/ui/VXUIStore';
import { useRefStore } from '@vxengine/utils';

export const EditArea = () => {
  const currentTimelineID = useAnimationEngineAPI(state => state.currentTimelineID)
  const timelineLength = useAnimationEngineAPI(state => state.timelines[currentTimelineID]?.length)

  const editorObjects = useTimelineEditorAPI(state => state.editorObjects);
  const groupedPaths = useTimelineEditorAPI(state => state.groupedPaths)

  const scale = useTimelineEditorAPI(state => state.scale)

  const editAreaRef = useRefStore(state => state.editAreaRef);
  const trackListRef = useRefStore(state => state.trackListRef)

  const { dragLineData } = useDragLine();


  const startLeft = 22

  const verticalRowList = useMemo(() => {
    const allRows = [];

    const fillRows = ({ key, group }: { key: string, group: PathGroup }) => {
      const { rowIndex, trackKey } = group;

      if (rowIndex !== undefined)
        allRows[rowIndex] = trackKey

      Object.entries(group.children).forEach(([key, group]) => fillRows({ key, group }));
    };

    Object.entries(groupedPaths).forEach(([key, group]) => fillRows({ key, group }));
    return allRows;
  }, [editorObjects]);

  const renderRow = (index: number) => {
    const track = verticalRowList[index];
    if (track) {
      return (
        <Track
          trackKey={track}
        />
      );
    }
    else {
      return (
        <div
          style={{
            height: `${DEFAULT_ROW_HEIGHT}px`,
            backgroundPositionX: `0, ${startLeft}px`,
            backgroundSize: `${startLeft}px, ${DEFAULT_SCALE_WIDTH}px`,
          }}
          className="relative py-4 border-y border-neutral-900 bg-black bg-opacity-60"
        >
          {/* Empty row */}
        </div>
      );
    }
  }

  const timelineClientWidth = timelineLength * DEFAULT_SCALE_WIDTH / scale + startLeft

  const rows = verticalRowList.length;

  const scrollSyncId = useRefStore(state => state.scrollSyncId);

  const handleOnScroll = (e: React.UIEvent<HTMLDivElement, UIEvent>) => {
    const scrollContainer = e.target;

    if (!trackListRef.current) return;

    if (scrollSyncId.current) cancelAnimationFrame(scrollSyncId.current);

    scrollSyncId.current = requestAnimationFrame(() => {
      // @ts-expect-error
      trackListRef.current.scrollTop = scrollContainer.scrollTop;
    })
  }

  const scrollerRefCallback = useCallback((node) => {
    if (node) {
      editAreaRef.current = node;

      node.addEvent
    }
  }, [])

  const Scroller: Components['Scroller'] = React.forwardRef((props, ref) => {
    const { children, ...rest } = props
    return (
      <div ref={ref} {...rest}>
        <CursorLine />
        {children}
      </div>
    )
  })
  return (
    <div className='w-full h-full'>
      <Virtuoso
        style={{
          position: 'relative',
          height: `100%`,
          width: `${timelineClientWidth}px` // Ensure this is greater than the container's width
        }}
        totalCount={rows}
        itemContent={index => renderRow(index)}
        scrollerRef={scrollerRefCallback}
        onScroll={handleOnScroll}
        components={{ Scroller }}

      />
    </div>
  );
};