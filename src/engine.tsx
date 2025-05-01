// VXEngine - VEXR Labs' proprietary toolset for React Three Fiber
// (c) 2024 VEXR Labs. All Rights Reserved.
// See the LICENSE file in the root directory of this source tree for licensing information.

'use client'

import React, { createContext, useContext, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { EffectComposer } from 'three-stdlib'
import { VXEngineProviderProps } from './types/engine'
import { useSourceManagerAPI } from './managers/SourceManager/store'

import "./globals.css"

import animationEngineInstance from './singleton'
import { vxEngineWindowRefs } from './utils/useRefStore'
import { AnimationEngine } from './AnimationEngine/engine'
import { vxengine } from './singleton'
import { WebGLRenderer } from 'three'

interface VXEngineContextProps {
  composer: React.RefObject<EffectComposer | null>
  gl: React.RefObject<WebGLRenderer | null>
  animationEngine: AnimationEngine
}

const VXEngineContext = createContext<VXEngineContextProps>({
  composer: { current: null },
  gl: { current: null },
  animationEngine: null,
})

export const VXEngineProvider: React.FC<VXEngineProviderProps> = React.memo((props) => {
  const { children, nodeEnv,} = props;

  const composer = useRef<EffectComposer | null>(null)
  const gl = useRef(null)

  useEffect(() => {
    if (vxengine.isDevelopment){
      window.addEventListener('beforeunload', beforeUnloadMasterCallback)
    }

    return () => {
      if (vxengine.isDevelopment)
        window.removeEventListener('beforeunload', beforeUnloadMasterCallback);
    }
  }, [])

  return (
    <VXEngineContext.Provider value={{
      composer,
      gl,
      animationEngine: animationEngineInstance,
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