// VXEngine - VEXR Labs' proprietary toolset for React Three Fiber
// (c) 2024 VEXR Labs. All Rights Reserved.
// See the LICENSE file in the root directory of this source tree for licensing information.

'use client'

import React, { createContext, useContext, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { EffectComposer } from 'three-stdlib'
import { VXEngineProviderProps, VXEngineStoreProps } from './types/engine'
import { createStore, useStore, StoreApi } from 'zustand'
import { useSourceManagerAPI } from './managers/SourceManager/store'
import { AnimationEngine } from './AnimationEngine/engine'
import { setNodeEnv, getNodeEnv } from "./constants"
import { ITimeline } from './AnimationEngine/types/track'

import "./globals.css"

import { closeDialogStatic, pushDialogStatic } from './managers/UIManager/store'
import { AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from './components/shadcn/alertDialog'
let animationEngineInstance: AnimationEngine | undefined

const VXEngineContext = createContext<ReturnType<typeof createVXEngineStore> | null>(null);
let VXEngineStore: StoreApi<VXEngineStoreProps> | null = null;

// This flag ensures that the timelines are loaded only once.
// It prevents re-running the timeline loading logic during React Fast Refresh or re-renders.
let areTimelinesLoaded = false;


const createVXEngineStore = (props: VXEngineProviderProps) => {
  const {
    mount,
    projectName,
    animations_json,
    nodeEnv,
    autoWriteToDisk
  } = props;

  if (!nodeEnv)
    throw new Error("VXEngine: Missing required property 'nodeEnv'. Please provide the 'process.env.NODE_ENV'");
  else if (nodeEnv !== 'development' && nodeEnv !== 'production' && nodeEnv !== 'test')
    throw new TypeError(`Invalid value for 'nodeEnv': ${nodeEnv}. Expected 'development', 'production', or 'test'.`);

  if (typeof window !== 'undefined' && !animationEngineInstance)
    animationEngineInstance = new AnimationEngine(nodeEnv);

  // // Ensure that timelines are loaded only once.
  // // Without this flag, React Fast Refresh or component re-renders could repeatedly trigger
  // // the `loadTimelines` function, leading to an infinite loop and unnecessary reinitializations.
  if (!areTimelinesLoaded) {
    animationEngineInstance?.loadProject(animations_json);
    areTimelinesLoaded = true;
  }

  VXEngineStore = createStore<VXEngineStoreProps>((set) => ({
    mountCoreRenderer: mount ?? true,
    setMountCoreRenderer: (value) => set({ mountCoreRenderer: value }),

    composer: useRef<EffectComposer | null>(null),
    animationEngine: animationEngineInstance,

    IS_DEVELOPMENT: nodeEnv === "development",
    IS_PRODUCTION: nodeEnv === "production",
  }));

  return VXEngineStore;
};


let propsValidated = false;

export const VXEngineProvider: React.FC<VXEngineProviderProps> = React.memo((props) => {
  const { children, nodeEnv, projectName, animations_json } = props;

  setNodeEnv(nodeEnv);
  const IS_DEVELOPMENT = nodeEnv === "development"

  // Validate Props
  useLayoutEffect(() => {
    if(propsValidated) return;

    let id_alertProjectNameUnSync;

    if (projectName !== animations_json.projectName) {
      id_alertProjectNameUnSync = "id-unsyncProjectName"
      pushDialogStatic(<DANGER_ProjectNameUnSync diskJsonProjectName={animations_json.projectName} providerProjectName={projectName} />, "danger", "", id_alertProjectNameUnSync)
    }
    propsValidated = true;
  }, [props])

  useEffect(() => {
    const handleBeforeUnload = useSourceManagerAPI.getState().handleBeforeUnload

    if (IS_DEVELOPMENT)
      window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      if (IS_DEVELOPMENT)
        window.removeEventListener('beforeunload', handleBeforeUnload);
    }
  }, [])

  const store = useRef(createVXEngineStore(props)).current;

  return (
    <VXEngineContext.Provider value={store}>
      {children}
    </VXEngineContext.Provider>
  );
});


export function useVXEngine<T>(selector: (state: VXEngineStoreProps) => T) {
  const store = useContext(VXEngineContext);
  if (!store) throw new Error("VXEngineProvider FATAL: Missing VXEngineContext.Provider in the tree!")
  return useStore(store, selector)
};

export const getVXEngineState = () => {
  if (!VXEngineStore) {
    throw new Error("VXEngineStore is not initialized. Make sure to initialize it inside VXEngineProvider.");
  }
  return VXEngineStore
}

const DANGER_ProjectNameUnSync = ({ diskJsonProjectName, providerProjectName }: any) => {
  return (
    <div className='flex flex-col gap-4'>
      <AlertDialogHeader className='flex flex-col'>
        <AlertDialogTitle>Project Name Sync Conflict</AlertDialogTitle>
        <AlertDialogDescription>
          <div className='gap-2 flex flex-col'>
            <p>
              Project Name from Disk Json is not the same as the one from config provider!
            </p>
            <div className='flex flex-col gap-2'>
              <p>Disk Json projectName = <span className='text-red-600'>{`${diskJsonProjectName}`}</span></p>
              <p>Provider projectName = <span className='text-red-600'>{`${providerProjectName}`}</span></p>
            </div>
          </div>
        </AlertDialogDescription>
      </AlertDialogHeader>
    </div>
  )
}

let hasBeenValidated = false;

const validateProps = (props: VXEngineProviderProps): boolean => {
  let isReady = true;
  if (hasBeenValidated) return isReady;

  const { projectName, animations_json } = props

  if (projectName !== animations_json.projectName) {
    pushDialogStatic(<DANGER_ProjectNameUnSync diskJsonProjectName={animations_json.projectName} providerProjectName={projectName} />, "danger", "")
    isReady = false
  }

  console.log("Validation Result ", isReady)

  hasBeenValidated = true;
  return isReady
}