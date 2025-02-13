import { useAnimationEngineAPI } from '@vxengine/AnimationEngine'
import { create } from 'zustand'
import { SourceManagerAPIProps } from './types'
import { deepEqual } from './utils'

import debounce from "lodash/debounce"
import { useTimelineManagerAPI } from '../TimelineManager'
import { AnimationEngine } from '@vxengine/AnimationEngine/engine'
import { pushDialogStatic, useUIManagerAPI } from '@vxengine/managers/UIManager/store';
import { DANGER_SyncConflict } from './dialogs/syncConflict'
import React from 'react'
import { logReportingService } from '@vxengine/AnimationEngine/services/LogReportingService'
import { RawProject } from '@vxengine/types/data/rawData'

const DEBUG = true;

let PAUSE_DISK_SAVING = false;
const LOG_MODULE = "SourceManagerAPI"

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
    const CONTEXT = { module: LOG_MODULE, functionName: "saveDataToDisk" }
    if (force === false)
      if (PAUSE_DISK_SAVING) return;

    if(DEBUG)
      logReportingService.logInfo(`Saving data to disk ${force && "with force"}`, CONTEXT)

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
        logReportingService.logInfo(`Project "${projectName}" saved successfully to disk.`, CONTEXT);
        if (reloadOnSuccess)
          window.location.reload();
      }
      else
        logReportingService.logError(`Failed to write to disk`, CONTEXT)

    } catch (error) {
      logReportingService.logError(
        `Unable to write project to disk`, {module:"SourceManagerAPI", functionName: "saveDataToDisk", additionalData: error})
    }
  },

  saveDataToLocalStorage: debounce(({ force = false } = {}) => {
    if (PAUSE_DISK_SAVING && force === false) return;

    if (DEBUG)
      logReportingService.logInfo("Saving data to localStorage", {module: LOG_MODULE});

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
    const CONTEXT = { module: LOG_MODULE, functionName: "initializeLocalStorage"}
    logReportingService.logInfo(`Initializing LocalStorage`, CONTEXT)

    const localStorageTemplate: Record<string, RawProject> = {}
    localStorageTemplate[diskData.projectName] = diskData;

    localStorage.setItem("VXEngineProjects", JSON.stringify(localStorageTemplate));

    useAnimationEngineAPI.setState({
      timelines: diskData.timelines,
      projectName: diskData.projectName
    })
  },

  initializeProjectInLocalStorage: (localStorageData, diskData) => {
    if (PAUSE_DISK_SAVING)
      return
    
    const CONTEXT = { module: "SourceManagerAPI", functionName: "initializeProjectInLocalStorage"}
    logReportingService.logInfo(`
      Initializing project:${diskData.projectName} in Local Storage`, CONTEXT)

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
   * @param {RawTimeline[]} timelines - The current timelines from the application state to be synced with localStorage.
   * @returns {object} An object indicating the status of the sync operation:
   *  - `init`: If localStorage was initialized with new timeline data.
   *  - `out_of_sync`: If the timelines in localStorage and the current state are not synchronized.
   *  - `in_sync`: If the timelines are synchronized.
   */
  syncLocalStorage: (diskData: RawProject) => {
    const CONTEXT = { module: "SourceManagerAPI", functionName: "syncLocalStorage"}
    if (DEBUG)
      logReportingService.logInfo(
        "Synchronizing localStorage with disk data", CONTEXT);

    // Check if Local Storage exists
    let localStorageString = null;
    try {
      localStorageString = localStorage.getItem("VXEngineProjects");
    } catch (error) {
      logReportingService.logError(
        "Synchronizing localStorage with disk data", CONTEXT);
    }    

    if (!localStorageString) {
      logReportingService.logInfo(
        "LocalStorage is not initialized. Initializing with diskData", CONTEXT);
      get().initializeLocalStorage(diskData)
      return { status: 'init' };
    }

    // Check if the project exists in local storage
    const localStorageData = JSON.parse(localStorageString) as LocalStorageDataType;
    if (!localStorageData[diskData.projectName]) {
      logReportingService.logInfo(
        `Project "${diskData.projectName}" doesn't exist in localStorage. Initializing project with diskData`, CONTEXT);
      get().initializeProjectInLocalStorage(localStorageData, diskData)
      return { status: 'init' };
    }
    else {
      if (DEBUG)
        logReportingService.logInfo(
          `Project ${diskData.projectName} was found in localStorage. Restoring...`, CONTEXT);

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
        if (DEBUG)
          logReportingService.logInfo(
            `Project ${diskData.projectName} has conflicting timelines. Awaiting resolve`, CONTEXT);

        const dialogId = "syncConflict"

        pushDialogStatic({
          content: <DANGER_SyncConflict dialogId={dialogId}/>,
          type: "danger",
          showTriangle: false,
          className: "p-0 !max-w-4xl",
          id: dialogId
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

    if(changes > 0){
      if(DEBUG)
        logReportingService.logInfo(
              `Handling unload with ${changes} changes`, {module: LOG_MODULE, functionName: "handleBeforeUnload"})

      saveDataToDisk();
      event.preventDefault();
      event.returnValue = '';
    }
  },

}))

export type LocalStorageDataType = Record<string, RawProject>