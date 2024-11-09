// VXEngine - VEXR Labs' proprietary toolset for React Three Fiber
// (c) 2024 VEXR Labs. All Rights Reserved.
// See the LICENSE file in the root directory of this source tree for licensing information.

"use client"

import React, { Suspense, useContext, useEffect, useRef, useState } from 'react'
import { Canvas, extend } from '@react-three/fiber'
import { PerformanceMonitor } from '@react-three/drei'
import { round } from 'lodash'
import { EffectsManagerDriver} from '../managers/EffectsManager'
import { MeshLineGeometry, MeshLineMaterial } from 'meshline'
import { RenderPass } from 'three-stdlib'
import { Stats } from '@react-three/drei'

extend({ MeshLineGeometry, MeshLineMaterial, RenderPass })

import { Object3DNode, MaterialNode } from '@react-three/fiber'
import { useObjectSettingsAPI } from "@vxengine/managers/ObjectManager";
import CameraManagerDriver from '../managers/CameraManager/driver'
import { useAnimationEngineAPI } from '@vxengine/AnimationEngine'
import { useCameraManagerAPI } from '@vxengine/managers/CameraManager/store'

declare module '@react-three/fiber' {
  interface ThreeElements {
    meshLineGeometry: Object3DNode<MeshLineGeometry, typeof MeshLineGeometry>
    meshLineMaterial: MaterialNode<MeshLineMaterial, typeof MeshLineMaterial>
  }
}

let VXEngineUtils;
VXEngineUtils = require('../utils/rendererUtils.tsx').default;

import { CanvasProps } from "@react-three/fiber";
import { getNodeEnv } from '@vxengine/constants'
import { ObjectManagerDriver } from '@vxengine/managers/ObjectManager'
import { vx } from '@vxengine/vxobject'

export interface RendererCoreProps {
    canvasProps?: CanvasProps;
    children?: React.ReactNode;
    mount?: boolean;
    powerPreferences?: 'high-performance' | 'low-power';
    effectsNode?: React.ReactElement
}

// VXEngineCoreRenderer
export const CoreRenderer: React.FC<RendererCoreProps> = ({
  canvasProps = { gl: {}, dpr: {}, performance: {} },
  children,
  powerPreferences = 'high-performance',
  effectsNode
}) => {
  const [dpr_state, setDpr_state] = useState(0.6)
  const { gl, dpr, performance, ...restCanvasProps } = canvasProps

  const IS_DEVELOPMENT = getNodeEnv() === "development"

  return (
    <>
      <Canvas
        gl={{
          logarithmicDepthBuffer: false,
          antialias: true,
          preserveDrawingBuffer: false,
          powerPreference: powerPreferences,
          ...gl
        }}
        dpr={dpr_state}
        performance={{
          min: 0.1,
          max: 0.4,
          ...performance
        }}
        frameloop={"demand"}
      >
        <PerformanceMonitor
          onChange={({ factor }) => {
            const isPlaying = useAnimationEngineAPI.getState().isPlaying;
            const cameraMode = useCameraManagerAPI.getState().mode;
            // When the animations are playing, chaning the dpr state can cause a slight flicker
            if(!isPlaying && cameraMode === "attached"){
              const value = round(0.2 + 1.1 * factor, 1)
              setDpr_state(value)
            }
          }}
        >
          {/* <color attach="background" args={['gray']} /> */}
          {IS_DEVELOPMENT && <>
              <VXEngineUtils/>
              <ObjectManagerDriver/>
          </>
          }
          <EffectsManagerDriver disableNormalPass={true}>
            {effectsNode}
            <vx.fadeEffect />
          </EffectsManagerDriver>
          
          <CameraManagerDriver/>
          
          {children}
        </PerformanceMonitor>
      </Canvas>
    </>
  )
}
