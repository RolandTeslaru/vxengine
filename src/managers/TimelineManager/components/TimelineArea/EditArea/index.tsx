// VXEngine - VEXR Labs' proprietary toolset for React Three Fiber
// (c) 2024 VEXR Labs. All Rights Reserved.
// See the LICENSE file in the root directory of this source tree for licensing information.

import React, { useMemo } from 'react';
import {  PathGroup } from '@vxengine/AnimationEngine/types/track';
import { DEFAULT_ROW_HEIGHT, DEFAULT_SCALE_WIDTH } from '@vxengine/AnimationEngine/interface/const';
import Track from './Track';
import { useTimelineEditorAPI } from '@vxengine/managers/TimelineManager';
import { CursorLine } from '../cursor';
import { GroupedPaths } from '@vxengine/managers/TimelineManager/store';

export const EditArea = () => {
  const currentTimelineLength = useTimelineEditorAPI(state => state.currentTimelineLength);
  const editorObjects = useTimelineEditorAPI(state => state.editorObjects);
  const groupedPaths = useTimelineEditorAPI(state => state.groupedPaths)
  const scale = useTimelineEditorAPI(state => state.scale)
  const searchQuery = useTimelineEditorAPI(state => state.searchQuery);

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

  const [verticalRowList, listLength] = useMemo(() => {
    const allRows: string[] = [];

    const fillRows = ({ key, group }: { key: string, group: PathGroup }) => {
      const { rowIndex, trackKey } = group;

      if (rowIndex !== undefined) allRows[rowIndex] = trackKey

      Object.entries(group.children).forEach(([key, group]) => fillRows({ key, group }));
    };

    Object.entries(filteredGroupedPaths).forEach(([key, group]) => fillRows({ key, group }));

    const finalList = allRows.filter(item => item !== undefined);
    return [finalList, finalList.length];
  }, [editorObjects, filteredGroupedPaths]);

  const timelineClientWidth = currentTimelineLength * DEFAULT_SCALE_WIDTH / scale + startLeft


  return (
    <>
      <CursorLine rows={listLength + 1}/>
      {verticalRowList.map((trackKey, index) =>
        <EditAreaRow trackKey={trackKey} key={trackKey ?? `noTrack-${Math.random()}`} index={index} width={timelineClientWidth} />
      )}
    </>
  );
};

const EditAreaRow = React.memo(({ trackKey, index, width }: { trackKey: any, index: number, width: number }) => {
  const isEmpty = !trackKey
  return (
    <div 
      className={`w-full relative border-t-[0.5px] border-b-[0.5px] h-[${DEFAULT_ROW_HEIGHT}px] border-neutral-900 ${isEmpty && "bg-black bg-opacity-60"}`}
      style={{ width: `${width}px`}}  
    >
      {trackKey && (
        <>
          <Track
            trackKey={trackKey}
          />
        </>
      )}
    </div>
  )
})