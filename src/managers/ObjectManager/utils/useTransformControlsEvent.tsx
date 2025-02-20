import { useRefStore } from '@vxengine/utils';
import { useEffect } from 'react';
import { Object3DEventMap } from 'three';

const useTransformControlsEvent = (
    eventName: string, // Allow custom events as well
    callback: () => void,
    dependencies: any[] = []
) => {
    useEffect(() => {
        // Register the event listener
        document.addEventListener(eventName as any, callback);

        // Clean up the event listener
        return () => {
            document.removeEventListener(eventName as any, callback);
        };
    }, [eventName, ...dependencies]);
};

export default useTransformControlsEvent;