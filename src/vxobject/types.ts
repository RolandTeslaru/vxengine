import { ISetting, TrackSideEffectCallback } from "@vxengine/AnimationEngine/types/engine";
import { Object3D } from "three";

export interface VXThreeElementWrapperProps {
    type: string;
    children: React.ReactNode;
    vxkey: string;
}

export type VXPrimitiveProps = {
    vxkey: string;
    isVirtual?: boolean
    addToNodeTree?: boolean
    icon?: string
    settings?: VXObjectSettings
    overrideNodeTreeParentKey?: string
    params?: VXElementParams
    name?: string
}

export type VXElementProps<T> = T & VXPrimitiveProps

export type VXElementPropsWithoutRef<T> = VXElementProps<Omit<T, "ref">> 

export type VXBaseInputType = {
    type: string,
    sideEffect?: TrackSideEffectCallback
    title?: string
    propertyPath: string
}
export type VXNumberInputType = VXBaseInputType & {
    type: "number"
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