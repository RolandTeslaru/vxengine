import { getSpecialParameters, getUniform, isSerializableType, serializeProp } from '../utils/Functions'
import * as THREE from 'three'
import { BlendMode, BlendModes, LayerProps, SerializedLayer } from '../types'

import tokenize from 'glsl-tokenizer'
import descope from 'glsl-token-descope'
import stringify from 'glsl-token-string'
import tokenFunctions from 'glsl-token-functions'

export interface LayerMaterialDefinition {
  name: string
  uniforms: Record<string, { type: string, default: any }>,
  fragmentShader?: string,
  vertexShader?: string
}

type LayerMaterialSchemaType = {
  value: any
  label: string,
  options?: any[]
}[]

export default abstract class MaterialLayerAbstract {

  protected abstract get definition(): LayerMaterialDefinition
  
  protected fragmentShader: string = ""
  protected vertexShader: string = ""
  protected vertexVariables = ""
  protected fragmentVariables = ""

  public uuid: string = THREE.MathUtils.generateUUID().replace(/-/g, '_')
  public name: string = 'LayerMaterialAbstract'
  public mode: BlendMode = 'normal'
  public visible: boolean = true
  public uniforms: Record<string, THREE.IUniform> = {}
  public schema: LayerMaterialSchemaType = []
  public properties = new Map<string, any>()

  private _uniqueUniforms: Record<string, THREE.IUniform> = {}
  public get uniqueUniforms() { return this._uniqueUniforms }
  public get processedFragmentShader() { return this.fragmentShader}
  public get processedVertexShader() { return this.vertexShader}
  public get processedFragmentVariables() { return this.fragmentVariables}
  public get processedVertexVariables() { return this.vertexVariables}

  constructor(
    props?: LayerProps | null, 
  ){
    this.initialize(props)
    this.buildUniforms(props)
    this.buildShaders() 
  }

  private initialize(props: LayerProps){
    const definition = this.definition
    this.name = definition.name
    this.mode = props.mode ?? "normal"
    this.visible = props.visible ?? true
  }


  private buildUniforms(props: LayerProps){
    const definition = this.definition

    Object.entries(definition.uniforms).forEach(([_uniformKey, _uniform]) => {
      let value = props[_uniformKey] ?? _uniform.default

      if(isSerializableType(value) || value instanceof THREE.Color)
        value = value.clone()

      // For example
      // u_090b89a7_ab54_42f0_aac9_3ce2a63386c1_near
      const _uniqueUniformKey = `u_${this.uuid}_${_uniformKey}`
      
      const threeUniformObj = new THREE.Uniform(getUniform(value))

      this._uniqueUniforms[_uniqueUniformKey] = threeUniformObj;
      this.uniforms[_uniformKey] = threeUniformObj;
    })
  }

  protected buildShaders() {
    const definition = this.definition

    const defFragmentShader = definition.fragmentShader ?? ""
    const defVertexShader = definition.vertexShader ?? ""

    const tokens = {
      vert: tokenize(defVertexShader || ''),
      frag: tokenize(defFragmentShader || ''),
    }

    const descoped = {
      vert: descope(tokens.vert, this._renameTokens.bind(this)),
      frag: descope(tokens.frag, this._renameTokens.bind(this)),
    }

    const funcs = {
      vert: tokenFunctions(descoped.vert),
      frag: tokenFunctions(descoped.frag),
    }

    const mainIndex = {
      vert: funcs.vert
        .map((e: any) => {
          return e.name
        })
        .indexOf('main'),
      frag: funcs.frag
        .map((e: any) => {
          return e.name
        })
        .indexOf('main'),
    }

    const variables = {
      vert: mainIndex.vert >= 0 ? stringify(descoped.vert.slice(0, funcs.vert[mainIndex.vert].outer[0])) : '',
      frag: mainIndex.frag >= 0 ? stringify(descoped.frag.slice(0, funcs.frag[mainIndex.frag].outer[0])) : '',
    }

    const funcBodies = {
      vert: mainIndex.vert >= 0 ? this.getShaderFromIndex(descoped.vert, funcs.vert[mainIndex.vert].body) : '',
      frag: mainIndex.frag >= 0 ? this.getShaderFromIndex(descoped.frag, funcs.frag[mainIndex.frag].body) : '',
    }

    this.vertexShader = this.processFinal(funcBodies.vert, true)
    this.fragmentShader = this.processFinal(funcBodies.frag)
    this.vertexVariables = variables.vert
    this.fragmentVariables = variables.frag
  }


  private _renameTokens(name: string) {
    if (name.startsWith('u_')) {
      const slice = name.slice(2)
      return `u_${this.uuid}_${slice}`
    } else if (name.startsWith('v_')) {
      const slice = name.slice(2)
      return `v_${this.uuid}_${slice}`
    } else if (name.startsWith('f_')) {
      const slice = name.slice(2)
      return `f_${this.uuid}_${slice}`
    } else {
      return name
    }
  }

  private processFinal(shader: string, isVertex?: boolean) {
    const s: string = shader.replace(/\sf_/gm, ` f_${this.uuid}_`).replace(/\(f_/gm, `(f_${this.uuid}_`)

    const returnValue = s.match(/^.*return.*$/gm)
    let sReplaced = s.replace(/^.*return.*$/gm, '')

    if (returnValue?.[0]) {
      const returnVariable = returnValue[0].replace('return', '').trim().replace(';', '')

      const blendMode = this.getBlendMode(returnVariable, 'lamina_finalColor')
      sReplaced += isVertex ? `lamina_finalPosition = ${returnVariable};` : `lamina_finalColor = ${blendMode};`
    }

    return sReplaced
  }

  private getShaderFromIndex(tokens: any, index: number[]) {
    return stringify(tokens.slice(index[0], index[1]))
  }

  private getBlendMode(b: string, a: string) {
    switch (this.mode) {
      default:
      case 'normal':
        return `lamina_blend_alpha(${a}, ${b}, ${b}.a)`
      case 'add':
        return `lamina_blend_add(${a}, ${b}, ${b}.a)`
      case 'subtract':
        return `lamina_blend_subtract(${a}, ${b}, ${b}.a)`
      case 'multiply':
        return `lamina_blend_multiply(${a}, ${b}, ${b}.a)`
      case 'lighten':
        return `lamina_blend_lighten(${a}, ${b}, ${b}.a)`
      case 'darken':
        return `lamina_blend_darken(${a}, ${b}, ${b}.a)`
      case 'divide':
        return `lamina_blend_divide(${a}, ${b}, ${b}.a)`
      case 'overlay':
        return `lamina_blend_overlay(${a}, ${b}, ${b}.a)`
      case 'screen':
        return `lamina_blend_screen(${a}, ${b}, ${b}.a)`
      case 'softlight':
        return `lamina_blend_softlight(${a}, ${b}, ${b}.a)`
      case 'reflect':
        return `lamina_blend_reflect(${a}, ${b}, ${b}.a)`
      case 'negation':
        return `lamina_blend_negation(${a}, ${b}, ${b}.a)`
    }
  }
}
