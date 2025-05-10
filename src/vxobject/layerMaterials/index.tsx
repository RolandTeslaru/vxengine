import {
  extend,
  type ThreeElement,
  type ThreeElements
} from '@react-three/fiber'
import React, { useMemo, useImperativeHandle, useLayoutEffect, useRef } from 'react'
import {
  DepthProps,
  ColorProps,
  LayerMaterialProps,
  NoiseProps,
  FresnelProps,
  GradientProps,
  MatcapProps,
  TextureProps,
  DisplaceProps,
  NormalProps,
} from './types'
import * as LAYERS from './vanilla'
// import DebugLayerMaterial from './debug'
import { getLayerMaterialArgs } from './utils/Functions'
import { ColorRepresentation } from 'three'

// Extend R3F with custom elements - using lowercase to match JSX usage
extend({
  layerMaterial: LAYERS.LayerMaterial,
  depthLayer: LAYERS.Depth,
  colorLayer: LAYERS.Color,
  noiseLayer: LAYERS.Noise,
  fresnelLayer: LAYERS.Fresnel,
  gradientLayer: LAYERS.Gradient,
  matcapLayer: LAYERS.Matcap,
  textureLayer: LAYERS.Texture,
  displaceLayer: LAYERS.Displace,
  normalLayer: LAYERS.Normal,
  glassLayer: LAYERS.Glass
})

// Update type declarations for R3F - using lowercase to match JSX usage
declare module '@react-three/fiber' {
  interface ThreeElements {
    layerMaterial: ThreeElement<typeof LAYERS.LayerMaterial>
    // debuglayerMaterial: ThreeElement<typeof DebugLayerMaterial>
    depthLayer: ThreeElement<typeof LAYERS.Depth>
    colorLayer: ThreeElement<typeof LAYERS.Color>
    noiseLayer: ThreeElement<typeof LAYERS.Noise>
    fresnelLayer: ThreeElement<typeof LAYERS.Fresnel>
    gradientLayer: ThreeElement<typeof LAYERS.Gradient>
    matcapLayer: ThreeElement<typeof LAYERS.Matcap>
    textureLayer: ThreeElement<typeof LAYERS.Texture>
    displaceLayer: ThreeElement<typeof LAYERS.Displace>
    normalLayer: ThreeElement<typeof LAYERS.Normal>
    glassLayer: ThreeElement<typeof LAYERS.Glass>
  }
}

// Combined material props type using ThreeElements
type AllMaterialProps = ThreeElements['meshPhongMaterial'] & 
  ThreeElements['meshPhysicalMaterial'] &
  ThreeElements['meshToonMaterial'] &
  ThreeElements['meshBasicMaterial'] &
  ThreeElements['meshLambertMaterial'] &
  ThreeElements['meshStandardMaterial']

// Layer Material Component
const LayerMaterial = ({ children, ref, ...props }) => {
  const internalRef = useRef<LAYERS.LayerMaterial>(null!)
  useImperativeHandle(ref, () => internalRef.current)

  const [args, otherProps] = useMemo(() => getLayerMaterialArgs(props), [props])

  return (
    <layerMaterial args={[args,]} ref={internalRef} {...otherProps}>
      {children}
    </layerMaterial>
  )
}

function getNonUniformArgs(props: any) {
  return [
    {
      mode: props?.mode,
      visible: props?.visible,
      type: props?.type,
      mapping: props?.mapping,
      map: props?.map,
      axes: props?.axes,
    },
  ] as any
}

// Layer Components
const DepthLayer = (props) => <depthLayer args={getNonUniformArgs(props)} {...props} />

const ColorLayer = (props) => <colorLayer args={getNonUniformArgs(props)} {...props} />

const NoiseLayer = (props) => <noiseLayer args={getNonUniformArgs(props)} {...props} />

const FresnelLayer = (props) => <fresnelLayer args={getNonUniformArgs(props)} {...props} />

const GradientLayer = (props) => <gradientLayer args={getNonUniformArgs(props)} {...props} />

const MatcapLayer = (props) => <matcapLayer args={getNonUniformArgs(props)} {...props} />

const TextureLayer = (props) => <textureLayer args={getNonUniformArgs(props)} {...props} />

const DisplaceLayer = (props) => <displaceLayer args={getNonUniformArgs(props)} {...props} />

const NormalLayer = (props) => <normalLayer args={getNonUniformArgs(props)} {...props} />

const GlassLayer = (props) => <glassLayer args={getNonUniformArgs(props)} {...props}/>
// Export with naming matching the usage
export { 
  // DebugLayerMaterial, 
  LayerMaterial,
  // Also export the direct lowercase versions to match JSX component names
  DepthLayer,
  ColorLayer,
  NoiseLayer,
  FresnelLayer,
  GradientLayer,
  MatcapLayer,
  TextureLayer,
  DisplaceLayer,
  NormalLayer,
  GlassLayer
}
