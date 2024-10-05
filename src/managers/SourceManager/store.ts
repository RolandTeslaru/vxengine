import { useVXAnimationStore } from '@vxengine/AnimationEngine'
import { getVXEngineState, useVXEngine } from '@vxengine/engine'
import React from 'react'
import { create } from 'zustand'
import { SourceManagerAPIProps } from './types'
import { ITimeline } from '@vxengine/AnimationEngine/types/track'
import { deepEqual } from './utils'

const DEBUG = true;

const useSourceManagerAPI = create<SourceManagerAPIProps>((set, get) => ({
    diskFilePath: "",
    setDiskFilePath: (path) => set({ diskFilePath: path }),

    autoSaveInterval: 10,
    setAutoSaveInterval: (interval: number) => set({ autoSaveInterval: interval }),

    showSyncPopup: false,
    setShowSyncPopup: (value: boolean) => set({ showSyncPopup: value }),

    saveDataToDisk: async () => {
        const timelines = useVXAnimationStore.getState().timelines

        try {
            const response = await fetch('/api/vxSaveTimelines', {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ timelines })
            })
            if (response.ok) {
                console.log('Timelines saved successfully to the server.');
            } else {
                console.error('Failed to save timelines to the server.');
            }
        } catch (error) {
            console.error('Error saving timelines to the server:', error);
        }
    },
    saveDataToLocalStorage: () => {
        const timelines = useVXAnimationStore.getState().timelines

        localStorage.setItem('timelines', JSON.stringify(timelines));
    },

    syncLocalStorage: (timelines: ITimeline[]) => {
        // Check if localStorage already has saved data
        const savedTimelines = localStorage.getItem('timelines');

        if (!savedTimelines) {
            // If no data in localStorage, initialize it with current timelines
            console.log("Initializing localStorage with timeline data.");
            useVXAnimationStore.setState({ timelines: timelines })
            get().saveDataToLocalStorage();

            return { status: 'init' };
        } else {
            const restoredTimelines = JSON.parse(savedTimelines);

            const areTimelinesInSync = deepEqual(timelines, restoredTimelines);
            console.log("Restoring timelines from localStorage", restoredTimelines);

            if (!areTimelinesInSync) {
                get().setShowSyncPopup(true)
                useVXAnimationStore.setState({ timelines: timelines });
                return { status: 'out_of_sync', restoredTimelines, timelines };
            }

            useVXAnimationStore.setState({ timelines: restoredTimelines });

            return { status: 'in_sync' };
        }
    },

    overwriteLocalStorageData: (data: ITimeline[]) => {
        localStorage.setItem('timelines', JSON.stringify(data))
    },

    overwriteDiskData: async (data: ITimeline[]) => {
        if(DEBUG)
            console.log("VXEngine SourceManager: Overwriting Disk Data: ", data)
        try {
            const response = await fetch('/api/vxSaveTimelines', {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ data })
            })
            if (response.ok) {
                console.log('Timelines saved successfully to the server.');
            } else {
                console.error('Failed to save timelines to the server.');
            }
        } catch (error) {
            console.error('Error saving timelines to the server:', error);
        }
    },

    addBeforeUnloadListener: () => {
        const handleBeforeUnload = (event) => {
            get().saveDataToDisk();  // Call saveDataToDisk before closing
            event.preventDefault();
            event.returnValue = ''; // Necessary to trigger the dialog in some browsers
        };

        window.addEventListener('beforeunload', handleBeforeUnload);

        // Cleanup when the component or context is no longer needed
        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    },

    handleBeforeUnload: (event: BeforeUnloadEvent) => {
        const saveDataToDisk = get().saveDataToDisk;

        saveDataToDisk();
        event.preventDefault();
        event.returnValue = '';
    },

    // Remove the event listener for beforeunload
    removeBeforeUnloadListener: () => {
        window.removeEventListener('beforeunload', get().handleBeforeUnload);
    },
}))

export default useSourceManagerAPI