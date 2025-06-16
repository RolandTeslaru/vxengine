import { Vector3 } from 'three'
import { ColorProps, MappingType, MappingTypes, NoiseProps, NoiseType, NoiseTypes } from '../types'
import MaterialLayerAbstract from './MaterialLayerAbstract'

type AbstractExtended = MaterialLayerAbstract & {
  type: NoiseType
  mapping: MappingType
}

export default class Noise extends MaterialLayerAbstract {

  protected get definition(){
    return {
      name: "Noise",
      uniforms: {
        alpha: { type: "float", default: 10 },
        scale: { type: "float", default: 1 },
        offset: { type: "vec3", default: new Vector3(0, 0, 0) },
        colorA: { type: "color", default: '#666666' },
        colorB: { type: "color", default: '#666666' },
        colorC: { type: "color", default: '#FFFFFF' },
        colorD: { type: "color", default: '#FFFFFF' },
      },
      fragmentShader,
      vertexShader
    }
  }

  public vertexShader = vertexShader
  public fragmentShader = fragmentShader

  public type: NoiseType = 'perlin'
  public mapping: MappingType = 'local'

  constructor(props?: NoiseProps) {
    super(props)

    const noiseFunc = Noise.getNoiseFunction(this.type)
    const mapping = Noise.getMapping(this.mapping)

    this.vertexShader = this.vertexShader.replace('lamina_mapping_template', mapping)
    this.fragmentShader = this.fragmentShader.replace('lamina_noise_template', noiseFunc)
  }

  private static getNoiseFunction(type?: string) {
    switch (type) {
      default:
      case 'perlin':
        return `lamina_noise_perlin`
      case 'simplex':
        return `lamina_noise_simplex`
      case 'cell':
        return `lamina_noise_worley`
      case 'white':
        return `lamina_noise_white`
      case 'curl':
        return `lamina_noise_swirl`
    }
  }

  private static getMapping(type?: string) {
    switch (type) {
      default:
      case 'local':
        return `position`
      case 'world':
        return `(modelMatrix * vec4(position,1.0)).xyz`
      case 'uv':
        return `vec3(uv, 0.)`
    }
  }
}


const vertexShader = `
    varying vec3 v_position;

    void main() {
        v_position = lamina_mapping_template;
    }
  `

const fragmentShader = `   
    uniform vec3 u_colorA;
    uniform vec3 u_colorB;
    uniform vec3 u_colorC;
    uniform vec3 u_colorD;
    uniform vec3 u_offset;

    uniform float u_alpha;
    uniform float u_scale;

    varying vec3 v_position;


    void main() {
        float f_n = lamina_noise_template((v_position + u_offset) * u_scale);

        float f_step1 = 0.;
        float f_step2 = 0.2;
        float f_step3 = 0.6;
        float f_step4 = 1.;

        vec3 f_color = mix(u_colorA, u_colorB, smoothstep(f_step1, f_step2, f_n));
        f_color = mix(f_color, u_colorC, smoothstep(f_step2, f_step3, f_n));
        f_color = mix(f_color, u_colorD, smoothstep(f_step3, f_step4, f_n));

        return vec4(f_color, u_alpha);
    }
  `