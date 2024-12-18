import { useEffect, useRef } from 'react';
import { useVXEngine } from '@vxengine/engine';
import { EventTypes } from '../events';

export function useAnimationFrame(
  callback,
  dependencies = []
) {
  const animationEngine = useVXEngine(state => state.animationEngine);
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback, ...dependencies]);

  useEffect(() => {
    const handler = (...args) => callbackRef.current(...args);

    animationEngine.on("timeUpdated", handler);

    return () => {
      animationEngine.off("timeUpdated", handler);
    };
  }, [animationEngine]);
}
