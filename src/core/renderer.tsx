// VXEngine - VEXR Labs' proprietary toolset for React Three Fiber
// (c) 2024 VEXR Labs. All Rights Reserved.
// See the LICENSE file in the root directory of this source tree for licensing information.

"use client"
import React, { Suspense, useContext, useEffect, useState } from 'react'
import { Canvas, extend } from '@react-three/fiber'
import { CameraControls, Grid, PerformanceMonitor } from '@react-three/drei'
import { round } from 'lodash'
import { Bloom } from '@react-three/postprocessing'
import { Perf } from 'r3f-perf'
import { EffectsManagerDriver as VXEffectsManagerDriver } from '../managers/EffectsManager'
import { ObjectManagerDriver as VXObjectManagerDriver } from '../managers/ObjectManager'
import { RendererCoreProps } from '../types/core'
import dynamic from 'next/dynamic'
import { useVXEngine } from 'vxengine/engine'
import vx, { useVXObjectStore } from 'vxengine/store'
import { context as FiberContext } from '@react-three/fiber';
import { MeshLineGeometry, MeshLineMaterial, raycast } from 'meshline'

extend({ MeshLineGeometry, MeshLineMaterial })

import { Object3DNode, MaterialNode } from '@react-three/fiber'

declare module '@react-three/fiber' {
  interface ThreeElements {
    meshLineGeometry: Object3DNode<MeshLineGeometry, typeof MeshLineGeometry>
    meshLineMaterial: MaterialNode<MeshLineMaterial, typeof MeshLineMaterial>
  }
}

let VXEngineUtils;
if (process.env.NODE_ENV === 'development') {
  VXEngineUtils = require('../RendererUtils.tsx').default;
}

// VXEngineCoreRenderer
export const CoreRenderer: React.FC<RendererCoreProps> = ({
  canvasProps = { gl: {}, dpr: {}, performance: {} },
  children,
  powerPreferences = 'high-performance'
}) => {
  const [dpr_state, setDpr_state] = useState(0.6)
  const { gl, dpr, performance, ...restCanvasProps } = canvasProps
  const { animationEngine } = useVXEngine();
  const { objects } = useVXObjectStore(state => ({
    objects: state.objects
  }));

  // Because the animationEngine is initialized really early, 
  // it cant apply the starter keyframes to the vxObjects present in the scene 
  // because they aren't mounted.
  useEffect(() => {
    animationEngine.reRender({ force: true, cause: "objects added"});
  }, [objects])

  return (
    <>
      <Canvas
        gl={{
          logarithmicDepthBuffer: false,
          antialias: true,
          preserveDrawingBuffer: true,
          powerPreference: powerPreferences,
        }}
        dpr={dpr_state}
        performance={{
          min: 0.1,
          max: 0.4
        }}
      >
        <PerformanceMonitor
          onChange={({ factor }) => setDpr_state(round(0.2 + 1.1 * factor, 1))}
        >
          <Suspense fallback={null}>
              <color attach="background" args={['black']} />
              {process.env.NODE_ENV === 'development' && (
                VXEngineUtils && <VXEngineUtils/>
              )}
              <VXEffectsManagerDriver>
                <Bloom mipmapBlur={true} intensity={0} kernelSize={5}  />
              </VXEffectsManagerDriver>
              <VXObjectManagerDriver/>
              {children}
          </Suspense>
        </PerformanceMonitor>
      </Canvas>
    </>
  )
}
