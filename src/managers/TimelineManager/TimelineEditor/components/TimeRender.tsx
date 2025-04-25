import { useAnimationEngineEvent } from "@vxengine/AnimationEngine";
import { Slider } from "@vxengine/components/shadcn/slider";
import animationEngineInstance from "@vxengine/singleton";
import { debounce } from "lodash";
import React, { useEffect, useRef, useState } from "react";
import { useTimelineEditorAPI } from "../store";

const parseTimeToTimeRenderString = (time: number): string => {
  const float = (parseInt((time % 1) * 100 + '') + '').padStart(2, '0');
  const min = (parseInt(time / 60 + '') + '').padStart(2, '0');
  const second = (parseInt((time % 60) + '') + '').padStart(2, '0');

  return `${min}:${second}.${float.replace('0.', '')}`;
}

const TimeRender = () => {
  const displayRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (displayRef.current) {
      const initialTime = animationEngineInstance.currentTime

      displayRef.current.textContent = parseTimeToTimeRenderString(initialTime)
    }
  }, [])

  useAnimationEngineEvent("timeUpdated", ({ time }) => {
    if (displayRef.current)
      displayRef.current.textContent = parseTimeToTimeRenderString(time)
  }, [])

  return <>
    <TimelineProgressSlider/>
    <p
      className="font-roboto-mono text-lg antialiased font-bold text-center h-auto my-auto mx-2 text-label-primary"
      ref={displayRef}
    />
  </> 
};
export default TimeRender;


const TimelineProgressSlider = () => {
  const timelineLength = animationEngineInstance.currentTimeline.length;
  const [currentTime, setCurrentTime] = useState(animationEngineInstance.currentTime);
  const setTime = useTimelineEditorAPI(state => state.setTime)

  // Create a debounced function for updating state from animation engine changes
  const debouncedSetTime = useRef(
    debounce((time) => {
      setCurrentTime(time);
    }, 5)
  ).current;

  // Cleanup the debounced function when component unmounts
  useEffect(() => {
    return () => {
      debouncedSetTime.cancel();
    };
  }, [debouncedSetTime]);

  // Listen to animation engine time updates
  useAnimationEngineEvent("timeUpdated", ({ time }) => {
    debouncedSetTime(time);
  }, [debouncedSetTime]);

  // Handler for slider changes
  const handleOnValueChange = (value: number[]) => {
    const newTime = value[0];
    setTime(newTime)
    setCurrentTime(newTime); // Update component state immediately
  };

  return (
      <Slider className='max-w-auto'
          max={timelineLength}
          min={0}
          step={0.1}
          value={[currentTime]}
          onValueChange={handleOnValueChange}
      />
  )
}