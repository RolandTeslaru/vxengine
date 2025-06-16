import { Vector3 } from 'three'
import { ColorProps, DisplaceProps, MappingType, MappingTypes, NoiseProps, NoiseType, NoiseTypes } from '../types'
import MaterialLayerAbstract from './MaterialLayerAbstract'

type AbstractExtended = MaterialLayerAbstract & {
  type: NoiseType
  mapping: MappingType
}

export default class Displace extends MaterialLayerAbstract {

  protected get definition(){
    return {
      name: "Depth",
      uniforms: {
        strength: { type: "float", default: 1 },
        scale: { type: "float", default: 1 },
        offset: { type: "vec3", default: new Vector3(0,0,0) },
      },
      vertexShader
    }
  }

  public type: NoiseType = 'perlin'
  public mapping: MappingType = 'local'

  constructor(props?: DisplaceProps) {
    super(props)

    const noiseFunc = Displace.getNoiseFunction(this.type)
    const mapping = Displace.getMapping(this.mapping)

    this.vertexVariables = this.vertexVariables.replace('lamina_mapping_template', mapping)
    this.vertexVariables = this.vertexVariables.replace('lamina_noise_template', noiseFunc)
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
        return `p`
      case 'world':
        return `(modelMatrix * vec4(p,1.0)).xyz`
      case 'uv':
        return `vec3(uv, 0.)`
    }
  }
}



const vertexShader = /* glsl */`       
  uniform float u_strength;
  uniform float u_scale;
  uniform vec3 u_offset;

  vec3 displace(vec3 p) {
    vec3 f_position = lamina_mapping_template;
    float f_n = lamina_noise_template((f_position + u_offset) * u_scale) * u_strength;
    vec3 f_newPosition = p + (f_n * normal);

    return f_newPosition;
  }


  vec3 orthogonal(vec3 v) {
    return normalize(abs(v.x) > abs(v.z) ? vec3(-v.y, v.x, 0.0)
    : vec3(0.0, -v.z, v.y));
  }
  vec3 recalcNormals(vec3 newPos) {
    float offset = 0.001;
    vec3 tangent = orthogonal(normal);
    vec3 bitangent = normalize(cross(normal, tangent));
    vec3 neighbour1 = position + tangent * offset;
    vec3 neighbour2 = position + bitangent * offset;
    vec3 displacedNeighbour1 = displace(neighbour1);
    vec3 displacedNeighbour2 = displace(neighbour2);
    vec3 displacedTangent = displacedNeighbour1 - newPos;
    vec3 displacedBitangent = displacedNeighbour2 - newPos;
    return normalize(cross(displacedTangent, displacedBitangent));
  }


  void main() {
  
    vec3 f_newPosition = displace(position);
    lamina_finalNormal = recalcNormals(f_newPosition);

    return f_newPosition;
  }
`