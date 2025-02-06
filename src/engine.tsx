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
import { ITimeline } from './AnimationEngine/types/track'

import "./globals.css"

import { closeDialogStatic, pushDialogStatic } from './managers/UIManager/store'
import { AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from './components/shadcn/alertDialog'
import { DANGER_ProjectNameUnSync } from './components/ui/DialogAlerts/Danger'

interface VXEngineContextProps {
  composer: React.MutableRefObject<EffectComposer | null>
}

const VXEngineContext = createContext<VXEngineContextProps>({
  composer: { current: null }
})

// This flag ensures that the timelines are loaded only once.
// It prevents re-running the timeline loading logic during React Fast Refresh or re-renders.
let areTimelinesLoaded = false;
export const animationEngineInstance = new AnimationEngine();

let propsValidated = false;
export let IS_PRODUCTION = false;
export let IS_DEVELOPMENT = false;

export const VXEngineProvider: React.FC<VXEngineProviderProps> = React.memo((props) => {
  const { children, nodeEnv, projectName, animations_json } = props;

  const composer = useRef<EffectComposer | null>(null)

  IS_DEVELOPMENT = nodeEnv === "development"
  IS_PRODUCTION = !IS_DEVELOPMENT

  // Validate Props
  useLayoutEffect(() => {
    if(propsValidated) return;

    let id_alertProjectNameUnSync;

    if (projectName !== animations_json.projectName) {
      id_alertProjectNameUnSync = "id-unsyncProjectName"
      pushDialogStatic({
        content: <DANGER_ProjectNameUnSync diskJsonProjectName={animations_json.projectName} providerProjectName={projectName} />, 
        type: "danger",
        id: id_alertProjectNameUnSync,
      })
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

  if (!areTimelinesLoaded) {
    animationEngineInstance?.loadProject(animations_json, nodeEnv as "production" | "development");
    areTimelinesLoaded = true;
  }

  return (
    <VXEngineContext.Provider value={{
      composer
    }}>
      {children}
    </VXEngineContext.Provider>
  )
})

export const useVXEngine = () => useContext(VXEngineContext)




let hasBeenValidated = false;

const validateProps = (props: VXEngineProviderProps): boolean => {
  let isReady = true;
  if (hasBeenValidated) return isReady;

  const { projectName, animations_json } = props

  if (projectName !== animations_json.projectName) {
    pushDialogStatic({
      content: <DANGER_ProjectNameUnSync diskJsonProjectName={animations_json.projectName} providerProjectName={projectName} />, 
      type: "danger"
    })
    isReady = false
  }

  hasBeenValidated = true;
  return isReady
}