// VXEngine - VEXR Labs' proprietary toolset for React Three Fiber
// (c) 2024 VEXR Labs. All Rights Reserved.
// See the LICENSE file in the root directory of this source tree for licensing information.

'use client'

import "./globals.css"

import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { EffectComposer } from 'three-stdlib'
import { VXEngineProviderProps, VXEngineStoreProps } from './types/engine'
import { createStore, useStore, StoreApi } from 'zustand'
import { useSourceManagerAPI } from './managers/SourceManager/store'
import { AnimationEngine } from './AnimationEngine/engine'
import { setNodeEnv, getNodeEnv } from "./constants"

let animationEngineInstance: AnimationEngine | undefined

const VXEngineContext = createContext<ReturnType<typeof createVXEngineStore> | null>(null);

let VXEngineStore: StoreApi<VXEngineStoreProps> | null = null;

// This flag ensures that the timelines are loaded only once.
// It prevents re-running the timeline loading logic during React Fast Refresh or re-renders.
let areTimelinesLoaded = false;



const createVXEngineStore = (props: VXEngineProviderProps) => {
  const {
    mount,
    animations_json: diskUrl,
    nodeEnv
  } = props;

  if (!nodeEnv) {
    throw new Error("VXEngine: Missing required property 'nodeEnv'. Please provide the 'process.env.NODE_ENV'");
  } else if (nodeEnv !== 'development' && nodeEnv !== 'production' && nodeEnv !== 'test') {
    throw new TypeError(`Invalid value for 'nodeEnv': ${nodeEnv}. Expected 'development', 'production', or 'test'.`);
  }

  if (typeof window !== 'undefined' && !animationEngineInstance) {
    animationEngineInstance = new AnimationEngine(nodeEnv);
  }

  const setDiskFilePath = useSourceManagerAPI.getState().setDiskFilePath;
  setDiskFilePath(diskUrl);

  // Ensure that timelines are loaded only once.
  // Without this flag, React Fast Refresh or component re-renders could repeatedly trigger
  // the `loadTimelines` function, leading to an infinite loop and unnecessary reinitializations.
  if (!areTimelinesLoaded) {
    animationEngineInstance?.loadTimelines(diskUrl);
    areTimelinesLoaded = true;  // Set the flag to true after the first load to prevent re-execution
  }

  VXEngineStore = createStore<VXEngineStoreProps>((set) => ({
    mountCoreRenderer: mount ?? true,
    setMountCoreRenderer: (value) => set({ mountCoreRenderer: value }),

    composer: useRef<EffectComposer | null>(null),
    animationEngine: animationEngineInstance,

    IS_DEVELOPMENT: nodeEnv === "development",
    IS_PRODUCTION: nodeEnv === "production"
  }));

  return VXEngineStore;
};


let VXEngineCoreUI: React.FC | null = null;

export const VXEngineProvider: React.FC<VXEngineProviderProps> = React.memo((props) => {
  const { children, nodeEnv } = props;

  setNodeEnv(nodeEnv);
  const IS_DEVELOPMENT = nodeEnv === "development"

  if(IS_DEVELOPMENT && !VXEngineCoreUI)
    VXEngineCoreUI = require('./core').VXEngineCoreUI;

  // Initialize the store with the given props
  const store = useRef(createVXEngineStore(props)).current;
  
  useEffect(() => {
    const handleBeforeUnload = useSourceManagerAPI.getState().handleBeforeUnload

    if (IS_DEVELOPMENT){
      window.addEventListener('beforeunload', handleBeforeUnload)
    }

    return () => {
      if (IS_DEVELOPMENT)
        window.removeEventListener('beforeunload', handleBeforeUnload);
    }
  }, [])

  return (
    <VXEngineContext.Provider value={store}>
      {IS_DEVELOPMENT && VXEngineCoreUI && <VXEngineCoreUI />}
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
