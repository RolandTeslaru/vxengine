import { ColorProps } from '../types'
import MaterialLayerAbstract, { LayerMaterialDefinition } from './MaterialLayerAbstract'

export default class Color extends MaterialLayerAbstract {

  protected get definition() {
    return {
      name: "Color",
      uniforms: {
        color: { type: 'vec3', default: 'red' },
        alpha: { type: 'float', default: 1 }
      },
      fragmentShader,
    }
  } 


  constructor(props?: ColorProps) {
    super(props)

    this.buildShaders()
  }
}


const fragmentShader = /*glsl*/ `   
  uniform vec3 u_color;
  uniform float u_alpha;

  void main() {
    return vec4(u_color, u_alpha);
  }
`