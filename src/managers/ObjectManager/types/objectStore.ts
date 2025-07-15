import { VXElementParams } from "@vxengine/vxobject/types"

export type vxObjectTypes = "entity" 
    | "effect" 
    | "splineNode" 
    | "keyframeNode" 
    | "virtualEntity"
    | "htmlElement"
    | "custom"

export interface BaseVxProps {
    ref: React.RefObject<any>
    vxkey: string
    params: VXElementParams
    disabledParams?: string[]
    name: string
    parentKeys: Set<string>;
    icon: string
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

export interface vxMaterialProps extends BaseVxProps {
    type: "material",
    parentMeshKeys: Set<string>
}

export interface vxSplineNodeProps extends BaseVxProps {
    type: "splineNode";
    index: number
    splineKey: string
}
export interface vxKeyframeNodeProps extends BaseVxProps {
    type: "keyframeNode",
    data: {
        axis: string[]
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
    | vxMaterialProps

export interface ObjectStoreStateProps {
    objects: Record<string, vxObjectProps>
}