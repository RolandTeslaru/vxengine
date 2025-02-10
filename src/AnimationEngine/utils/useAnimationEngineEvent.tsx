import { useEffect, useRef } from 'react';
import { EventTypes } from '../events';
import animationEngineInstance from '@vxengine/singleton';

export function useAnimationEngineEvent<K extends keyof EventTypes>(
  eventName: K,
  callback: (eventData: EventTypes[K]) => void,
  dependencies: any[] = []
) {
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback, ...dependencies]);

  useEffect(() => {
    const handler = (eventData: EventTypes[K]) => callbackRef.current(eventData);

    animationEngineInstance.on(eventName, handler);

    return () => {
      animationEngineInstance.off(eventName, handler);
    };
  }, [eventName]);
}
