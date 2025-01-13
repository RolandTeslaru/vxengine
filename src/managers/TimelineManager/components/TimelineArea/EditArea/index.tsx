// VXEngine - VEXR Labs' proprietary toolset for React Three Fiber
// (c) 2024 VEXR Labs. All Rights Reserved.
// See the LICENSE file in the root directory of this source tree for licensing information.

import React, { memo, useEffect, useLayoutEffect, useMemo } from 'react';
import { ITrackTreeNode, PathGroup } from '@vxengine/AnimationEngine/types/track';
import { DEFAULT_ROW_HEIGHT, DEFAULT_SCALE_WIDTH } from '@vxengine/AnimationEngine/interface/const';
import Track from './Track';
import { useTimelineEditorAPI } from '@vxengine/managers/TimelineManager';
import { updatePixelByScale } from '@vxengine/managers/TimelineManager/utils/deal_data';
import { keyframesRef, trackSegmentsRef } from '@vxengine/utils/useRefStore';
import { keyframeStartLeft } from './Keyframe';
import { segmentStartLeft } from './Track/TrackSegment';
import { handleCursorMutation, handleCursorMutationByScale } from '../EditorCursor/utils';

const startLeft = 22

export const EditArea = () => {
  const currentTimelineLength = useTimelineEditorAPI(state => state.currentTimelineLength);
  const scale = useTimelineEditorAPI(state => state.scale)
  const searchQuery = useTimelineEditorAPI(state => state.searchQuery);
  const trackTree = useTimelineEditorAPI(state => state.trackTree);

  const filteredTree: Record<string, ITrackTreeNode> = useMemo(() => {
    if (!searchQuery)
      return trackTree;

    return Object.entries(trackTree).reduce((filtredNode, [key, node]) => {
      if (key && key.toLowerCase().includes(searchQuery.toLowerCase())) {
        filtredNode[key] = node;
      }
      return filtredNode;
    }, {})
  }, [trackTree, searchQuery])

  const timelineClientWidth = currentTimelineLength * DEFAULT_SCALE_WIDTH / scale + startLeft

  // Handle UI Mutations 
  useLayoutEffect(() => {
    const unsubscribe = useTimelineEditorAPI.subscribe(
      ({ scale: currentScale }, { scale: prevScale }) => {
        if (currentScale !== prevScale) {
          // Rehydrate Keyframe positions
          keyframesRef.forEach((kfElement, keyframeKey) => {
            const prevLeft = parseFloat(kfElement.dataset.left);

            const newLeft = updatePixelByScale(prevLeft, prevScale, currentScale, keyframeStartLeft)
            kfElement.style.left = `${newLeft}px`;
            Object.assign(kfElement.dataset, {left: newLeft})
          })

          // Rehydrate TrackSegment positions
          trackSegmentsRef.forEach((tsElement, key) => {
            const prevLeft = parseFloat(tsElement.dataset.left);
            const prevWidth = parseFloat(tsElement.dataset.width)

            const newLeft = updatePixelByScale(prevLeft, prevScale, currentScale, segmentStartLeft);
            const newWidth = updatePixelByScale(prevWidth, prevScale, currentScale, 0);
            tsElement.style.left = `${newLeft}px`;
            tsElement.style.width = `${newWidth}px`
            Object.assign(tsElement.dataset, { left: newLeft, width: newWidth })
          })

          // Rehydrate Cursor position
          handleCursorMutationByScale(currentScale, prevScale);
        }
      })

    return () => unsubscribe()
  }, [])

  return (
    <>
      {Object.values(filteredTree).map((node, index) =>
        <TrackNode key={index} node={node} timelineClientWidth={timelineClientWidth} />
      )}
    </>
  );
};

const TrackNode: React.FC<TrackNodeProps> = memo(({ node, timelineClientWidth }) => {
  const hasChildren = !!node.children
  const isCollapsed = useTimelineEditorAPI(state => state.collapsedTrackNodes[node.key]);
  const isTrack = !!node.track;

  return (
    <>
      <div
          className={`relative border-t-[0.5px] border-b-[0.5px] border-neutral-800 ${!isTrack && "bg-neutral-950"}`}
          style={{ 
            width: timelineClientWidth, 
            height: DEFAULT_ROW_HEIGHT
          }}
      >
        {isTrack && <Track trackKey={node.track} />}
      </div>
      {hasChildren && !isCollapsed &&
        Object.values(node.children).map((node, index) => <TrackNode node={node} key={index} timelineClientWidth={timelineClientWidth} />)
      }
    </>
  )
})

interface TrackNodeProps {
  node: ITrackTreeNode
  timelineClientWidth: number
}