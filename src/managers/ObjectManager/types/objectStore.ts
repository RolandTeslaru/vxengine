import { VXElementParams } from "@vxengine/vxobject/types"

export type vxObjectTypes = "entity" 
    | "effect" 
    | "splineNode" 
    | "keyframeNode" 
    | "virtualEntity"

export interface BaseVxProps {
    ref: React.RefObject<any>
    vxkey: string
    params?: VXElementParams
    disabledParams?: string[]
    name: string
    parentKey: string;
}

export interface vxElementProps extends BaseVxProps {
    type: "entity";
}
export interface vxHtmlElementProps extends BaseVxProps {
    type: "htmlElement";
}
export interface vxVirtualEntityProps extends BaseVxProps {
    type: "virtualEntity";
}

export interface vxSplineProps extends BaseVxProps {
    type: "spline",
    objectVxKey: string // the vxkey for the object it is controlling
}

export interface vxSplineNodeProps extends BaseVxProps {
    type: "splineNode";
    index: number
    splineKey: string
}
export interface vxKeyframeNodeProps extends BaseVxProps {
    type: "keyframeNode",
    axis: string[]
    data: {
        keyframeKeys: string[] | string
    }
}

export interface vxEffectProps extends BaseVxProps {
    type: "effect";
}


export type vxObjectProps = vxEffectProps 
    | vxKeyframeNodeProps 
    | vxKeyframeNodeProps 
    | vxElementProps 
    | vxHtmlElementProps 
    | vxSplineNodeProps 
    | vxVirtualEntityProps
    | vxSplineProps

export interface ObjectStoreStateProps {
    objects: Record<string, vxObjectProps>
    addObject: (
        object: vxObjectProps,
        IS_DEVELOPMENT: boolean,
         props?: { icon?: string, addToTree?: boolean},
    ) => void;
    removeObject: (vxkey: string, IS_DEVELOPMENT: boolean) => void;
}