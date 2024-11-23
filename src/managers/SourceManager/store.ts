import { useAnimationEngineAPI } from '@vxengine/AnimationEngine'
import { create } from 'zustand'
import { SourceManagerAPIProps } from './types'
import { ITimeline } from '@vxengine/AnimationEngine/types/track'
import { deepEqual } from './utils'

import debounce from "lodash/debounce"
import { useTimelineEditorAPI } from '../TimelineManager'
import { AnimationEngine } from '@vxengine/AnimationEngine/engine'
import { cloneDeep } from 'lodash'

const DEBUG = true;

const PAUSED_DISK_SAVING = false;

export const useSourceManagerAPI = create<SourceManagerAPIProps>((set, get) => ({
  diskFilePath: "",
  setDiskFilePath: (path) => set({ diskFilePath: path }),

  autoSaveInterval: 10,
  setAutoSaveInterval: (interval: number) => set({ autoSaveInterval: interval }),

  showSyncPopup: false,
  setShowSyncPopup: (value: boolean) => set({ showSyncPopup: value }),

  saveDataToDisk: async () => {
    const showSyncPopup = get().showSyncPopup;

    if (showSyncPopup) return;

    if (PAUSED_DISK_SAVING) return;

    if (DEBUG) console.log("VXEngine SourceManager: Saving data to disk");

    const timelines = useAnimationEngineAPI.getState().timelines
    const data = cloneDeep(timelines);
    validateAndFixTimelines(data)
    try {
      const response = await fetch('/api/vxSaveTimelines', {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ timelines: data })
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
    const showSyncPopup = get().showSyncPopup;
    if (showSyncPopup) return;

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
  syncLocalStorage: (diskData: Record<string, ITimeline>) => {
    if (DEBUG)
      console.log("VXEngine SourceManager: Validating LocalStorage")

    validateAndFixTimelines(diskData);
    const savedTimelines = localStorage.getItem('timelines');


    if (!savedTimelines) {
      // Initialize local storage if there is no data
      console.log("VXEngine SourceManager: Initializing LocalStorage with disk data.");
      useAnimationEngineAPI.setState({ timelines: diskData })
      get().saveDataToLocalStorage();

      return { status: 'init' };
    } else {
      // Compare disk data with localstorage
      console.log("VXEngine SourceManager: Restoring timelines from LocalStorage");
      const localStorageData = JSON.parse(savedTimelines);
      validateAndFixTimelines(localStorageData);

      console.log("CHECK THIS SHIT ", diskData)

      const areTimelinesInSync = deepEqual(diskData, localStorageData);

      if (!areTimelinesInSync) {
        get().setShowSyncPopup(true)
        useAnimationEngineAPI.setState({ timelines: diskData });
        return { status: 'out_of_sync', localStorageData, diskData };
      }

      useAnimationEngineAPI.setState({ timelines: localStorageData });

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
        body: JSON.stringify({ timelines: data })
      })
      if (response.ok) {
        console.log('VXEngine SourceManager: Timelines overwritten successfully to disk.');
      } else {
        console.error('VXEngine SourceManager ERROR: Failed to overwrite timelines to disk.');
      }
    } catch (error) {
      console.error('VXEngine SourceManager ERROR: Unable to overwrite timelines to disk:', error);
    }

    // TODO: fix lazyness
    // Because its hard to redo all the initalizations of the timelines in the animaiton engine
    // its easier to just reload the page and have the animation engnine reintialize 
    window.location.reload();
  },

  handleBeforeUnload: (event: BeforeUnloadEvent) => {
    const changes = useTimelineEditorAPI.getState().changes
    const saveDataToDisk = get().saveDataToDisk;
    
    if (changes > 0) {
      if(DEBUG) console.log("SourceManager: handle before unload triggered with ", changes, "changes")
      
      saveDataToDisk();
      event.preventDefault();
      event.returnValue = '';
    }
  },

}))

const validateAndFixTimelines = (timelines: Record<string, ITimeline>) => {
  const precision = AnimationEngine.ENGINE_PRECISION;
  console.log("Valding timelines ", timelines, " with precision ", precision)
  const errors: string[] = [];

  const isValidPrecision = (value: number): boolean => {
    const factor = Math.pow(10, precision);
    return Math.round(value * factor) / factor === value;
  };

  Object.entries(timelines).forEach(([timelineId, timeline]) => {
    // Validate and fix timeline length precision
    if (!isValidPrecision(timeline.length)) {
      errors.push(`Timeline "${timelineId}" has invalid length precision: ${timeline.length}`);
      timeline.length = AnimationEngine.truncateToDecimals(timeline.length, precision);
    }

    // Validate and fix objects and their properties
    timeline.objects?.forEach((object) => {
      object.tracks.forEach(track => {
        track.keyframes.forEach(keyframe => {
          // console.trace("Keyframe object is frozen", keyframe);
          if (!isValidPrecision(keyframe.time)) {
            errors.push(`Keyframe time in "${object.vxkey}" has invalid precision: ${keyframe.time}`);
            keyframe.time = AnimationEngine.truncateToDecimals(keyframe.time, precision);
          }
          if (!isValidPrecision(keyframe.value)) {
            errors.push(`Keyframe value in "${object.vxkey}" has invalid precision: ${keyframe.value}`);
            keyframe.value = AnimationEngine.truncateToDecimals(keyframe.value, precision);
          }
        });
      });

      object.staticProps.forEach(staticProp => {
        if (!isValidPrecision(staticProp.value)) {
          errors.push(`Static prop "${staticProp.propertyPath}" in "${object.vxkey}" has invalid precision: ${staticProp.value}`);
          staticProp.value = AnimationEngine.truncateToDecimals(staticProp.value, precision);
        }
      });
    });

    // Validate and fix splines and nodes
    if (timeline.splines)
      Object.values(timeline.splines).forEach(spline => {
        spline.nodes.forEach((node, index) => {
          node.forEach((coord, coordIndex) => {
            if (!isValidPrecision(coord)) {
              errors.push(`Node ${index} in spline "${spline.splineKey}" has invalid precision for coordinate ${coordIndex}: ${coord}`);
              node[coordIndex] = AnimationEngine.truncateToDecimals(coord, precision);
            }
          });
        });
      });

  });

  return errors;
}