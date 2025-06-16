import { Vector3 } from 'three'
import { GradientProps, MappingType, MappingTypes } from '../types'
import MaterialLayerAbstract from './MaterialLayerAbstract'

export default class Gradient extends MaterialLayerAbstract {

  protected get definition() {
    return {
      name: "Gradient",
      uniforms: {
        colorA: {type: "color", default: 'white'},
        colorB: {type: "color", default: 'black'},
        alpha: {type: "float", default: 1},
        start: {type: "float", default: 1},
        end: {type: "float", default: -1},
        contrast: {type: "float", default: 1},
      },
      fragmentShader,
      vertexShader
    }
  }

  public axes: 'x' | 'y' | 'z' = 'x'
  public mapping: MappingType = 'local'

  constructor(props?: GradientProps) {
    super(props)

    const mapping = Gradient.getMapping(this.mapping)

    this.vertexShader = this.vertexShader.replace('lamina_mapping_template', mapping || 'local')
    this.fragmentShader = this.fragmentShader.replace('axes_template', this.axes || 'x')
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

		vod main() {
      v_position = lamina_mapping_template;
		}
  `

const fragmentShader = `   
    uniform vec3 u_colorA;
    uniform vec3 u_colorB;
    uniform vec3 u_axis;
    uniform float u_alpha;
    uniform float u_start;
    uniform float u_end;
    uniform float u_contrast;

		varying vec3 v_position;

    void main() {

      float f_step = smoothstep(u_start, u_end, v_position.axes_template * u_contrast);
      vec3 f_color = mix(u_colorA, u_colorB, f_step);

      return vec4(f_color, u_alpha);
    }
  `