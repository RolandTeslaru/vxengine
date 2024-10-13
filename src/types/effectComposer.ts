import { TextureDataType } from "three"
import * as THREE from "three"

export type EffectComposerProps = {
    enabled?: boolean
    children: JSX.Element | JSX.Element[]
    depthBuffer?: boolean
    disableNormalPass?: boolean
    disableSSRPass?: boolean
    stencilBuffer?: boolean
    autoClear?: boolean
    resolutionScale?: number
    multisampling?: number
    frameBufferType?: TextureDataType
    renderPriority?: number
    camera?: THREE.Camera
    scene?: THREE.Scene
  }