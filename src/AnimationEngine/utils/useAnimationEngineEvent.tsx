import { useEffect, useRef } from 'react';
import { useVXEngine } from '@vxengine/engine';
import { EventTypes } from '../events';

export function useAnimationEngineEvent<K extends keyof EventTypes>(
  eventName: K,
  callback: (eventData: EventTypes[K]) => void,
  dependencies: any[] = []
) {
  const animationEngine = useVXEngine(state => state.animationEngine);
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback, ...dependencies]);

  useEffect(() => {
    const handler = (eventData: EventTypes[K]) => callbackRef.current(eventData);

    animationEngine.on(eventName, handler);

    return () => {
      animationEngine.off(eventName, handler);
    };
  }, [animationEngine, eventName]);
}
