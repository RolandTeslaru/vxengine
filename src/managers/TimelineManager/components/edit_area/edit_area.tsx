import React, { useEffect, useImperativeHandle, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Grid, GridCellRenderer, OnScrollParams } from 'react-virtualized';
import { prefix } from '../../utils/deal_class_prefix';
import { parserTimeToPixel } from '../../utils/deal_data';
import { DragLines } from './drag_lines';
import './edit_area.scss';
import { EditTrack } from './EditTrack';
import { useDragLine } from './hooks/use_drag_line';
import { ITrack, edObjectProps, PathGroup, IKeyframe } from 'vxengine/AnimationEngine/types/track';
import { CommonProp } from 'vxengine/AnimationEngine/interface/common_prop';
import { useTimelineEditorAPI } from '../../store';
import { shallow } from 'zustand/shallow';
import { DEFAULT_ROW_HEIGHT, DEFAULT_SCALE_WIDTH } from 'vxengine/AnimationEngine/interface/const';
import { useVXUiStore } from "vxengine/components/ui/VXUIStore"
import AutoSizer from '../AutoSizer';
import { ScrollArea } from 'vxengine/components/shadcn/scrollArea';

export type EditAreaProps = {
  // scrollLeft: number;
  // scrollTop: number;
  // onScroll: (params: OnScrollParams) => void;
  deltaScrollLeft: (scrollLeft: number) => void;
};

export interface EditAreaState {
  domRef: React.MutableRefObject<HTMLDivElement>;
}

export const EditArea = React.forwardRef<EditAreaState, EditAreaProps>((props, ref) => {
  const {
    dragLine,
    getAssistDragLineActionIds,
    onActionMoveEnd,
    onActionMoveStart,
    onActionMoving,
    onActionResizeEnd,
    onActionResizeStart,
    onActionResizing,
  } = props;

  const timelineEditorAttached = useVXUiStore(state => state.timelineEditorAttached);

  const { editorData, scaleCount, editAreaRef, scale, scrollLeft, scrollTop, startLeft, trackListRef, groupedPaths } = useTimelineEditorAPI(state => ({
    editorData: state.editorData,
    scaleCount: state.scaleCount,
    editAreaRef: state.editAreaRef,
    scale: state.scale,
    scrollLeft: state.scrollLeft,
    scrollTop: state.scrollTop,
    startLeft: state.startLeft,
    trackListRef: state.trackListRef,
    groupedPaths: state.groupedPaths
  }), shallow);
  const { dragLineData, initDragLine, updateDragLine, disposeDragLine, defaultGetAssistPosition, defaultGetMovePosition } = useDragLine();
  const gridRef = useRef<Grid>();
  const heightRef = useRef(-1);

  // Flatten the tracks
  // const flattenedTracks = Object.values(editorData).flatMap((obj) => obj.tracks);

  // ref data
  useImperativeHandle(ref, () => ({
    get domRef() {
      return editAreaRef;
    },
  }));

  // const handleInitDragLine = (data) => {
  //   if (dragLine) {
  //     const assistActionIds =
  //       getAssistDragLineActionIds &&
  //       getAssistDragLineActionIds({
  //         action: data.action,
  //         row: data.row,
  //         editorData: flattenedTracks,
  //       });
  //     const cursorLeft = parserTimeToPixel(useTimelineEditorAPI.getState().cursorTime, { DEFAULT_SCALE_WIDTH, scale, startLeft });
  //     const assistPositions = defaultGetAssistPosition({
  //       editorData: flattenedTracks,
  //       assistActionIds,
  //       action: data.action,
  //       row: data.row,
  //       scale,
  //       DEFAULT_SCALE_WIDTH,
  //       startLeft,
  //       hideCursor: false,
  //       cursorLeft,
  //     });
  //     initDragLine({ assistPositions });
  //   }
  // };

  const handleUpdateDragLine = (data) => {
    if (dragLine) {
      const movePositions = defaultGetMovePosition({
        ...data,
        startLeft,
        DEFAULT_SCALE_WIDTH,
        scale,
      });
      updateDragLine({ movePositions });
    }
  };


  const verticalRowList = useMemo(() => {
    const allRows = [];

    const fillRows = ({ key, group }: { key: string, group: PathGroup }) => {
      const { rowIndex, trackKey } = group;

      if (rowIndex !== undefined) {
        allRows[rowIndex] = trackKey
      }

      Object.entries(group.children).forEach(([key, group]) => fillRows({ key, group }));
    };

    Object.entries(groupedPaths).forEach(([key, group]) => fillRows({ key, group }));

    return allRows;
  }, [editorData]);

  // Handle Keyframe Click
  const lastKeyframeKeySelected = useRef(null)

  const handleKeyframeClick = (event: React.MouseEvent, keyframeKey: string) => {
    event.preventDefault();

    const keyframeKeys = Object.keys(useTimelineEditorAPI.getState().keyframes);
    const selectedKeyframeKeys = useTimelineEditorAPI.getState().selectedKeyframeKeys;

    // Find the index of the current keyframe in the keyframeKeys array
    const currentIndex = keyframeKeys.indexOf(keyframeKey);

    // Click + SHIFT key
    if (event.shiftKey && lastKeyframeKeySelected.current !== null) {
      const lastIndex = keyframeKeys.indexOf(lastKeyframeKeySelected.current);
      const start = Math.min(lastIndex, currentIndex);
      const end = Math.max(lastIndex, currentIndex);
      const newSelectedKeyframeKeys = keyframeKeys.slice(start, end + 1);
      // Combine selected keys with previous selection
      const combinedSelection = [...new Set([...newSelectedKeyframeKeys, ...selectedKeyframeKeys])];
      useTimelineEditorAPI.getState().setSelectedKeyframeKeys(combinedSelection);
    }
    // Click + CTRL key ( command key on macOS )
    else if (event.metaKey || event.ctrlKey) {
      const newSelectedKeys = selectedKeyframeKeys.includes(keyframeKey)
        ? selectedKeyframeKeys.filter(key => key !== keyframeKey)
        : [...selectedKeyframeKeys, keyframeKey];
      useTimelineEditorAPI.getState().setSelectedKeyframeKeys(newSelectedKeys);
    }
    // Normal Click
    else {
      useTimelineEditorAPI.getState().setSelectedKeyframeKeys([keyframeKey]);
    }

    // Update the last selected keyframe
    lastKeyframeKeySelected.current = keyframeKey
  };

  const cellRenderer: GridCellRenderer = ({ rowIndex, key, style }) => {
    const track = verticalRowList[rowIndex];

    if (track) {
      // Render the track if it exists
      return (
        <EditTrack
          {...props}
          editAreaRef={editAreaRef}
          style={{
            ...style,
            backgroundPositionX: `0, ${startLeft}px`,
            backgroundSize: `${startLeft}px, ${DEFAULT_SCALE_WIDTH}px`,
          }}
          key={key}
          trackKey={track}  // Pass the track to EditTrack
          dragLineData={dragLineData}
          // onActionMoveStart={handleInitDragLine}
          // onActionResizeStart={handleInitDragLine}
          onActionMoving={handleUpdateDragLine}
          onActionResizing={handleUpdateDragLine}
          onActionResizeEnd={disposeDragLine}
          onActionMoveEnd={disposeDragLine}
          globalKeyframeClickHandle={handleKeyframeClick}
        />
      );
    } else {
      // Render an empty row
      return (
        <div
          key={key}
          style={{
            ...style,
            backgroundPositionX: `0, ${startLeft}px`,
            backgroundSize: `${startLeft}px, ${DEFAULT_SCALE_WIDTH}px`,
          }}
          className='relative  py-4 border-y border-neutral-900 bg-black bg-opacity-60'
        >
          {/* Optionally add content for empty rows */}
        </div>
      );
    }
  };

  useLayoutEffect(() => {
    gridRef.current?.scrollToPosition({ scrollTop, scrollLeft });
    // console.log("Use effect scrollLeft ", scrollLeft);
  }, [scrollTop, scrollLeft]);

  useEffect(() => {
    gridRef.current.recomputeGridSize();
  }, [editorData, timelineEditorAttached]);

  // Handle scroll events manually
  // TODO: eleimante all the scroll states and change to refs
  // const handleScroll = (e) => {
  //   const scrollContainer = e.target;
  //   const newScrollLeft = scrollContainer.scrollLeft;

  //   console.log("Handle scroll on Edit are ", e.target.scrollTop )
  //   trackListRef.current.scrollTop =  scrollContainer.scrollTop;

  //   // console.log("Handling new scrool ", newScrollLeft, newScrollTop, "  current scrollLeft ", useTimelineEditorAPI.getState().scrollLeft, "  current scrollTop ", useTimelineEditorAPI.getState().scrollTop);
  //   if(newScrollLeft !== useTimelineEditorAPI.getState().scrollLeft ) {
  //     useTimelineEditorAPI.setState({ scrollLeft: newScrollLeft });
  //   }
  // };

  const handleOnScroll = (param) => {
    if (!trackListRef.current) return

    trackListRef.current.scrollTop = param.scrollTop
    useTimelineEditorAPI.setState({
      scrollLeft: param.scrollLeft,
    })
  }

  return (

    <div ref={editAreaRef} className={prefix('edit-area') + " w-full h-full"}>
      <AutoSizer>
        {({ width, height }) => {
          // console.log("Width, height ", width, height)
          // Get total height
          let totalClientHeight = 0;
          // Height list
          const heights = verticalRowList.map(() => DEFAULT_ROW_HEIGHT);
          totalClientHeight = heights.length * DEFAULT_ROW_HEIGHT;

          if (totalClientHeight < height) {
            heights.push(height - totalClientHeight);
            if (heightRef.current !== height && heightRef.current >= 0) {
              setTimeout(() =>
                gridRef.current?.recomputeGridSize({
                  rowIndex: heights.length - 1,
                }),
              );
            }
          }
          heightRef.current = height;

          return (
            <Grid
              columnCount={1}
              rowCount={heights.length}
              ref={gridRef}
              cellRenderer={cellRenderer}
              columnWidth={Math.max(scaleCount * DEFAULT_SCALE_WIDTH + startLeft, width)}
              width={width}
              height={height}
              rowHeight={({ index }) => heights[index] || DEFAULT_ROW_HEIGHT}
              overscanRowCount={10}
              overscanColumnCount={0}
              onScroll={handleOnScroll}
            />
          );
        }}
      </AutoSizer>
      {dragLine && <DragLines scrollLeft={scrollLeft} {...dragLineData} />}
    </div>
  );
});