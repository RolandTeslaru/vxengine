import React, { FC } from 'react';
import { prefix } from '../../utils/deal_class_prefix';
import { parserPixelToTime } from '../../utils/deal_data';
import { DragLineData } from './drag_lines';
import { EditAction } from './edit_action';
import './edit_row.scss';
import { ITrack } from 'vxengine/AnimationEngine/types/track';
import { CommonProp } from 'vxengine/AnimationEngine/interface/common_prop';
import { EditKeyframe } from './EditKeyframe';

export type EditRowProps = CommonProp & {
  areaRef: React.MutableRefObject<HTMLDivElement>;
  trackData?: ITrack;
  style?: React.CSSProperties;
  dragLineData: DragLineData;
  /** 距离左侧滚动距离 */
  scrollLeft: number;
  /** 设置scroll left */
  deltaScrollLeft: (scrollLeft: number) => void;
};

export const EditTrack: FC<EditRowProps> = (props) => {
  const classNames = ['edit-row'];
  if (props.trackData?.selected) classNames.push('edit-row-selected');

  const handleTime = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (props.areaRef.current) return;
    const rect = props.areaRef.current.getBoundingClientRect();
    const position = e.clientX - rect.x;
    const left = position + props.scrollLeft;
    const time = parserPixelToTime(left, { 
      startLeft: props.startLeft, 
      scale: props.scale, 
      scaleWidth: props.scaleWidth});
    return time;
  };

  return (
    <div
      className={`${prefix(...classNames)} ${(props.trackData?.classNames || []).join(
        ' ',
      )}`}
      style={props.style}
      onClick={(e) => {
        if (props.trackData && props.onClickRow) {
          const time = handleTime(e);
          onClickRow(e, { row: props.trackData, time: time });
        }
      }}
      onDoubleClick={(e) => {
        if (props.trackData && props.onDoubleClickRow) {
          const time = handleTime(e);
          onDoubleClickRow(e, { row: props.trackData, time: time });
        }
      }}
      onContextMenu={(e) => {
        if (props.trackData && onContextMenuRow) {
          const time = handleTime(e);
          onContextMenuRow(e, { row: props.trackData, time: time });
        }
      }}
    >
      {(props.trackData?.keyframes || []).map((keyframe) => (
        <EditKeyframe
          key={keyframe.id}
          {...props}
          handleTime={handleTime}
          track={props.trackData}
          keyframe={keyframe}
        />
      ))}
    </div>
  );
};
