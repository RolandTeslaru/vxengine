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
}
export type VXNumberInputType = {
    type: "number"
}

export type VXSliderInputType = {
    type: "slider"
    min: number
    max: number
    step?: number
}

export interface VXColorInputType {
    type: "color",
    r?: number
    g?: number
    b?: number
}

export type VXParamInputType = VXNumberInputType | VXSliderInputType | VXColorInputType;

export type VXObjectParams = Record<string, VXParamInputType>