import React, { useMemo, useLayoutEffect, DO_NOT_USE_OR_YOU_WILL_BE_FIRED_EXPERIMENTAL_REACT_NODES } from "react"
import { useThree, createPortal, useFrame, extend, Object3DNode, Euler, applyProps } from '@react-three/fiber'
import { WebGLCubeRenderTarget, Texture, Scene, CubeCamera, HalfFloatType, CubeTexture } from 'three'
import { GroundProjectedEnv as GroundProjectedEnvImpl } from 'three-stdlib'
import { PresetsType } from '@react-three/drei/helpers/environment-assets'
import { EnvironmentLoaderProps, useEnvironment } from '@react-three/drei'
import * as THREE from "three"
import useAnimationEngineEvent from "@vxengine/AnimationEngine/utils/useAnimationEngineEvent"
import useTransformControlsEvent from "@vxengine/managers/ObjectManager/utils"
import { useObjectSettingsAPI } from "@vxengine/vxobject/ObjectSettingsStore"
import { useVXObjectStore } from "@vxengine/vxobject/ObjectStore"

export type EnvironmentProps = {
  children?: React.ReactNode
  frames?: number
  near?: number
  far?: number
  resolution?: number
  background?: boolean | 'only'

  /** deprecated, use backgroundBlurriness */
  blur?: number
  backgroundBlurriness?: number
  backgroundIntensity?: number
  backgroundRotation?: Euler
  environmentIntensity?: number
  environmentRotation?: Euler

  map?: Texture
  preset?: PresetsType
  scene?: Scene | React.MutableRefObject<Scene>
  ground?:
    | boolean
    | {
        radius?: number
        height?: number
        scale?: number
      }
} & EnvironmentLoaderProps

const isRef = (obj: any): obj is React.MutableRefObject<Scene> => obj.current && obj.current.isScene
const resolveScene = (scene: Scene | React.MutableRefObject<Scene>) => (
    isRef(scene) ? scene.current : scene
)

function setEnvProps(
  background: boolean | 'only',
  scene: Scene | React.MutableRefObject<Scene> | undefined,
  defaultScene: Scene,
  texture: Texture,
  sceneProps: Partial<EnvironmentProps> = {}
) {
  // defaults
  sceneProps = {
    backgroundBlurriness: sceneProps.blur ?? 0,
    backgroundIntensity: 1,
    backgroundRotation: [0, 0, 0],
    environmentIntensity: 1,
    environmentRotation: [0, 0, 0],
    ...sceneProps,
  }

  const target = resolveScene(scene || defaultScene)
  const oldbg = target.background
  const oldenv = target.environment
  const oldSceneProps = {
    // @ts-ignore
    backgroundBlurriness: target.backgroundBlurriness,
    // @ts-ignore
    backgroundIntensity: target.backgroundIntensity,
    // @ts-ignore
    backgroundRotation: target.backgroundRotation?.clone?.() ?? [0, 0, 0],
    // @ts-ignore
    environmentIntensity: target.environmentIntensity,
    // @ts-ignore
    environmentRotation: target.environmentRotation?.clone?.() ?? [0, 0, 0],
  }
  if (background !== 'only') 
    target.environment = texture
  if (background) 
    target.background = texture
  applyProps(target as any, sceneProps)

  return () => {
    if (background !== 'only') 
        target.environment = oldenv
    if (background) 
        target.background = oldbg
    applyProps(target as any, oldSceneProps)
  }
}

export function VXEnvironmentMap({ scene, background = false, map, ...config }: EnvironmentProps) {
  const defaultScene = useThree((state) => state.scene)
  useLayoutEffect(() => {
    if (map) return setEnvProps(background, scene, defaultScene as any, map, config)
  })
  return null
}

export function VXEnvironmentCube({
  background = false,
  scene,
  blur,
  backgroundBlurriness,
  backgroundIntensity,
  backgroundRotation,
  environmentIntensity,
  environmentRotation,
  ...rest
}: EnvironmentProps) {
  const texture = useEnvironment(rest)
  const defaultScene = useThree((state) => state.scene)
  useLayoutEffect(() => {
    return setEnvProps(background, scene, defaultScene as any, texture as any, {
      blur,
      backgroundBlurriness,
      backgroundIntensity,
      backgroundRotation,
      environmentIntensity,
      environmentRotation,
    })
  })
  return null
}

export function VXEnvironmentPortal({
  children,
  near = 1,
  far = 1000,
  resolution = 256,
  frames = 1,
  map,
  background = false,
  blur,
  backgroundBlurriness,
  backgroundIntensity,
  backgroundRotation,
  environmentIntensity,
  environmentRotation,
  scene,
  files,
  path,
  preset = undefined,
  extensions,
}: EnvironmentProps) {
  const gl = useThree((state) => state.gl)
  const defaultScene = useThree((state) => state.scene)
  const camera = React.useRef<CubeCamera>(null!)
  const [virtualScene] = React.useState(() => new Scene())
  const fbo = useMemo(() => {
    const fbo = new WebGLCubeRenderTarget(resolution)
    fbo.texture.type = HalfFloatType
    return fbo
  }, [resolution])

  useLayoutEffect(() => {
    if (frames === 1) camera.current.update(gl as any, virtualScene)
    return setEnvProps(background, scene, defaultScene as any, fbo.texture, {
      blur,
      backgroundBlurriness,
      backgroundIntensity,
      backgroundRotation,
      environmentIntensity,
      environmentRotation,
    })
  }, [children, virtualScene, fbo.texture, scene, defaultScene, background, frames, gl])

  let count = 1

  useAnimationEngineEvent(
    'timeUpdated',
    ({ time }) => {
      camera.current.update(gl as any, virtualScene)
      count++ 
    }
  );

  useTransformControlsEvent(
    "virtualEntityChange", () => {
      camera.current.update(gl as any, virtualScene)
      count++
    }
  )


  return (
    <>
      {createPortal(
        <>
          {children}
          {/* @ts-ignore */}
          <cubeCamera ref={camera} args={[near, far, fbo]} />
          {files || preset ? (
            <VXEnvironmentCube background files={files} preset={preset} path={path} extensions={extensions} />
          ) : map ? (
            <VXEnvironmentMap background map={map} extensions={extensions} />
          ) : null}
        </>,
        virtualScene as any
      )}
    </>
  )
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      groundProjectedEnvImpl: Object3DNode<GroundProjectedEnvImpl, typeof GroundProjectedEnvImpl>
    }
  }
}

function VXEnvironmentGround(props: EnvironmentProps) {
  const textureDefault = useEnvironment(props)
  const texture = props.map || textureDefault

  useMemo(() => extend({ GroundProjectedEnvImpl }), [])

  const args = useMemo<[CubeTexture | Texture]>(() => [texture as any], [texture])
  const height = (props.ground as any)?.height
  const radius = (props.ground as any)?.radius
  const scale = (props.ground as any)?.scale ?? 1000

  return (
    <>
      <VXEnvironmentMap {...props} map={texture as any} />
      <mesh>
        <sphereGeometry args={[100, 100]}/>
        <meshBasicMaterial map={texture} side={THREE.BackSide}/>
      </mesh>
      {/* <groundProjectedEnvImpl args={args as any} scale={scale} height={height} radius={radius} /> */}
    </>
  )
}

export function VXEnvironment(props: EnvironmentProps) {
  return props.ground ? (
    <VXEnvironmentGround {...props} />
  ) : props.map ? (
    <VXEnvironmentMap {...props} />
  ) : props.children ? (
    <VXEnvironmentPortal {...props} />
  ) : (
    <VXEnvironmentCube {...props} />
  )
}