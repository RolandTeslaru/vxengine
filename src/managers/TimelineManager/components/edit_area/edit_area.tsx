import React, { useEffect, useImperativeHandle, useLayoutEffect, useRef } from 'react';
import { Grid, GridCellRenderer, OnScrollParams } from 'react-virtualized';
import { prefix } from '../../utils/deal_class_prefix';
import { parserTimeToPixel } from '../../utils/deal_data';
import { DragLines } from './drag_lines';
import './edit_area.scss';
import { EditTrack } from './EditTrack';
import { useDragLine } from './hooks/use_drag_line';
import { ITrack, IObjectEditorData } from 'vxengine/AnimationEngine/types/track';
import { CommonProp } from 'vxengine/AnimationEngine/interface/common_prop';
import { useTimelineEditorStore } from '../../store';
import { shallow } from 'zustand/shallow';
import { DEFAULT_ROW_HEIGHT, DEFAULT_SCALE_WIDTH } from 'vxengine/AnimationEngine/interface/const';
import { useVXUiStore } from 'vxengine/store/VXUIStore';
import AutoSizer from '../AutoSizer';

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

  const { editorData, scaleCount, editAreaRef, scale, scrollLeft, scrollTop, startLeft } = useTimelineEditorStore(state => ({
    editorData: state.editorData,
    scaleCount: state.scaleCount,
    editAreaRef: state.editAreaRef,
    scale: state.scale,
    scrollLeft: state.scrollLeft,
    scrollTop: state.scrollTop,
    startLeft: state.startLeft,
  }), shallow);
  const { dragLineData, initDragLine, updateDragLine, disposeDragLine, defaultGetAssistPosition, defaultGetMovePosition } = useDragLine();
  const gridRef = useRef<Grid>();
  const heightRef = useRef(-1);

  // Flatten the tracks
  const flattenedTracks = Object.values(editorData).flatMap((obj) => obj.tracks);

  // ref data
  useImperativeHandle(ref, () => ({
    get domRef() {
      return editAreaRef;
    },
  }));

  const handleInitDragLine = (data) => {
    if (dragLine) {
      const assistActionIds =
        getAssistDragLineActionIds &&
        getAssistDragLineActionIds({
          action: data.action,
          row: data.row,
          editorData: flattenedTracks,
        });
      const cursorLeft = parserTimeToPixel(useTimelineEditorStore.getState().cursorTime, { DEFAULT_SCALE_WIDTH, scale, startLeft });
      const assistPositions = defaultGetAssistPosition({
        editorData: flattenedTracks,
        assistActionIds,
        action: data.action,
        row: data.row,
        scale,
        DEFAULT_SCALE_WIDTH,
        startLeft,
        hideCursor: false,
        cursorLeft,
      });
      initDragLine({ assistPositions });
    }
  };

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

  /** Get the rendering content of each cell */
  const cellRenderer: GridCellRenderer = ({ rowIndex, key, style }) => {
    const track = flattenedTracks[rowIndex]; // Row data
    return (
      <EditTrack
        {...props}
        style={{
          ...style,
          backgroundPositionX: `0, ${startLeft}px`,
          backgroundSize: `${startLeft}px, ${DEFAULT_SCALE_WIDTH}px`,
        }}
        key={key}
        trackData={track}
        dragLineData={dragLineData}
        onActionMoveStart={(data) => {
          handleInitDragLine(data);
          return onActionMoveStart && onActionMoveStart(data);
        }}
        onActionResizeStart={(data) => {
          handleInitDragLine(data);

          return onActionResizeStart && onActionResizeStart(data);
        }}
        onActionMoving={(data) => {
          handleUpdateDragLine(data);
          return onActionMoving && onActionMoving(data);
        }}
        onActionResizing={(data) => {
          handleUpdateDragLine(data);
          return onActionResizing && onActionResizing(data);
        }}
        onActionResizeEnd={(data) => {
          disposeDragLine();
          return onActionResizeEnd && onActionResizeEnd(data);
        }}
        onActionMoveEnd={(data) => {
          disposeDragLine();
          return onActionMoveEnd && onActionMoveEnd(data);
        }}
      />
    );
  };

  useLayoutEffect(() => {
    gridRef.current?.scrollToPosition({ scrollTop, scrollLeft });
    // console.log("Use effect scrollLeft ", scrollLeft);
  }, [scrollTop, scrollLeft]);

  useEffect(() => {
    gridRef.current.recomputeGridSize();
  }, [editorData, timelineEditorAttached]);

  return (
    <div ref={editAreaRef} className={prefix('edit-area') + " w-full h-full"}>
      <button onClick={() => { 
        console.log("Recomputing Grid Size onClick"); 
        console.log("EditAreaRef", editAreaRef.current as HTMLDivElement);
        gridRef.current.recomputeGridSize()
      }}>Recompute Grid</button>
      <AutoSizer>
        {({ width, height }) => {
          console.log("Width, height ", width, height)
          useTimelineEditorStore.setState({ clientHeight: height, clientWidth: width});
          // Get total height
          let totalHeight = 0;
          // Height list
          const heights = flattenedTracks.map(() => DEFAULT_ROW_HEIGHT);
          totalHeight = heights.length * DEFAULT_ROW_HEIGHT;

          if (totalHeight < height) {
            heights.push(height - totalHeight);
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
              onScroll={(param) => {
                useTimelineEditorStore.setState({
                  clientHeight: param.clientHeight,
                  clientWidth: param.clientWidth,
                  scrollTop: param.scrollTop,
                  // scrollLeft: param.scrollLeft,
                  scrollHeight: param.scrollHeight
                })
              }}
            />
          );
        }}
      </AutoSizer>
      {dragLine && <DragLines scrollLeft={scrollLeft} {...dragLineData} />}
    </div>
  );
});