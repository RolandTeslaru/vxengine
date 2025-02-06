import { useAnimationEngineAPI } from '@vxengine/AnimationEngine'
import { create } from 'zustand'
import { SourceManagerAPIProps } from './types'
import { ITimeline } from '@vxengine/AnimationEngine/types/track'
import { deepEqual } from './utils'

import debounce from "lodash/debounce"
import { useTimelineManagerAPI } from '../TimelineManager'
import { AnimationEngine } from '@vxengine/AnimationEngine/engine'
import { DiskProjectProps } from '@vxengine/types/engine'
import { pushDialogStatic, useUIManagerAPI } from '@vxengine/managers/UIManager/store';
import { DANGER_SyncConflict } from './dialogs/syncConflict'
import React from 'react'

const DEBUG = false;

let PAUSE_DISK_SAVING = false;

export const useSourceManagerAPI = create<SourceManagerAPIProps>((set, get) => ({
  autoSaveInterval: 10,
  setAutoSaveInterval: (interval: number) => set({ autoSaveInterval: interval }),

  getLocalStorageProject: (projectName: string) => {
    const lsString = localStorage.getItem("VXEngineProjects")
    if (!lsString) return null;

    const ls = JSON.parse(lsString) as LocalStorageDataType
    const project = ls[projectName]
    if (project)
      return project
    else
      return null
  },

  saveDataToDisk: async ({ force = false, reloadOnSuccess = false } = {}) => {
    if (force === false) {
      if (PAUSE_DISK_SAVING) return;
    }

    if (DEBUG) console.log(`VXEngine SourceManager: Saving data to disk ${force && "with force"}`);

    const projectName = useAnimationEngineAPI.getState().projectName;

    const project = get().getLocalStorageProject(projectName);
    if (!project)
      return

    const timelines = project.timelines

    try {
      const response = await fetch('/api/vxSaveTimelines', {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ project: { projectName, timelines } })
      })
      if (response.ok) {
        console.log(`VXEngine SourceManager: Project "${projectName}" saved successfully to disk.`);
        if (reloadOnSuccess)
          window.location.reload();
      }
      else
        console.error('VXEngine SourceManager ERROR: Failed to save timelines to disk.');

    } catch (error) {
      console.error('VXEngine SourceManager ERROR: Unable to write timelines to disk:', error);
    }
  },

  saveDataToLocalStorage: debounce(({ force = false } = {}) => {
    if (PAUSE_DISK_SAVING && force === false) return;

    if (DEBUG) console.log("VXEngine SourceManager: Saving Data To LocalStorage")

    const state = useAnimationEngineAPI.getState()
    const timelines = state.timelines
    const projectName = state.projectName;

    const localStorageData = JSON.parse(localStorage.getItem("VXEngineProjects")) as LocalStorageDataType
    if (!localStorageData[projectName]) {
      localStorageData[projectName] = {
        projectName,
        timelines
      }
    } else {
      localStorageData[projectName].timelines = timelines;
    }

    localStorage.setItem("VXEngineProjects", JSON.stringify(localStorageData));
  }, 500),


  initializeLocalStorage: (diskData) => {
    console.log("VXEngine SourceManager: Initializing Local Storage")
    const localStorageTemplate: Record<string, DiskProjectProps> = {}
    localStorageTemplate[diskData.projectName] = diskData;

    localStorage.setItem("VXEngineProjects", JSON.stringify(localStorageTemplate));

    useAnimationEngineAPI.setState({
      timelines: diskData.timelines,
      projectName: diskData.projectName
    })
  },

  initializeProjectInLocalStorage: (localStorageData, diskData) => {
    if(PAUSE_DISK_SAVING)
      return

    console.log(`VXEngine SourceManager: Initializing project:${diskData.projectName} in Local Storage`)
    localStorageData[diskData.projectName] = diskData;

    useAnimationEngineAPI.setState({
      timelines: diskData.timelines,
      projectName: diskData.projectName
    })
  },

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
  syncLocalStorage: (diskData: DiskProjectProps) => {
    if (DEBUG) console.log("VXEngine SourceManager: Validating LocalStorage")
    // Check if Local Storage exists
    const localStorageString = localStorage.getItem("VXEngineProjects");
    if (!localStorageString) {
      get().initializeLocalStorage(diskData)
      return { status: 'init' };
    }

    // Check if the project exists in local storage
    const localStorageData = JSON.parse(localStorageString) as LocalStorageDataType;
    if (!localStorageData[diskData.projectName]) {
      get().initializeProjectInLocalStorage(localStorageData, diskData)
      return { status: 'init' };
    }
    else {
      if (DEBUG) console.log(`VXEngine SourceManager: Restoring project "${diskData.projectName}" from local storage`);

      const localStorageProject = localStorageData[diskData.projectName]
      const diskTimelines = diskData.timelines;
      const localStorageTimelines = localStorageProject.timelines;
      const areTimelinesInSync = deepEqual(diskData.timelines, localStorageTimelines)

      if (areTimelinesInSync) {
        useAnimationEngineAPI.setState({
          timelines: localStorageProject.timelines,
          projectName: localStorageProject.projectName
        })
        return { status: 'in_sync' };
      }
      else {
        if (DEBUG) console.log(`VXEngine SourceManager: Timelines from project "${diskData.projectName}" are out of sync. Awaiting resolve...`)

        const dialogId = "syncConflict"

        pushDialogStatic({
          content: <DANGER_SyncConflict dialogId={dialogId}/>,
          type: "danger",
          showTriangle: false,
          className: "p-0"
        })


        // Provisionary load the timelines from disk. 
        useAnimationEngineAPI.setState({
          timelines: diskData.timelines,
          projectName: diskData.projectName
        })
        return { status: 'out_of_sync', localStorageTimelines, diskTimelines };
      }
    }
  },


  handleBeforeUnload: (event: BeforeUnloadEvent) => {
    const changes = useTimelineManagerAPI.getState().changes
    const saveDataToDisk = get().saveDataToDisk;

    if (changes > 0) {
      if (DEBUG) console.log("VXEngine SourceManager: handle before unload triggered with ", changes, "changes")

      saveDataToDisk();
      event.preventDefault();
      event.returnValue = '';
    }
  },

}))

const validateAndFixTimelines = (timelines: Record<string, ITimeline>) => {
  const precision = AnimationEngine.ENGINE_PRECISION;
  console.log("Validating timelines ", timelines, " with precision ", precision)
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
        track.keyframes.forEach((keyframe) => {
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


export type LocalStorageDataType = Record<string, DiskProjectProps>