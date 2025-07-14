// VXEngine - VEXR Labs' proprietary toolset for React Three Fiber
// (c) 2024 VEXR Labs. All Rights Reserved.
// See the LICENSE file in the root directory of this source tree for licensing information.

import React, { createContext, Suspense, useCallback, useContext, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Canvas, extend, useThree } from '@react-three/fiber'
import { PerformanceMonitor } from '@react-three/drei'
import { round } from 'lodash'
import { MeshLineGeometry, MeshLineMaterial } from 'meshline'
import { RenderPass } from 'three-stdlib'

import * as THREE from "three"

extend({ MeshLineGeometry, MeshLineMaterial, RenderPass })

import { ThreeElement } from '@react-three/fiber'

declare module '@react-three/fiber' {
  interface ThreeElements {
    meshLineGeometry: ThreeElement<typeof MeshLineGeometry>
    meshLineMaterial: ThreeElement<typeof MeshLineMaterial>
  }
}

import { CanvasProps } from "@react-three/fiber";
import { ObjectManagerDriver, useVXObjectStore } from '@vxengine/managers/ObjectManager'
import VXRendererUtils from '@vxengine/utils/rendererUtils'
import { EffectComposerDriver } from '@vxengine/managers/EffectsManager/driver'
import { vx } from '@vxengine/vxobject'
import { vxengine } from '@vxengine/singleton'
import VXRendererProvider from './rendererContext'
import CameraManagerDriver from '@vxengine/managers/CameraManager/driver'

export interface RendererCoreProps {
  canvasProps?: Partial<CanvasProps>;
  children?: React.ReactNode;
  mount?: boolean;
  powerPreferences?: 'high-performance' | 'low-power';
  effectsNode?: React.ReactElement
  className?: string
}

const VXRendererContext = createContext({
  gl: { current: null },
  opaqueRenderTarget: { current: null },
  composer: { current: null }
})

// VXEngineCoreRenderer
export const VXRenderer: React.FC<RendererCoreProps> = React.memo(({
  canvasProps = {},
  children,
  powerPreferences = 'high-performance',
  effectsNode,
  className
}) => {
  const { gl: glProps, ...restCanvasProps } = canvasProps

  return (
    <div className={"w-screen h-screen fixed top-0" + " " + className}>
      <Canvas
        gl={{
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.0,
          precision: 'lowp',
          ...glProps
        }}
        dpr={canvasProps.dpr ?? [1, 2]}
        frameloop={canvasProps.frameloop ?? "demand"}
        performance={canvasProps.performance ?? {
          min: 0.1,
          max: 0.4,
          ...performance
        }}
        {...restCanvasProps}
      >
        <VXRendererProvider>
          <vx.scene vxkey="scene"/>
          {/* <color attach="background" args={['gray']} /> */}
          {vxengine.isDevelopment && <>
            <VXRendererUtils />
            <ObjectManagerDriver/>
            <vx.grid vxkey="grid" name="Grid" />
          </>
          }
          <EffectComposerDriver>
            {effectsNode}
          </EffectComposerDriver>

          <CameraManagerDriver />
          {children}
        </VXRendererProvider>
      </Canvas>
    </div>
  )
})
