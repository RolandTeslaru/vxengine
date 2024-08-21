import { useEffect } from 'react';
import { useVXEngine } from 'vxengine/engine';
import { EventTypes } from '../events';

function useAnimationEngineEvent(
  eventName: keyof EventTypes,
  callback: (eventData: any) => void,
  dependencies: any[] = []
) {
  const { animationEngine } = useVXEngine();
  useEffect(() => {
    // Register the event listener
    animationEngine.on(eventName, callback);

    // Cleanup the event listener when the component unmounts or dependencies change
    return () => {
      animationEngine.off(eventName, callback);
    };
  }, [animationEngine, eventName, ...dependencies]);
}

export default useAnimationEngineEvent