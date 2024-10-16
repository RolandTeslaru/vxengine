import React, { FC, useEffect, useState } from 'react';
import { parserPixelToTime, parserTimeToPixel } from '../../utils/deal_data';
import { DragLineData } from './drag_lines';
import { IKeyframe, ITrack } from '@vxengine/AnimationEngine/types/track';
import { CommonProp } from '@vxengine/AnimationEngine/interface/common_prop';
import { EditKeyframe } from './EditKeyframe';
import { useTimelineEditorAPI } from '../../store';
import { prefix } from '../../utils/deal_class_prefix';
import { shallow } from 'zustand/shallow';
import { useRefStore } from '@vxengine/utils/useRefStore';
import { RowDnd } from '../row_rnd/row_rnd';
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from '@vxengine/components/shadcn/contextMenu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@vxengine/components/shadcn/alertDialog';
import HazardStripes from '@vxengine/components/ui/HazardStripes/HazardStripes';

export type EditRowProps = {
  trackKey: string
  style?: React.CSSProperties;
  dragLineData: DragLineData;
};

const startLeft = 22

export const EditTrack: FC<EditRowProps> = (props) => {
  const { trackKey } = props;
  const track = useTimelineEditorAPI(state => state.tracks[trackKey])
  return (
    <div
      className='relative  py-4 border-y border-neutral-900'
      style={props.style}
    >
      {track.keyframes.map((keyframeKey: string, index: number) => {
        if (index === 0) return null;

        const firstKeyframeKey = track.keyframes[index - 1]
        const secondKeyframeKey = keyframeKey
        return <EditTrackSegment
          firstKeyframeKey={firstKeyframeKey}
          secondKeyframeKey={secondKeyframeKey}
          trackKey={trackKey}
          key={index}
        />
      })}

      {/* Render Keyframes */}
      {track.keyframes.map((keyframeKey: string, index) => (
        // @ts-expect-error
        <EditKeyframe
          key={index}
          track={track}
          {...props}
          keyframeKey={keyframeKey}
        />
      ))}
    </div>
  );
};



const EditTrackSegment = ({ firstKeyframeKey, secondKeyframeKey, trackKey }:
  { firstKeyframeKey: string, secondKeyframeKey: string, trackKey: string }
) => {
  const firstKeyframe = useTimelineEditorAPI(state => state.keyframes[firstKeyframeKey])
  const secondKeyframe = useTimelineEditorAPI(state => state.keyframes[secondKeyframeKey])
  const selectedKeyframeKeys = useTimelineEditorAPI(state => state.selectedKeyframeKeys)
  const setSelectedKeyframeKeys = useTimelineEditorAPI(state => state.setSelectedKeyframeKeys)
  const selectedTrackSegment = useTimelineEditorAPI(state => state.selectedTrackSegment)
  const setSelectedTrackSegment = useTimelineEditorAPI(state => state.setSelectedTrackSegment)
  const keyframeLengthForTrack = useTimelineEditorAPI(state => state.tracks[trackKey].keyframes.length)
  const makePropertyStatic = useTimelineEditorAPI(state => state.makePropertyStatic)

  const isSelectedFromKeyframes = selectedKeyframeKeys.includes(firstKeyframe.id) && selectedKeyframeKeys.includes(secondKeyframe.id)
  const isSelectedFromTrackSegments = selectedTrackSegment?.firstKeyframeKey === firstKeyframeKey && selectedTrackSegment?.secondKeyframeKey === secondKeyframeKey

  const startX = parserTimeToPixel(firstKeyframe.time, startLeft);
  const endX = parserTimeToPixel(secondKeyframe.time, startLeft);

  const handleOnDrag = (data: { left: number, lastLeft: number }) => {
    const setKeyframeTime = useTimelineEditorAPI.getState().setKeyframeTime
    
    const newTime = parserPixelToTime(data.left, startLeft)
    const oldTime = parserPixelToTime(data.lastLeft, startLeft)
    const deltaTime = newTime - oldTime

    const oldFirstKeyframeTime = useTimelineEditorAPI.getState().keyframes[firstKeyframeKey].time;
    const oldSecondKeyframeTime = useTimelineEditorAPI.getState().keyframes[secondKeyframeKey].time;

    const newFirstKeyframeTime = oldFirstKeyframeTime + deltaTime
    const newSecondKeyframeTime = oldSecondKeyframeTime + deltaTime

    setKeyframeTime(firstKeyframeKey, parseFloat(newFirstKeyframeTime.toFixed(4)))
    setKeyframeTime(secondKeyframeKey, parseFloat(newSecondKeyframeTime.toFixed(4)))
  }

  const handleOnClick = () => {
    setSelectedKeyframeKeys([firstKeyframe.id, secondKeyframe.id])
    setSelectedTrackSegment(firstKeyframeKey, secondKeyframeKey, trackKey)
  }

  const BTN_MakePropertyStatic = () => {
    const [show, setShow] = useState(false);

    return (
      <AlertDialog open={show} onOpenChange={(open) => setShow(open)}>
        <AlertDialogTrigger>
          <ContextMenuItem
            onClick={(e) => {
              e.preventDefault();
              setShow(true);
            }}
          > 
            <p className=' text-red-600'>
              Make Track Static
            </p>
          </ContextMenuItem>
        </AlertDialogTrigger>
        <AlertDialogContent className='flex flex-row'>
          {/* <HazardStripes opacity={0.05}/> */}
          <div className='flex ml-2 h-auto mx-5 my-auto'>
            <svg className='animate-ping absolute fill-yellow-400' width="60" height="60" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8.4449 0.608765C8.0183 -0.107015 6.9817 -0.107015 6.55509 0.608766L0.161178 11.3368C-0.275824 12.07 0.252503 13 1.10608 13H13.8939C14.7475 13 15.2758 12.07 14.8388 11.3368L8.4449 0.608765ZM7.4141 1.12073C7.45288 1.05566 7.54712 1.05566 7.5859 1.12073L13.9798 11.8488C14.0196 11.9154 13.9715 12 13.8939 12H1.10608C1.02849 12 0.980454 11.9154 1.02018 11.8488L7.4141 1.12073ZM6.8269 4.48611C6.81221 4.10423 7.11783 3.78663 7.5 3.78663C7.88217 3.78663 8.18778 4.10423 8.1731 4.48612L8.01921 8.48701C8.00848 8.766 7.7792 8.98664 7.5 8.98664C7.2208 8.98664 6.99151 8.766 6.98078 8.48701L6.8269 4.48611ZM8.24989 10.476C8.24989 10.8902 7.9141 11.226 7.49989 11.226C7.08567 11.226 6.74989 10.8902 6.74989 10.476C6.74989 10.0618 7.08567 9.72599 7.49989 9.72599C7.9141 9.72599 8.24989 10.0618 8.24989 10.476Z" fill-rule="evenodd" clip-rule="evenodd"></path></svg>
            <svg className=' fill-yellow-400' width="60" height="60" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8.4449 0.608765C8.0183 -0.107015 6.9817 -0.107015 6.55509 0.608766L0.161178 11.3368C-0.275824 12.07 0.252503 13 1.10608 13H13.8939C14.7475 13 15.2758 12.07 14.8388 11.3368L8.4449 0.608765ZM7.4141 1.12073C7.45288 1.05566 7.54712 1.05566 7.5859 1.12073L13.9798 11.8488C14.0196 11.9154 13.9715 12 13.8939 12H1.10608C1.02849 12 0.980454 11.9154 1.02018 11.8488L7.4141 1.12073ZM6.8269 4.48611C6.81221 4.10423 7.11783 3.78663 7.5 3.78663C7.88217 3.78663 8.18778 4.10423 8.1731 4.48612L8.01921 8.48701C8.00848 8.766 7.7792 8.98664 7.5 8.98664C7.2208 8.98664 6.99151 8.766 6.98078 8.48701L6.8269 4.48611ZM8.24989 10.476C8.24989 10.8902 7.9141 11.226 7.49989 11.226C7.08567 11.226 6.74989 10.8902 6.74989 10.476C6.74989 10.0618 7.08567 9.72599 7.49989 9.72599C7.9141 9.72599 8.24989 10.0618 8.24989 10.476Z" fill-rule="evenodd" clip-rule="evenodd"></path></svg>
          </div>
          <div className='flex flex-col gap-4'>
            <AlertDialogHeader className='flex flex-col'>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                Track <span className='text-yellow-500'>{trackKey}</span> with <span className='text-yellow-500'>{keyframeLengthForTrack}</span> keyframes will be deleted!
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
              //@ts-expect-error
                type="warning"
                onClick={() => makePropertyStatic(trackKey)}
              >Continue</AlertDialogAction>
            </AlertDialogFooter>
          </div>
          {/* <HazardStripes opacity={0.05} /> */}
        </AlertDialogContent>
      </AlertDialog>
    )
  }

  return (
    <ContextMenu>
      <ContextMenuTrigger>
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
      </ContextMenuTrigger>
      <ContextMenuContent>
        <BTN_MakePropertyStatic />
      </ContextMenuContent>
    </ContextMenu>
  )
}

