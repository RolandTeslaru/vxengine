import { Vector3 } from 'three'
import { DepthProps } from '../types'
import MaterialLayerAbstract from './MaterialLayerAbstract'

export default class Depth extends MaterialLayerAbstract {

  protected get definition() {
    return {
      name: "Depth",
      uniforms: {
        near: { type: "float", default: 2 },
        far: { type: "float", default: 10 },
        alpha: { type: "float", default: 1 },
        origin: { type: "vec3", default: new Vector3(0, 0, 0) },
        colorA: { type: "color", default: 'white' },
        colorB: { type: "color", default: 'black' },
      },
      fragmentShader,
      vertexShader
    }
  }

  constructor(props?: DepthProps) {
    super(props)

    // FragmentShader may be modified in the underlyng MaterialLayerAbstract
    const mapping = Depth.getMapping(this.uuid, this.mapping)
    this.fragmentShader = this.fragmentShader.replace('lamina_mapping_template', mapping)
  }

  public mapping: 'vector' | 'world' | 'camera' = 'vector'

  private static getMapping(uuid: string, type?: string) {
    switch (type) {
      default:
      case 'vector':
        return `length(v_${uuid}_worldPosition - u_${uuid}_origin)`
      case 'world':
        return `length(v_${uuid}_position - vec3(0.))`
      case 'camera':
        return `length(v_${uuid}_worldPosition - cameraPosition)`
    }
  }
}


const vertexShader = `
  varying vec3 v_worldPosition;
  varying vec3 v_position;

  void main() {
    v_worldPosition = (vec4(position, 1.0) * modelMatrix).xyz;
    v_position = position;
  }
`
const fragmentShader = `   
  uniform float u_alpha;
  uniform float u_near;
  uniform float u_far;
  uniform vec3 u_origin;
  uniform vec3 u_colorA;
  uniform vec3 u_colorB;

  varying vec3 v_worldPosition;
  varying vec3 v_position;

  void main() {
    float f_dist = lamina_mapping_template;
    float f_depth = (f_dist - u_near) / (u_far - u_near);
    vec3 f_depthColor =  mix(u_colorB, u_colorA, 1.0 - clamp(f_depth, 0., 1.));

    return vec4(f_depthColor, u_alpha);
  }
`