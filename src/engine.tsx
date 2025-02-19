// VXEngine - VEXR Labs' proprietary toolset for React Three Fiber
// (c) 2024 VEXR Labs. All Rights Reserved.
// See the LICENSE file in the root directory of this source tree for licensing information.

'use client'

import React, { createContext, useContext, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { EffectComposer } from 'three-stdlib'
import { VXEngineProviderProps } from './types/engine'
import { useSourceManagerAPI } from './managers/SourceManager/store'

import "./globals.css"

import { pushDialogStatic } from './managers/UIManager/store'
import { DANGER_ProjectNameUnSync } from './components/ui/DialogAlerts/Danger'
import animationEngineInstance from './singleton'
import { vxEngineWindowRefs } from './utils/useRefStore'

interface VXEngineContextProps {
  composer: React.MutableRefObject<EffectComposer | null>
  IS_PRODUCTION: boolean
  IS_DEVELOPMENT: boolean
}

const VXEngineContext = createContext<VXEngineContextProps>({
  composer: { current: null },
  IS_PRODUCTION: false,
  IS_DEVELOPMENT: false
})

export const VXEngineProvider: React.FC<VXEngineProviderProps> = React.memo((props) => {
  const { children, nodeEnv, projectName, animations_json } = props;

  const composer = useRef<EffectComposer | null>(null)
  const isProjectLoaded = useRef(false);
  const isProjectValidated = useRef(false);

  const IS_DEVELOPMENT = nodeEnv === "development"
  const IS_PRODUCTION = !IS_DEVELOPMENT

  useLayoutEffect(() => {
    if(!isProjectLoaded.current){
      animationEngineInstance?.loadProject(animations_json, nodeEnv as "production" | "development");
      isProjectLoaded.current = true;
    }
  }, [animations_json, nodeEnv])


  
  // Validate Props
  useLayoutEffect(() => {
    if(isProjectValidated.current) return;

    let id_alertProjectNameUnSync;

    if (projectName !== animations_json.projectName) {
      id_alertProjectNameUnSync = "id-unsyncProjectName"
      pushDialogStatic({
        content: <DANGER_ProjectNameUnSync diskJsonProjectName={animations_json.projectName} providerProjectName={projectName} />, 
        type: "danger",
        id: id_alertProjectNameUnSync,
      })
    }
    isProjectValidated.current = true;
  }, [props])


  
  useEffect(() => {
    if (IS_DEVELOPMENT){
      window.addEventListener('beforeunload', beforeUnloadMasterCallback)
    }

    return () => {
      if (IS_DEVELOPMENT)
        window.removeEventListener('beforeunload', beforeUnloadMasterCallback);
    }
  }, [])

  return (
    <VXEngineContext.Provider value={{
      composer,
      IS_PRODUCTION,
      IS_DEVELOPMENT
    }}>
      {children}
    </VXEngineContext.Provider>
  )
})

export const useVXEngine = () => useContext(VXEngineContext)

const beforeUnloadMasterCallback = (event: BeforeUnloadEvent) => {
  const sourceBeforeUnload = useSourceManagerAPI.getState().handleBeforeUnload
  sourceBeforeUnload(event);

  vxEngineWindowRefs.forEach((window, vxWindowId) => {
    window.close();
  })
}