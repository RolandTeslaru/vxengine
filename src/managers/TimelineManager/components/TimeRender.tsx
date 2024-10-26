import { useAnimationEngineAPI } from "@vxengine/AnimationEngine";
import { useTimelineEditorAPI } from "../store";
import React, { useEffect, useRef } from "react";

const TimeRender = () => {
    const displayRef = useRef(null);
  
    useEffect(() => {
      if (displayRef.current) {
        displayRef.current.textContent = "00:00.00";
      }

      const unsubscribe = useTimelineEditorAPI.subscribe(
        ({cursorTime}, prevState) => {
          const float = (parseInt((cursorTime % 1) * 100 + '') + '').padStart(2, '0');
          const min = (parseInt(cursorTime / 60 + '') + '').padStart(2, '0');
          const second = (parseInt((cursorTime % 60) + '') + '').padStart(2, '0');
          if (displayRef.current) {
            displayRef.current.textContent = `${min}:${second}.${float.replace('0.', '')}`;
          }
        }
      );
  
      return unsubscribe;
    }, []);
  
    return <span ref={displayRef} />;
  };
export default TimeRender;