// VXEngine - VEXR Labs' proprietary toolset for React Three Fiber
// (c) 2024 VEXR Labs. All Rights Reserved.
// See the LICENSE file in the root directory of this source tree for licensing information.

'use client'

import "./globals.css"

import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { VXEngineCoreUI } from './core'
import { EffectComposer } from 'three-stdlib'
import { VXEngineProviderProps, VXEngineStoreProps } from './types/engine'
import { ThemeProvider as NextThemesProvider } from "next-themes"
import { type ThemeProviderProps } from "next-themes/dist/types"
import { createStore, useStore, StoreApi } from 'zustand'
import { useSourceManagerAPI } from './managers/SourceManager/store'
import { DataSyncPopup } from './managers/SourceManager/ui'
import ClientOnly from './components/ui/ClientOnly'
import { AnimationEngine } from './AnimationEngine/engine'
import { MenubarUI } from './components/ui/MenubarUI'

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}

let animationEngineInstance;
if (typeof window !== 'undefined') {
  animationEngineInstance = new AnimationEngine();
}

const VXEngineContext = createContext<ReturnType<typeof createVXEngineStore> | null>(null);

let VXEngineStore: StoreApi<VXEngineStoreProps> | null = null;

// This flag ensures that the timelines are loaded only once.
// It prevents re-running the timeline loading logic during React Fast Refresh or re-renders.
let areTimelinesLoaded = false;

const createVXEngineStore = (props: VXEngineProviderProps) => {
  const { mount, animations_json } = props;

  const setDiskFilePath = useSourceManagerAPI.getState().setDiskFilePath;
  setDiskFilePath(animations_json);

  // Ensure that timelines are loaded only once.
  // Without this flag, React Fast Refresh or component re-renders could repeatedly trigger
  // the `loadTimelines` function, leading to an infinite loop and unnecessary reinitializations.
  if (!areTimelinesLoaded) {
    animationEngineInstance?.loadTimelines(animations_json);
    areTimelinesLoaded = true;  // Set the flag to true after the first load to prevent re-execution
  }

  VXEngineStore = createStore<VXEngineStoreProps>((set) => ({
    mountEngineUI: mount ?? true,  
    setMountEngineUI: (value) => set({ mountEngineUI: value }),  

    composer: useRef<EffectComposer | null>(null),  

    animationEngine: animationEngineInstance  
  }));

  return VXEngineStore;
};

export const VXEngineProvider: React.FC<VXEngineProviderProps> = React.memo((props) => {
  const { children, } = props;

  // Initialize the store with the given props
  const store = useRef(createVXEngineStore(props)).current;

  const addBeforeUnloadListener = useSourceManagerAPI(state => state.addBeforeUnloadListener)
  const removeBeforeUnloadListener = useSourceManagerAPI(state => state.removeBeforeUnloadListener)

  useEffect(() => {
    addBeforeUnloadListener()

    return () => {
      removeBeforeUnloadListener()
    }
  }, [])

  return (
    <VXEngineContext.Provider value={store}>
      <VXEngineContent>
        {children}
      </VXEngineContent>
    </VXEngineContext.Provider>
  );
});

const VXEngineContent = ({children}: {children: React.ReactNode}) => {
  const mountEngineUI = useVXEngine(state => state.mountEngineUI)
  const showSyncPopup = useSourceManagerAPI(state => state.showSyncPopup)
  return (
    <>
      <ClientOnly>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <MenubarUI/>
          {mountEngineUI && (
            <VXEngineCoreUI />
          )}
          {showSyncPopup && (
            <DataSyncPopup />
          )}
        </ThemeProvider>
      </ClientOnly>
      {children}
    </>
  )
}

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
