import { useEffect, useRef } from 'react';
import { animationEngineInstance } from '@vxengine/engine';
import { EventTypes } from '../events';

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
