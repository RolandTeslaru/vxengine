import * as THREE from 'three'

import MaterialLayerAbstract from './core/MaterialLayerAbstract'
import Depth from './core/Depth'
import Color from './core/Color'
import Noise from './core/Noise'
import Fresnel from './core/Fresnel'
import Gradient from './core/Gradient'
import Matcap from './core/Matcap'
import Texture from './core/Texture'
import Displace from './core/Displace'
import Normal from './core/Normal'
import Glass from './core/Glass'

import BlendModesChunk from './chunks/BlendModes'
import NoiseChunk from './chunks/Noise'
import HelpersChunk from './chunks/Helpers'
import { LayerMaterialParameters, SerializedLayer, ShadingType, ShadingTypes } from './types'
import {
  ColorRepresentation,
  MeshBasicMaterialParameters,
  MeshLambertMaterialParameters,
  MeshPhongMaterialParameters,
  MeshPhysicalMaterialParameters,
  MeshStandardMaterialParameters,
  MeshToonMaterialParameters,
} from 'three'

import CustomShaderMaterial from "three-custom-shader-material/vanilla"
import { vxObjectProps } from '@vxengine/managers/ObjectManager/types/objectStore'

type AllMaterialParams =
  | MeshPhongMaterialParameters
  | MeshPhysicalMaterialParameters
  | MeshToonMaterialParameters
  | MeshBasicMaterialParameters
  | MeshLambertMaterialParameters
  | MeshStandardMaterialParameters


class LayerMaterial extends CustomShaderMaterial {
  public name: string = 'LayerMaterial'
  public layers: MaterialLayerAbstract[] = []
  public lighting: ShadingType = 'basic'
  public isLayerMaterial = true
  public vxkey: string
  public addToVXObjectStore = true

  constructor({ color, alpha, lighting, layers, name, vxkey, addToObjectStore = true, ...props }: LayerMaterialParameters & AllMaterialParams = {}) {
    if(!vxkey && addToObjectStore)
      throw new Error("LayerMaterail: vxkey was not passed")
    super({
      baseMaterial: ShadingTypes[lighting || 'basic'],
      isLayerMaterial: true,
      ...props,
    })

    const _baseColor = color || 'white'
    const _alpha = alpha ?? 1

    this.uniforms = {
      u_lamina_color: {
        value: typeof _baseColor === 'string' ? new THREE.Color(_baseColor).convertSRGBToLinear() : _baseColor,
      },
      u_lamina_alpha: {
        value: _alpha,
      },
    }

    this.layers = layers || this.layers
    this.lighting = lighting || this.lighting
    this.name = name ?? this.name
    this.addToVXObjectStore = addToObjectStore

    this.refresh()

    if(this.addToVXObjectStore){
      const newVXEntity: vxObjectProps = {
        vxkey,
        type: "material",
        ref: { current: this },
        name: this.name,
        parentKey: "materials",
        parentMeshKeys: []
      }
    }
  }

  private _buildShader() {
    let vertexVariables = ''
    let fragmentVariables = ''
    let vertexShader = ''
    let fragmentShader = ''
    let uniqueUniforms: Record<string, THREE.IUniform> = {}

    this.layers
      .filter((layer) => layer.visible)
      .forEach((_layer) => {
        // l.buildShaders(l.constructor)

        vertexVariables += _layer.processedVertexVariables + '\n'
        fragmentVariables += _layer.processedFragmentVariables + '\n'
        vertexShader += _layer.processedVertexShader + '\n'
        fragmentShader += _layer.processedFragmentShader + '\n'

        // Copy all the unique uniforms from the layer to the final uniforms Object
        Object.assign(uniqueUniforms, _layer.uniqueUniforms)
      })

    // Copy all the CSM uniforms to the final uniforms object
    Object.assign(uniqueUniforms, this.uniforms)

    return {
      uniforms: uniqueUniforms,
      vertexShader: `        
        ${HelpersChunk}
        ${NoiseChunk}
        ${vertexVariables}

        void main() {
          vec3 lamina_finalPosition = position;
          vec3 lamina_finalNormal = normal;

          ${vertexShader}

          csm_Position = lamina_finalPosition;
          csm_Normal = lamina_finalNormal;
        }
        `,
      fragmentShader: `
        ${HelpersChunk}
        ${NoiseChunk}
        ${BlendModesChunk}
        ${fragmentVariables}

        uniform vec3 u_lamina_color;
        uniform float u_lamina_alpha;

        void main() {
          vec4 lamina_finalColor = vec4(u_lamina_color, u_lamina_alpha);

          ${fragmentShader}

          csm_DiffuseColor = lamina_finalColor;
         
        }
        `,
    }
  }

  public refresh() {
    const { uniforms, fragmentShader, vertexShader } = this._buildShader()
    super.update({ fragmentShader, vertexShader, uniforms })
  }

  public serialize(): SerializedLayer {
    return {
      constructor: 'LayerMaterial',
      properties: {
        color: this.color,
        alpha: this.alpha,
        name: this.name,
        lighting: this.lighting,
      },
    }
  }

  public set color(v: ColorRepresentation) {
    if (this.uniforms?.u_lamina_color?.value)
      this.uniforms.u_lamina_color.value = typeof v === 'string' ? new THREE.Color(v).convertSRGBToLinear() : v
  }
  public get color() {
    return this.uniforms?.u_lamina_color?.value
  }
  public set alpha(v: number) {
    this.uniforms.u_lamina_alpha.value = v
  }
  public get alpha() {
    return this.uniforms.u_lamina_alpha.value
  }
}

export { LayerMaterial, MaterialLayerAbstract, Depth, Color, Noise, Fresnel, Gradient, Matcap, Texture, Displace, Normal, Glass }