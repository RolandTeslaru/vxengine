import { TrackSideEffectCallback } from "@vxengine/AnimationEngine/types/engine";

export interface VXEntityWrapperProps {
    type: string;
    children: React.ReactNode;
    vxkey: string;
}

export type EditableObjectProps<T> = Omit<T, 'ref'> & {
    vxkey: string;
    ref?: React.Ref<unknown>;
    isVirtual?: boolean
    addToNodeTree?: boolean
    icon?: string
    settings?: {}
    additionalSettings?: {}
};


export type VXBaseInputType = {
    type: string,
    sideEffect?: TrackSideEffectCallback
    overwritePropertyPath?: string
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

export type VXObjectParam = VXNumberInputType | VXSliderInputType | VXColorInputType;

export type VXObjectParams = Record<string, VXObjectParam>