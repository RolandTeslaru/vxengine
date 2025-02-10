import { useAnimationEngineEvent } from "@vxengine/AnimationEngine";
import animationEngineInstance from "@vxengine/singleton";
import React, { useEffect, useLayoutEffect, useRef } from "react";

const parseTimeToTimeRenderString = (time: number): string => {
  const float = (parseInt((time % 1) * 100 + '') + '').padStart(2, '0');
  const min = (parseInt(time / 60 + '') + '').padStart(2, '0');
  const second = (parseInt((time % 60) + '') + '').padStart(2, '0');

  return `${min}:${second}.${float.replace('0.', '')}`;
}

const TimeRender = () => {
  const displayRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if(displayRef.current){
      const initialTime = animationEngineInstance.getCurrentTime();

      displayRef.current.textContent = parseTimeToTimeRenderString(initialTime)
    }
  }, [])

  useAnimationEngineEvent("timeUpdated", ({ time }) => {
    if (displayRef.current) 
      displayRef.current.textContent = parseTimeToTimeRenderString(time)
  }, [])

  return <p 
      className="font-sans-menlo text-lg text-center h-auto my-auto mx-2" 
      ref={displayRef}
      />
};
export default TimeRender;