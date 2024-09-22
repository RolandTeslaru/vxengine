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
import { RowDnd } from '../row_rnd/row_rnd';

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

const startLeft = 22

export const EditTrack: FC<EditRowProps> = (props) => {
  const { trackKey, globalKeyframeClickHandle } = props;
  const track = useTimelineEditorAPI(state => state.tracks[trackKey])
  return (
    <div
      className='relative  py-4 border-y border-neutral-900'
      style={props.style}
    >
      {track.keyframes.map((keyframeKey: string, index: number) => {
        if(index === 0) return null;

        const firstKeyframeKey = track.keyframes[index - 1]
        const secondKeyframeKey = keyframeKey 
        return <EditTrackSegment 
          firstKeyframeKey={firstKeyframeKey} 
          secondKeyframeKey={secondKeyframeKey}
          trackKey={trackKey}
        />
      })}

      {/* Render Keyframes */}
      {track.keyframes.map((keyframeKey: string, index) => (
        <EditKeyframe
          key={index}
          track={track}
          {...props}
          keyframeKey={keyframeKey}
          globalKeyframeClickHandle={globalKeyframeClickHandle}
        />
      ))}
    </div>
  );
};



const EditTrackSegment = ({ firstKeyframeKey, secondKeyframeKey, trackKey}:
  { firstKeyframeKey: string, secondKeyframeKey: string, trackKey: string }
) => {
  const firstKeyframe = useTimelineEditorAPI(state => state.keyframes[firstKeyframeKey])
  const secondKeyframe = useTimelineEditorAPI(state => state.keyframes[secondKeyframeKey])
  const selectedKeyframeKeys = useTimelineEditorAPI(state => state.selectedKeyframeKeys)
  const setSelectedKeyframeKeys = useTimelineEditorAPI(state => state.setSelectedKeyframeKeys)
  const selectedTrackSegment = useTimelineEditorAPI(state => state.selectedTrackSegment) 
  const setSelectedTrackSegment = useTimelineEditorAPI(state => state.setSelectedTrackSegment)

  const isSelectedFromKeyframes = selectedKeyframeKeys.includes(firstKeyframe.id) && selectedKeyframeKeys.includes(secondKeyframe.id)
  const isSelectedFromTrackSegments = selectedTrackSegment?.firstKeyframeKey === firstKeyframeKey && selectedTrackSegment?.secondKeyframeKey === secondKeyframeKey

  const startX = parserTimeToPixel(firstKeyframe.time, startLeft);
  const endX = parserTimeToPixel(secondKeyframe.time, startLeft);
  
  const handleOnDrag = (data: { left: number, lastLeft: number }) => {
    const newTime = parserPixelToTime(data.left, startLeft)
    const oldTime = parserPixelToTime(data.lastLeft, startLeft)
    const deltaTime = newTime - oldTime
  
    const oldFirstKeyframeTime = useTimelineEditorAPI.getState().keyframes[firstKeyframeKey].time;
    const oldSecondKeyframeTime = useTimelineEditorAPI.getState().keyframes[secondKeyframeKey].time;

    const newFirstKeyframeTime = oldFirstKeyframeTime + deltaTime
    const newSecondKeyframeTime = oldSecondKeyframeTime + deltaTime

    useTimelineEditorAPI.getState().setKeyframeTime(firstKeyframeKey, parseFloat(newFirstKeyframeTime.toFixed(4)))
    useTimelineEditorAPI.getState().setKeyframeTime(secondKeyframeKey, parseFloat(newSecondKeyframeTime.toFixed(4)))
  }

  const handleOnClick = () => {
    setSelectedKeyframeKeys([firstKeyframe.id, secondKeyframe.id])
    setSelectedTrackSegment(firstKeyframeKey, secondKeyframeKey, trackKey)
  }

  return (
    <RowDnd
      onDrag={handleOnDrag}
      left={startX}
      start={startLeft}
      width={endX - startX}
    >
      <div
        key={`line-${firstKeyframe.id}-${secondKeyframe.id}`}
        className={`absolute bg-white h-[6px] flex ${isSelectedFromKeyframes && "bg-yellow-400"} ${isSelectedFromTrackSegments && "!bg-blue-500"}`}
        style={{
          top: `calc(50% - 3px)`,
        }}
        onClick={handleOnClick}
      >
      </div>
    </RowDnd>
  )
}