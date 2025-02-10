import { useEffect, useRef } from 'react';
import { EventTypes } from '../events';
import animationEngineInstance from '@vxengine/singleton';

export function useAnimationFrame(
  callback,
  dependencies = []
) {
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback, ...dependencies]);

  useEffect(() => {
    const handler = (...args) => callbackRef.current(...args);

    animationEngineInstance.on("timeUpdated", handler);

    return () => {
      animationEngineInstance.off("timeUpdated", handler);
    };
  }, []);
}
