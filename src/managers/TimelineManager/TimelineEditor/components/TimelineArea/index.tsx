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
import { useClipboardManagerAPI } from '@vxengine/managers/ClipboardManager/store';

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

  return (
    <div
      className={`w-[71%] h-full border border-neutral-800 bg-neutral-900/90
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


