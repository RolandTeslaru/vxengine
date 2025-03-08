// VXEngine - VEXR Labs' proprietary toolset for React Three Fiber
// (c) 2024 VEXR Labs. All Rights Reserved.
// See the LICENSE file in the root directory of this source tree for licensing information.

import React, { useEffect } from 'react';
import { useAnimationEngineEvent } from '@vxengine/AnimationEngine/utils/useAnimationEngineEvent';
import { useRefStore } from '@vxengine/utils/useRefStore';
import { useTimelineManagerAPI } from '../../..';
import { TimeArea } from './TimeArea';
import { EditArea } from './EditArea';
import { ONE_SECOND_UNIT_WIDTH } from '@vxengine/managers/constants';
import Cursor from './EditorCursor';
import { useTimelineEditorAPI } from '../../store';

export const startLeft = 0;

const TimelineArea = (() => {
  const timelineAreaRef = useRefStore(state => state.timelineAreaRef);
  const scrollLeftRef = useRefStore(state => state.scrollLeftRef)

  // Sync Cursor with Engine time
  useAnimationEngineEvent(
    'timeUpdatedByEngine',
    ({ time }) => {
      const scale = useTimelineEditorAPI.getState().scale
      const clientWidth = timelineAreaRef.current.offsetWidth

      const autoScrollFrom = clientWidth * 70 / 100;
      const left = time * (ONE_SECOND_UNIT_WIDTH / scale) + startLeft - autoScrollFrom;
      timelineAreaRef.current.scrollLeft = left;
      scrollLeftRef.current = left
    }
  );

  

  useEffect(() => {
    const handleCopy = (event: KeyboardEvent) => {
      const timelineEditorAPI = useTimelineEditorAPI.getState()

      if ((event.ctrlKey || event.metaKey) && event.key === "c") {
        const selectedKeyframeKeys = timelineEditorAPI.selectedKeyframeKeys
        const setClipboard = timelineEditorAPI.setClipboard;
        setClipboard(selectedKeyframeKeys);
      }
    }

    window.addEventListener('keydown', handleCopy);
    return () => window.removeEventListener("keydown", handleCopy);
  }, [])

  useEffect(() => {
    const handlePaste = (event: KeyboardEvent) => {
      const timelineManagerAPI = useTimelineManagerAPI.getState();
      const timelineEditorAPI = useTimelineEditorAPI.getState();

      const createKeyframe = timelineManagerAPI.createKeyframe;

      if ((event.ctrlKey || event.metaKey) && event.key === "v") {
        const clipboard = timelineEditorAPI.clipboard;
        Object.entries(clipboard).forEach(([trackKey, keyframesObj]) => {
          const keyframeKeys = Object.keys(keyframesObj);
          keyframeKeys.forEach((keyframeKey) => {
            const selectedKeyframe = timelineManagerAPI.tracks[trackKey]?.keyframes[keyframeKey]

            createKeyframe({
              trackKey,
              value: selectedKeyframe.value
            })
          })
        })
      }
    }

    window.addEventListener("keydown", handlePaste);
    return () => window.removeEventListener("keydown", handlePaste);
  }, [])

  return (
    <div
      className={`w-[75%] h-full border border-neutral-800 bg-neutral-900/90
                    rounded-2xl relative overflow-auto `}
      ref={timelineAreaRef}
      onScroll={handleOnScroll}
    >
      <Cursor />

      <TimeArea />
      <EditArea />

    </div>
  );
});


export default TimelineArea


const handleOnScroll = (e: React.UIEvent<HTMLDivElement, UIEvent>) => {
  const scrollContainer = e.target;
  const refStoreState = useRefStore.getState();
  const trackListRef = refStoreState.trackListRef;
  const scrollSyncId = refStoreState.scrollSyncId;

  if (!trackListRef.current)
    return;

  if (scrollSyncId.current)
    cancelAnimationFrame(scrollSyncId.current);

  scrollSyncId.current = requestAnimationFrame(() => {
    // @ts-expect-error
    trackListRef.current.scrollTop = scrollContainer.scrollTop;
  })
}


