// VXEngine - VEXR Labs' proprietary toolset for React Three Fiber
// (c) 2024 VEXR Labs. All Rights Reserved.
// See the LICENSE file in the root directory of this source tree for licensing information.

import React, { memo, useEffect, useLayoutEffect, useMemo } from 'react';
import { ITrackTreeNode, PathGroup } from '@vxengine/AnimationEngine/types/track';
import { DEFAULT_ROW_HEIGHT, DEFAULT_SCALE_WIDTH } from '@vxengine/AnimationEngine/interface/const';
import Track from './Track';
import { useTimelineManagerAPI } from '@vxengine/managers/TimelineManager';
import { updatePixelByScale } from '@vxengine/managers/TimelineManager/utils/deal_data';
import { keyframesRef, trackSegmentsRef } from '@vxengine/utils/useRefStore';
import { keyframeStartLeft } from './Keyframe';
import { segmentStartLeft } from './Track/TrackSegment';
import { handleCursorMutation, handleCursorMutationByScale } from '../EditorCursor/utils';
import { useVXEngine } from '@vxengine/engine';
import { useTimelineEditorAPI } from '@vxengine/managers/TimelineManager/TimelineEditor/store';

const startLeft = 22

export const EditArea = () => {
  const currentTimelineLength = useTimelineManagerAPI(state => state.currentTimelineLength);
  const scale = useTimelineEditorAPI(state => state.scale)
  const searchQuery = useTimelineEditorAPI(state => state.searchQuery);
  const trackTree = useTimelineEditorAPI(state => state.trackTree);

  const IS_PRODUCTION = useVXEngine(state => state.IS_PRODUCTION)

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
            Object.assign(kfElement.dataset, { left: newLeft })
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

  const collapsedTrackNodes = useTimelineEditorAPI(state => state.collapsedTrackNodes)

  return (
    <>
      {filteredTree && Object.values(filteredTree).map((node, index) =>
        <TrackNode key={index} node={node} timelineClientWidth={timelineClientWidth} collapsedTrackNodes={collapsedTrackNodes} />
      )}
      {IS_PRODUCTION && (
        <div className='absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2'>
          <div className='flex ml-2 h-auto mx-5 mt-4'>
            <svg className='animate-ping absolute fill-red-600' width="60" height="60" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8.4449 0.608765C8.0183 -0.107015 6.9817 -0.107015 6.55509 0.608766L0.161178 11.3368C-0.275824 12.07 0.252503 13 1.10608 13H13.8939C14.7475 13 15.2758 12.07 14.8388 11.3368L8.4449 0.608765ZM7.4141 1.12073C7.45288 1.05566 7.54712 1.05566 7.5859 1.12073L13.9798 11.8488C14.0196 11.9154 13.9715 12 13.8939 12H1.10608C1.02849 12 0.980454 11.9154 1.02018 11.8488L7.4141 1.12073ZM6.8269 4.48611C6.81221 4.10423 7.11783 3.78663 7.5 3.78663C7.88217 3.78663 8.18778 4.10423 8.1731 4.48612L8.01921 8.48701C8.00848 8.766 7.7792 8.98664 7.5 8.98664C7.2208 8.98664 6.99151 8.766 6.98078 8.48701L6.8269 4.48611ZM8.24989 10.476C8.24989 10.8902 7.9141 11.226 7.49989 11.226C7.08567 11.226 6.74989 10.8902 6.74989 10.476C6.74989 10.0618 7.08567 9.72599 7.49989 9.72599C7.9141 9.72599 8.24989 10.0618 8.24989 10.476Z" fillRule="evenodd" clipRule="evenodd"></path></svg>
            <svg className=' fill-red-600' width="60" height="60" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8.4449 0.608765C8.0183 -0.107015 6.9817 -0.107015 6.55509 0.608766L0.161178 11.3368C-0.275824 12.07 0.252503 13 1.10608 13H13.8939C14.7475 13 15.2758 12.07 14.8388 11.3368L8.4449 0.608765ZM7.4141 1.12073C7.45288 1.05566 7.54712 1.05566 7.5859 1.12073L13.9798 11.8488C14.0196 11.9154 13.9715 12 13.8939 12H1.10608C1.02849 12 0.980454 11.9154 1.02018 11.8488L7.4141 1.12073ZM6.8269 4.48611C6.81221 4.10423 7.11783 3.78663 7.5 3.78663C7.88217 3.78663 8.18778 4.10423 8.1731 4.48612L8.01921 8.48701C8.00848 8.766 7.7792 8.98664 7.5 8.98664C7.2208 8.98664 6.99151 8.766 6.98078 8.48701L6.8269 4.48611ZM8.24989 10.476C8.24989 10.8902 7.9141 11.226 7.49989 11.226C7.08567 11.226 6.74989 10.8902 6.74989 10.476C6.74989 10.0618 7.08567 9.72599 7.49989 9.72599C7.9141 9.72599 8.24989 10.0618 8.24989 10.476Z" fillRule="evenodd" clipRule="evenodd"></path></svg>
          </div>
        </div>
      )}
    </>
  );
};

const TrackNode: React.FC<TrackNodeProps> = memo(({ node, timelineClientWidth, collapsedTrackNodes }) => {
  const hasChildren = !!node.children
  const isCollapsed = collapsedTrackNodes[node.key];
  const isTrack = !!node.track;

  return (
    <>
      <div
        className={`relative border-t-[0.5px] border-b-[0.5px] border-neutral-800 ${!isTrack && "bg-neutral-950 bg-opacity-90"}`}
        style={{
          width: timelineClientWidth,
          height: DEFAULT_ROW_HEIGHT
        }}
      >
        {isTrack && <Track trackKey={node.track} />}
      </div>
      {hasChildren && !isCollapsed &&
        Object.values(node.children).map((node, index) => <TrackNode node={node} key={index} timelineClientWidth={timelineClientWidth} collapsedTrackNodes={collapsedTrackNodes} />)
      }
    </>
  )
})

interface TrackNodeProps {
  node: ITrackTreeNode
  timelineClientWidth: number
  collapsedTrackNodes: Record<string, boolean>
}