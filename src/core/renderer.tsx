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
import { VXObjectParams } from '@vxengine/vxobject/types'
import animationEngineInstance from '@vxengine/singleton'
import { EffectComposer } from '@react-three/postprocessing'

export interface RendererCoreProps {
  canvasProps?: Partial<CanvasProps>;
  children?: React.ReactNode;
  mount?: boolean;
  powerPreferences?: 'high-performance' | 'low-power';
  effectsNode?: React.ReactElement
  className?: string
}

// VXEngineCoreRenderer
export const VXRenderer: React.FC<RendererCoreProps> = ({
  canvasProps = {},
  children,
  powerPreferences = 'high-performance',
  effectsNode,
  className
}) => {
  const { gl: glProps,  ...restCanvasProps } = canvasProps

  const { IS_DEVELOPMENT } = useVXEngine();

  return (
    <div className={"w-screen h-screen fixed top-0 z-[-1]" + " " + className}>
      <Canvas
        gl={{
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.0,
          precision: 'highp',
          ...glProps
        }}
        dpr={canvasProps.dpr ?? [1,2]}
        frameloop={canvasProps.frameloop ?? "demand"}
        performance={canvasProps.performance ?? {
          min: 0.1,
          max: 0.4,
          ...performance
        }}
        {...restCanvasProps}
      >
        <SceneDriver/>
        <PerformanceMonitor
          // onChange={({ factor }) => {
          //   const isPlaying = useAnimationEngineAPI.getState().isPlaying;
          //   const cameraMode = useCameraManagerAPI.getState().mode;
          //   // When the animations are playing, chaning the dpr state can cause a slight flicker
          //   // if (!isPlaying && cameraMode === "attached") {
          //   //   const value = round(0.2 + 1.1 * factor, 1)
          //   //   setDpr_state(value)
          //   // }
          // }}
        >
          {/* <color attach="background" args={['gray']} /> */}
          {IS_DEVELOPMENT && <>
            <VXRendererUtils />
            <ObjectManagerDriver />
          </>
          }
          <EffectComposer>
            {effectsNode}
          </EffectComposer>


          <CameraManagerDriver />
          {children}
        </PerformanceMonitor>
      </Canvas>
    </div>
  )
}


const sceneParams: VXObjectParams = [
  {type: "number", propertyPath: "environmentIntensity", title: "envIntensity"},
  {type: "number", propertyPath: "backgroundBlurriness", title: "bgBlurriness"},
  {type: "number", propertyPath: "backgroundIntensity", title: "bgIntensity"},
]

const SceneDriver = React.memo(() => {
  const scene = useThree(state => state.scene);
  const { IS_DEVELOPMENT } = useVXEngine();
  
  useLayoutEffect(() => {
    const addObject = useVXObjectStore.getState().addObject;

    const sceneRef = {
      current: scene
    }

    const vxkey = "scene"
    const disabledParams = [
      "position",
      "rotation",
      "scale"
    ]

    const newSceneEntity: vxObjectProps = {
      type: "entity",
      ref: sceneRef,
      vxkey,
      name: "Scene",
      params: sceneParams,
      disabledParams,
      parentKey: "global"
    }
    addObject(newSceneEntity, IS_DEVELOPMENT);
    animationEngineInstance.initObjectOnMount(newSceneEntity);

  }, [])
  return null;
})