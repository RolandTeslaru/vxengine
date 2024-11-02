import { useEffect, useRef } from 'react';
import { useVXEngine } from '@vxengine/engine';
import { EventTypes } from '../events';

function useAnimationEngineEvent(
  eventName,
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

    animationEngine.on(eventName, handler);

    return () => {
      animationEngine.off(eventName, handler);
    };
  }, [animationEngine, eventName]);
}
export default useAnimationEngineEvent