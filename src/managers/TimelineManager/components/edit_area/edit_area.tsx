import React, { useEffect, useImperativeHandle, useLayoutEffect, useMemo, useRef, useState } from 'react';
import './edit_area.scss';
import { EditTrack } from './EditTrack';
import { useDragLine } from './hooks/use_drag_line';
import { ITrack, edObjectProps, PathGroup, IKeyframe } from '@vxengine/AnimationEngine/types/track';
import { useTimelineEditorAPI } from '../../store';
import { shallow } from 'zustand/shallow';
import { DEFAULT_ROW_HEIGHT, DEFAULT_SCALE_WIDTH } from '@vxengine/AnimationEngine/interface/const';
import { useVXAnimationStore } from '@vxengine/AnimationEngine/AnimationStore';
import { CursorLine } from '../cursor/cursor';
import { useRefStore } from '@vxengine/utils/useRefStore';

export type EditAreaProps = {
  deltaScrollLeft: (scrollLeft: number) => void;
};

export interface EditAreaState {
  domRef: React.MutableRefObject<HTMLDivElement>;
}

export const EditArea = React.forwardRef<EditAreaState, EditAreaProps>((props, ref) => {
  const {
    deltaScrollLeft
  } = props;

  const timelineLength = useVXAnimationStore(state => state.currentTimeline.length)

  const { editorObjects, scale, groupedPaths } = useTimelineEditorAPI(state => ({
    editorObjects: state.editorObjects,
    scale: state.scale,
    groupedPaths: state.groupedPaths
  }), shallow);
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


  const renderRows = () => {
    return verticalRowList.map((row, index) => {
      const track = verticalRowList[index];
      if (row) {
        return (
          <EditTrack
            {...props}
            style={{
              height: `${DEFAULT_ROW_HEIGHT}px`,
              backgroundPositionX: `0, ${startLeft}px`,
              backgroundSize: `${startLeft}px, ${DEFAULT_SCALE_WIDTH}px`,
            }}
            key={index}
            trackKey={track} 
            dragLineData={dragLineData}
          />
        );
      } else {
        return (
          <div
            key={index}
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
    });
  };
  const timelineClientWidth = timelineLength * DEFAULT_SCALE_WIDTH + startLeft

  return (
    <div
      style={{
        position: 'relative',
        height: `${verticalRowList.length * DEFAULT_ROW_HEIGHT}px`,
        width: `${timelineClientWidth}px` // Ensure this is greater than the container's width
      }}
    >
      <CursorLine
        deltaScrollLeft={deltaScrollLeft}
      />
      {renderRows()}
    </div>
  );
});