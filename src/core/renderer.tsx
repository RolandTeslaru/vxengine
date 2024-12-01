// VXEngine - VEXR Labs' proprietary toolset for React Three Fiber
// (c) 2024 VEXR Labs. All Rights Reserved.
// See the LICENSE file in the root directory of this source tree for licensing information.

"use client"

import React, { Suspense, useCallback, useContext, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Canvas, extend, useThree } from '@react-three/fiber'
import { PerformanceMonitor } from '@react-three/drei'
import { round } from 'lodash'
import { EffectsManagerDriver } from '../managers/EffectsManager'
import { MeshLineGeometry, MeshLineMaterial } from 'meshline'
import { RenderPass } from 'three-stdlib'
import { Stats } from '@react-three/drei'

import * as THREE from "three"

extend({ MeshLineGeometry, MeshLineMaterial, RenderPass })

import { Object3DNode, MaterialNode } from '@react-three/fiber'
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
import { ObjectManagerDriver, useVXObjectStore } from '@vxengine/managers/ObjectManager'
import { vx } from '@vxengine/vxobject'
import { EffectComposer, LensFlare } from '@react-three/postprocessing'
import { vxObjectProps } from '@vxengine/managers/ObjectManager/types/objectStore'
import { useVXEngine } from '@vxengine/engine'

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
  const [dpr_state, setDpr_state] = useState(1)
  const { gl, dpr, performance, ...restCanvasProps } = canvasProps

  const IS_DEVELOPMENT = getNodeEnv() === "development"

  return (
    <>
      <Canvas
        gl={{
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.0,
          precision: 'highp',
        }}
        dpr={dpr_state}
        performance={{
          min: 0.1,
          max: 0.4,
          ...performance
        }}
        frameloop={"demand"}
      >
        <SceneDriver/>
        <PerformanceMonitor
          onChange={({ factor }) => {
            const isPlaying = useAnimationEngineAPI.getState().isPlaying;
            const cameraMode = useCameraManagerAPI.getState().mode;
            // When the animations are playing, chaning the dpr state can cause a slight flicker
            if (!isPlaying && cameraMode === "attached") {
              const value = round(0.2 + 1.1 * factor, 1)
              setDpr_state(value)
            }
          }}
        >
          {/* <color attach="background" args={['gray']} /> */}
          {IS_DEVELOPMENT && <>
            <VXEngineUtils />
            <ObjectManagerDriver />
          </>
          }
          <EffectComposer>
            {effectsNode}
            <vx.fadeEffect />
          </EffectComposer>


          <CameraManagerDriver />
          {children}
        </PerformanceMonitor>
      </Canvas>
    </>
  )
}

const SceneDriver = () => {
  const scene = useThree(state => state.scene);

  const animationEngine = useVXEngine(state => state.animationEngine)

  const addObject = useVXObjectStore(state => state.addObject)
  const removeObject = useVXObjectStore(state => state.removeObject)

  const memoizedAddObject = useCallback(addObject, []);
  const memoizedRemoveObject = useCallback(removeObject, []);
  useLayoutEffect(() => {
    console.log("SCENE ", scene);
    const sceneRef = {
      current: scene
    }

    const vxkey = "scene"

    const params = [
      "environmentIntensity",
      "backgroundBlurriness",
      "backgroundIntensity",
    ]

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
      params,
      disabledParams
    }
    memoizedAddObject(newSceneEntity);
    animationEngine.initObjectOnMount(newSceneEntity);

    return () => {
      memoizedRemoveObject(vxkey);
    };
  }, [memoizedAddObject, memoizedRemoveObject])
  return null;
}