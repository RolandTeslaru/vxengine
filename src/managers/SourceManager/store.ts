import { useAnimationEngineAPI } from '@vxengine/AnimationEngine'
import { create } from 'zustand'
import { SourceManagerAPIProps } from './types'
import { ITimeline } from '@vxengine/AnimationEngine/types/track'
import { deepEqual } from './utils'

import debounce from "lodash/debounce"

const DEBUG = true;

export const useSourceManagerAPI = create<SourceManagerAPIProps>((set, get) => ({
    diskFilePath: "",
    setDiskFilePath: (path) => set({ diskFilePath: path }),

    autoSaveInterval: 10,
    setAutoSaveInterval: (interval: number) => set({ autoSaveInterval: interval }),

    showSyncPopup: false,
    setShowSyncPopup: (value: boolean) => set({ showSyncPopup: value }),

    saveDataToDisk: async () => {
        if (DEBUG) console.log("VXEngine SourceManager: Saving data to disk");

        const timelines = useAnimationEngineAPI.getState().timelines
        try {
            const response = await fetch('/api/vxSaveTimelines', {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ timelines })
            })
            if (response.ok) 
                console.log('VXEngine SourceManager: Timelines saved successfully to disk.');
            else
                console.error('VXEngine SourceManager ERROR: Failed to save timelines to disk.');
            
        } catch (error) {
            console.error('VXEngine SourceManager ERROR: Unable to write timelines to disk:', error);
        }
    },
    saveDataToLocalStorage: debounce(() => {
        if (DEBUG) console.log("VXEngine SourceManager: Saving Data To LocalStorage")

        const timelines = useAnimationEngineAPI.getState().timelines
        localStorage.setItem('timelines', JSON.stringify(timelines));
    }, 500),



    /**
     * Synchronizes the current timelines in the application state with localStorage.
     * 
     * The function performs the following steps:
     * 1. Checks if `timelines` data already exists in `localStorage`.
     * 2. If no data exists in localStorage, it initializes localStorage with the current timelines from the application state.
     * 3. If data does exist, it compares the timelines from localStorage with the current timelines in the state using `deepEqual`.
     *    - If they are out of sync, a sync popup is triggered, and localStorage is updated.
     *    - If they are in sync, the timelines from localStorage are used to restore the state.
     * 
     * This function is debounced to avoid frequent execution (e.g., during drag events), ensuring that it is called only after a specified delay (500ms) of inactivity.
     * 
     * @param {ITimeline[]} timelines - The current timelines from the application state to be synced with localStorage.
     * @returns {object} An object indicating the status of the sync operation:
     *  - `init`: If localStorage was initialized with new timeline data.
     *  - `out_of_sync`: If the timelines in localStorage and the current state are not synchronized.
     *  - `in_sync`: If the timelines are synchronized.
     */
    syncLocalStorage: (timelines: Record<string, ITimeline>) => {
        if (DEBUG) console.log("VXEngine SourceManager: Validating LocalStorage")
        const savedTimelines = localStorage.getItem('timelines');

        if (!savedTimelines) {
            // If no data in localStorage, initialize it with current timelines
            console.log("VXEngine SourceManager: Initializing LocalStorage with timeline data.");
            useAnimationEngineAPI.setState({ timelines: timelines })
            get().saveDataToLocalStorage();

            return { status: 'init' };
        } else {
            console.log("VXEngine SourceManager: Restoring timelines from LocalStorage");
            const restoredTimelines = JSON.parse(savedTimelines);

            const areTimelinesInSync = deepEqual(timelines, restoredTimelines);

            if (!areTimelinesInSync) {
                get().setShowSyncPopup(true)
                useAnimationEngineAPI.setState({ timelines: timelines });
                return { status: 'out_of_sync', restoredTimelines, timelines };
            }

            useAnimationEngineAPI.setState({ timelines: restoredTimelines });

            return { status: 'in_sync' };
        }
    },

    overwriteLocalStorageData: (data: Record<string, ITimeline>) => {
        localStorage.setItem('timelines', JSON.stringify(data))
    },

    overwriteDiskData: async (data: Record<string, ITimeline>) => {
        if (DEBUG)
            console.log("VXEngine SourceManager: Overwriting disk data: ", data)
        try {
            const response = await fetch('/api/vxSaveTimelines', {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ data })
            })
            if (response.ok) {
                console.log('VXEngine SourceManager: Timelines overwritten successfully to disk.');
            } else {
                console.error('VXEngine SourceManager ERROR: Failed to overwrite timelines to disk.');
            }
        } catch (error) {
            console.error('VXEngine SourceManager ERROR: Unable to overwrite timelines to disk:', error);
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