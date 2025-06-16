import { FresnelProps } from '../types'
import MaterialLayerAbstract from './MaterialLayerAbstract'

export default class Fresnel extends MaterialLayerAbstract {

  protected get definition() {
    return {
      name: "Fresnel",
      uniforms: {
        color: { type: "color", default: "white"},
        alpha: { type: 'float', default: 1 },
        bias: { type: 'float', default: 0 },
        intensity: { type: 'float', default: 1 },
        power: { type: 'float', default: 2 },
        factor: { type: 'float', default: 1 },
      },
      fragmentShader,
      vertexShader
    }
  }

  constructor(props?: FresnelProps) {
    super(props)
  }
}


const vertexShader = /*glsl*/ `
  varying vec3 v_worldPosition;
  varying vec3 v_worldNormal;

  void main() {
      v_worldPosition = vec3(-viewMatrix[0][2], -viewMatrix[1][2], -viewMatrix[2][2]);
      v_worldNormal = normalize( mat3( modelMatrix[0].xyz, modelMatrix[1].xyz, modelMatrix[2].xyz ) * normal );    
  }
`

const fragmentShader = /*glsl*/ `   
  uniform vec3 u_color;
  uniform float u_alpha;
  uniform float u_bias;
  uniform float u_intensity;
  uniform float u_power;
  uniform float u_factor;

  varying vec3 v_worldPosition;
  varying vec3 v_worldNormal;

  void main() {
      float f_a = (u_factor  + dot(v_worldPosition, v_worldNormal));
      float f_fresnel = u_bias + u_intensity * pow(abs(f_a), u_power);

      f_fresnel = clamp(f_fresnel, 0.0, 1.0);
      return vec4(f_fresnel * u_color, u_alpha);
  }
`