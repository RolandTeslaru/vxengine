import React, { FC, useEffect } from 'react';
import { parserPixelToTime, parserTimeToPixel } from '../../utils/deal_data';
import { DragLineData } from './drag_lines';
import './edit_row.scss';
import { IKeyframe, ITrack } from 'vxengine/AnimationEngine/types/track';
import { CommonProp } from 'vxengine/AnimationEngine/interface/common_prop';
import { EditKeyframe } from './EditKeyframe';
import { useTimelineEditorAPI } from '../../store';
import { prefix } from '../../utils/deal_class_prefix';
import { shallow } from 'zustand/shallow';
import { useRefStore } from 'vxengine/utils/useRefStore';

export type EditRowProps = CommonProp & {
  trackKey: string
  style?: React.CSSProperties;
  dragLineData: DragLineData;
  /** Scroll distance from the left */
  scrollLeft: number;
  /** Set scroll left */
  editAreaRef: React.MutableRefObject<HTMLDivElement>;
  globalKeyframeClickHandle: (event, keyframeKey) => void
};

export const EditTrack: FC<EditRowProps> = (props) => {
  const { trackKey, globalKeyframeClickHandle } = props;
  const { scale, scaleWidth, track } = useTimelineEditorAPI(state => ({
    scale: state.scale,
    scaleWidth: state.scaleWidth,
    track: state.tracks[trackKey],
  }), shallow);
  const startLeft = 22;
  const editAreaRef = useRefStore(state => state.editAreaRef)

  const handleTime = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (editAreaRef.current) return;
    const rect = editAreaRef.current.getBoundingClientRect();
    const position = e.clientX - rect.x;
    const left = position + props.scrollLeft;
    const time = parserPixelToTime(left, startLeft);
    return time;
  };

  const keyframesForTrack = React.useMemo(() => {
    const kfs = useTimelineEditorAPI.getState().getKeyframesForTrack(trackKey)
    return kfs
  }, [track?.keyframes])

  const selectedKeyframeKeys = useTimelineEditorAPI(state => state.selectedKeyframeKeys)

  return (
    <div
      className='relative  py-4 border-y border-neutral-900'
      style={props.style}
    // onClick={(e) => {
    //   if (props.trackData && props.onClickRow) {
    //     const time = handleTime(e);
    //     onClickRow(e, { row: props.trackData, time: time });
    //   }
    // }}
    // onDoubleClick={(e) => {
    //   if (props.trackData && props.onDoubleClickRow) {
    //     const time = handleTime(e);
    //     onDoubleClickRow(e, { row: props.trackData, time: time });
    //   }
    // }}
    // onContextMenu={(e) => {
    //   if (props.trackData && onContextMenuRow) {
    //     const time = handleTime(e);
    //     onContextMenuRow(e, { row: props.trackData, time: time });
    //   }
    // }}
    >
      {/* Render Lines Between Keyframes */}
      {keyframesForTrack.map((keyframe: IKeyframe, index: number) => {
        if (index === 0) return null;
        // 
        const previousKeyframe = keyframesForTrack[index - 1];
        const startX = parserTimeToPixel(previousKeyframe.time, startLeft);
        const endX = parserTimeToPixel(keyframe.time, startLeft);

        const isSelected = selectedKeyframeKeys.includes(keyframe.id) && selectedKeyframeKeys.includes(previousKeyframe.id)

        return (
          <div
            key={`line-${previousKeyframe.id}-${keyframe.id}`}
            className={`absolute bg-white h-[6px] flex ${isSelected && "bg-yellow-400"}`}
            style={{
              left: `${startX}px`,
              width: `${endX - startX}px`,
              top: `calc(50% - 3px)`,
            }}
          >
          </div>
        );
      })}

      {/* Render Keyframes */}
      {(keyframesForTrack || []).map((keyframe: IKeyframe, index) => (
        <EditKeyframe
          key={index}
          track={track}
          {...props}
          handleTime={handleTime}
          keyframe={keyframe}
          globalKeyframeClickHandle={globalKeyframeClickHandle}
        />
      ))}
    </div>
  );
};