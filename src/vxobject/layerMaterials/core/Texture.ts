import { TextureProps } from '../types'
import MaterialLayerAbstract from './MaterialLayerAbstract'

export default class Texture extends MaterialLayerAbstract {

  protected get definition(){
    return {
      name: "Texture",
      uniforms: {
        alpha: {type: "float", default: 1},
        map: {type: "map", default: this.uniforms},
      },
      fragmentShader,
      vertexShader
    }
  }

  public vertexShader = vertexShader
  public fragmentShader = fragmentShader

  constructor(props?: TextureProps) {
    super(props)
  }
}


const vertexShader = `
  varying vec2 v_uv;
  
  void main() {
      v_uv = uv;
  }
`

const fragmentShader = ` 
  uniform sampler2D u_map;  
  uniform float u_alpha;  
  varying vec2 v_uv;

  void main() {
    vec4 f_color = texture2D(u_map, v_uv);
    return vec4(f_color.rgb, f_color.a * u_alpha);
  }
`