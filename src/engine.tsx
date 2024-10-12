'use client'
import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { CssBaseline, GeistProvider } from '@geist-ui/core'
import { VXEngineCoreUI } from './core'
import { EffectComposer } from 'three-stdlib'
import { EngineContextProps, VXEngineProviderProps, VXEngineStoreProps } from './types/engine'
import { ThemeProvider as NextThemesProvider } from "next-themes"
import { type ThemeProviderProps } from "next-themes/dist/types"
import { AnimationEngine } from "@vxengine/AnimationEngine/engine"
import { useTimelineEditorAPI } from './managers/TimelineManager/store'
import { createStore, useStore, StoreApi } from 'zustand'
import useSourceManagerAPI from './managers/SourceManager/store'
import { useAnimationEngineAPI } from './AnimationEngine'
import { DataSyncPopup } from './managers/SourceManager/ui'
import ClientOnly from './components/ui/ClientOnly'

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}

let animationEngineInstance;
if (typeof window !== 'undefined')
  animationEngineInstance = new AnimationEngine();

const VXEngineContext = createContext<ReturnType<typeof createVXEngineStore> | null>(null);

let VXEngineStore: StoreApi<VXEngineStoreProps> | null = null;

// This flag ensures that the timelines are loaded only once.
// It prevents re-running the timeline loading logic during React Fast Refresh or re-renders.
let areTimelinesLoaded = false;

const createVXEngineStore = (props: VXEngineProviderProps) => {
  const { mount, animations_json } = props;

  // Set the disk file path for the timelines using the provided animations JSON
  const setDiskFilePath = useSourceManagerAPI.getState().setDiskFilePath;
  setDiskFilePath(animations_json);

  // Ensure that timelines are loaded only once.
  // Without this flag, React Fast Refresh or component re-renders could repeatedly trigger
  // the `loadTimelines` function, leading to an infinite loop and unnecessary reinitializations.
  if (!areTimelinesLoaded) {
    animationEngineInstance?.loadTimelines(animations_json);
    areTimelinesLoaded = true;  // Set the flag to true after the first load to prevent re-execution
  }

  // Create the VXEngine store, initializing the Zustand store once
  VXEngineStore = createStore<VXEngineStoreProps>((set) => ({
    mountEngineUI: mount ?? true,  // Set whether to mount the engine UI
    setMountEngineUI: (value) => set({ mountEngineUI: value }),  // Function to update mount state

    composer: useRef<EffectComposer | null>(null),  // Reference to the EffectComposer

    animationEngine: animationEngineInstance  // Attach the animation engine instance
  }));

  return VXEngineStore;
};

export const VXEngineProvider: React.FC<VXEngineProviderProps> = React.memo((props) => {
  const { children, } = props;

  // Initialize the store with the given props
  const store = useRef(createVXEngineStore(props)).current;
  const mountEngineUI = store.getState().mountEngineUI

  const showSyncPopup = useSourceManagerAPI(state => state.showSyncPopup)
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
      <ThemeProvider
        attribute="class"
        defaultTheme="dark"
        enableSystem
        disableTransitionOnChange
      >
        <ClientOnly>
          {mountEngineUI && (
            <VXEngineCoreUI />
          )}
          {showSyncPopup && (
            <DataSyncPopup />
          )}
        </ClientOnly>
      </ThemeProvider>
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
