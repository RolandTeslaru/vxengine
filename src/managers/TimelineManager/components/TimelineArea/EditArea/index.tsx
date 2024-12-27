// VXEngine - VEXR Labs' proprietary toolset for React Three Fiber
// (c) 2024 VEXR Labs. All Rights Reserved.
// See the LICENSE file in the root directory of this source tree for licensing information.

import React, { memo, useMemo } from 'react';
import { ITrackTreeNode, PathGroup } from '@vxengine/AnimationEngine/types/track';
import { DEFAULT_ROW_HEIGHT, DEFAULT_SCALE_WIDTH } from '@vxengine/AnimationEngine/interface/const';
import Track from './Track';
import { useTimelineEditorAPI } from '@vxengine/managers/TimelineManager';
import { CursorLine } from '../cursor';
import { useRefStore } from '@vxengine/utils';

const startLeft = 22

export const EditArea = () => {
  const currentTimelineLength = useTimelineEditorAPI(state => state.currentTimelineLength);
  const scale = useTimelineEditorAPI(state => state.scale)
  const searchQuery = useTimelineEditorAPI(state => state.searchQuery);
  const trackTree = useTimelineEditorAPI(state => state.trackTree);

  const filteredTree: Record<string, ITrackTreeNode> = useMemo(() => {
    if (!searchQuery) return trackTree;
    return Object.entries(trackTree).reduce((filtredNode, [key, node]) => {
      if (key && key.toLowerCase().includes(searchQuery.toLowerCase())) {
        filtredNode[key] = node;
      }
      return filtredNode;
    }, {})
  }, [trackTree, searchQuery])

  const timelineClientWidth = currentTimelineLength * DEFAULT_SCALE_WIDTH / scale + startLeft

  return (
    <>
      <CursorLine rows={10 + 1} />
      {Object.values(filteredTree).map((node) =>
        <TrackNode node={node} timelineClientWidth={timelineClientWidth} />
      )}
    </>
  );
};

const TrackNode:React.FC<TrackNodeProps> = memo(({ node, timelineClientWidth }) => {
  const hasChildren = !!node.children
  const isCollapsed = useTimelineEditorAPI(state => state.collapsedTrackNodes[node.key]);
  const isTrack = !!node.track;

  return (
    <>
      <div
        className={`w-full relative border-t-[0.5px] border-b-[0.5px] h-[${DEFAULT_ROW_HEIGHT}px] border-neutral-900 ${!isTrack && "bg-black bg-opacity-60"}`}
      >
        {isTrack && <Track trackKey={node.track}/>}
      </div>
      {hasChildren && !isCollapsed &&
        Object.values(node.children).map((node) => <TrackNode node={node} timelineClientWidth={timelineClientWidth} />)
      }
    </>
  )
})

interface TrackNodeProps {
  node: ITrackTreeNode
  timelineClientWidth: number
}