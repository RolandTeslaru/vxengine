import { AnimationEngine } from "../engine"

export type ParamSetterType = (newValue: number) => void

export type ParamSideEffectType =(
  animationEngine: AnimationEngine, 
  vxkey: string,
  propertyPath: string,
  object3DRef: any, 
  interpolatedValue: number
) => void

export type PropertyUpdateType = {
  vxkey: string
  propertyPath: string
  value: number
}