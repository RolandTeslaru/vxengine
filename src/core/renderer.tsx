// VXEngine - VEXR Labs' proprietary toolset for React Three Fiber
// (c) 2024 VEXR Labs. All Rights Reserved.
// See the LICENSE file in the root directory of this source tree for licensing information.

import React, { Suspense, useCallback, useContext, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Canvas, extend, useThree } from '@react-three/fiber'
import { PerformanceMonitor } from '@react-three/drei'
import { round } from 'lodash'
import { MeshLineGeometry, MeshLineMaterial } from 'meshline'
import { RenderPass } from 'three-stdlib'

import * as THREE from "three"

extend({ MeshLineGeometry, MeshLineMaterial, RenderPass })

import { ThreeElement } from '@react-three/fiber'
import CameraManagerDriver from '../managers/CameraManager/driver'
import { useAnimationEngineAPI } from '@vxengine/AnimationEngine'
import { useCameraManagerAPI } from '@vxengine/managers/CameraManager/store'

declare module '@react-three/fiber' {
  interface ThreeElements {
    meshLineGeometry: ThreeElement<typeof MeshLineGeometry>
    meshLineMaterial: ThreeElement<typeof MeshLineMaterial>
  }
}

import { CanvasProps } from "@react-three/fiber";
import { ObjectManagerDriver, useVXObjectStore } from '@vxengine/managers/ObjectManager'
import { vxObjectProps } from '@vxengine/managers/ObjectManager/types/objectStore'
import { useVXEngine } from '@vxengine/engine'
import VXRendererUtils from '@vxengine/utils/rendererUtils'
import { VXElementParams } from '@vxengine/vxobject/types'
import animationEngineInstance from '@vxengine/singleton'
import { EffectComposerDriver } from '@vxengine/managers/EffectsManager/driver'
import { vx } from '@vxengine/vxobject'
import SplineManagerDriver from '@vxengine/managers/SplineManager/driver'

export interface RendererCoreProps {
  canvasProps?: Partial<CanvasProps>;
  children?: React.ReactNode;
  mount?: boolean;
  powerPreferences?: 'high-performance' | 'low-power';
  effectsNode?: React.ReactElement
  className?: string
}

// VXEngineCoreRenderer
export const VXRenderer: React.FC<RendererCoreProps> = React.memo(({
  canvasProps = {},
  children,
  powerPreferences = 'high-performance',
  effectsNode,
  className
}) => {
  const { gl: glProps, ...restCanvasProps } = canvasProps

  const { IS_DEVELOPMENT } = useVXEngine();

  return (
    <div className={"w-screen h-screen fixed top-0 z-[-1]" + " " + className}>
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
        <vx.scene vxkey="scene"/>
        {/* <color attach="background" args={['gray']} /> */}
        {IS_DEVELOPMENT && <>
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
      </Canvas>
    </div>
  )
})