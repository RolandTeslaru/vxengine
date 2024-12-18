// VXEngine - VEXR Labs' proprietary toolset for React Three Fiber
// (c) 2024 VEXR Labs. All Rights Reserved.
// See the LICENSE file in the root directory of this source tree for licensing information.

import React, { memo, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { ITrack, edObjectProps, PathGroup, IKeyframe } from '@vxengine/AnimationEngine/types/track';
import { DEFAULT_ROW_HEIGHT, DEFAULT_SCALE_WIDTH } from '@vxengine/AnimationEngine/interface/const';
import { useAnimationEngineAPI } from '@vxengine/AnimationEngine/store';
import Track from './Track';
import { useTimelineEditorAPI } from '@vxengine/managers/TimelineManager';
import { useDragLine } from '@vxengine/managers/TimelineManager/hooks/use_drag_line';
import { CursorLine } from '../cursor';
import { Virtuoso, Components } from 'react-virtuoso';
import { useUIManagerAPI } from '@vxengine/managers/UIManager/store';
import { useRefStore } from '@vxengine/utils';
import { GroupedPaths } from '@vxengine/managers/TimelineManager/store';

export const EditArea = () => {
  const currentTimelineLength = useTimelineEditorAPI(state => state.currentTimelineLength);
  const editorObjects = useTimelineEditorAPI(state => state.editorObjects);
  const groupedPaths = useTimelineEditorAPI(state => state.groupedPaths)
  const scale = useTimelineEditorAPI(state => state.scale)
  const snap = useTimelineEditorAPI(state => state.snap);
  const searchQuery = useTimelineEditorAPI(state => state.searchQuery);

  const editAreaRef = useRefStore(state => state.editAreaRef);
  const trackListRef = useRefStore(state => state.trackListRef)

  // Filtered paths based on the search query
  const filteredGroupedPaths: GroupedPaths = useMemo(() => {
    if (!searchQuery) return groupedPaths;

    return Object.entries(groupedPaths).reduce((filteredPaths, [key, group]) => {
      if (key && key.toLowerCase().includes(searchQuery.toLowerCase()))
        filteredPaths[key] = group;

      return filteredPaths;
    }, {});
  }, [groupedPaths, searchQuery]);

  const startLeft = 22

  const verticalRowList = useMemo(() => {
    const allRows: string[] = [];

    const fillRows = ({ key, group }: { key: string, group: PathGroup }) => {
      const { rowIndex, trackKey } = group;

      if (rowIndex !== undefined) allRows[rowIndex] = trackKey

      Object.entries(group.children).forEach(([key, group]) => fillRows({ key, group }));
    };

    Object.entries(filteredGroupedPaths).forEach(([key, group]) => fillRows({ key, group }));
    return allRows.filter(item => item !== undefined);
  }, [editorObjects, filteredGroupedPaths]);

  const timelineClientWidth = currentTimelineLength * DEFAULT_SCALE_WIDTH / scale + startLeft

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
        itemContent={index => <EditAreaRow trackKey={verticalRowList[index]} index={index} scale={scale} snap={snap} />}
        scrollerRef={scrollerRefCallback}
        onScroll={handleOnScroll}
        components={{ Scroller }}
        overscan={10}
      />
    </div>
  );
};

const EditAreaRow = React.memo(({ trackKey, index, scale, snap }: { trackKey: any, index: number, scale: number, snap: boolean }) => {
  const isEmpty = !trackKey
  return (
    <div className={`w-full relative border-t-[0.5px] border-b-[0.5px] h-[34px] border-neutral-900 ${isEmpty && "bg-black bg-opacity-60"}`}>
      {trackKey && (
        <>
          <Track
            trackKey={trackKey}
            scale={scale}
            snap={snap}
          />
        </>
      )}
    </div>
  )
})