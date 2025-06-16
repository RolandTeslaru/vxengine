import { ISetting, TrackSideEffectCallback } from "@vxengine/AnimationEngine/types/engine";
import { Object3D } from "three";

export interface VXThreeElementWrapperProps {
    type: string;
    children: React.ReactNode;
    vxkey: string;
}

export type VXPrimitiveProps = {
    vxkey: string;
    modifyObjectTree?: boolean
    icon?: string
    settings?: VXObjectSettings
    overrideNodeTreeParentKey?: string
    params?: VXElementParams
    name?: string
    disabledParams?: string[]
    type?: "entity" | "effect" | "htmlElement" | "virtualEntity"
}

export type VXElementProps<T> = T & VXPrimitiveProps

export type VXElementPropsWithoutRef<T> = VXElementProps<Omit<T, "ref">> 

export type VXBaseInputType = {
    type: string,
    sideEffect?: TrackSideEffectCallback
    title?: string
    propertyPath: string
    propInitializeName?: string // prop name for the underlyng threejs instance object when it is created
}
export type VXNumberInputType = VXBaseInputType & {
    type: "number"
    min?: number
    max?: number
    step?: number
}

export type VXSliderInputType = VXBaseInputType & {
    type: "slider"
    min: number
    max: number
    step?: number
}


export type VXColorInputType = VXBaseInputType & {
    type: "color",
}

export type VXElementParam = VXNumberInputType | VXSliderInputType | VXColorInputType;

export type VXElementParams = VXElementParam[]

export type VXObjectSettings = Record<string, ISetting>