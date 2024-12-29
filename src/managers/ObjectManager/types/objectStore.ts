export type vxObjectTypes = "entity" 
    | "effect" 
    | "splineNode" 
    | "keyframeNode" 
    | "virtualEntity"

export interface BaseVxProps {
    ref: React.MutableRefObject<any>
    vxkey: string
    params?: string[]
    disabledParams?: string[]
    name: string
    parentKey: string;
}

export interface vxEntityProps extends BaseVxProps {
    type: "entity";
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
    | vxEntityProps 
    | vxSplineNodeProps 
    | vxVirtualEntityProps
    | vxSplineProps

export interface ObjectStoreStateProps {
    objects: Record<string, vxObjectProps>
    addObject: (object: vxObjectProps, props?: { type?: string, addToTree?: boolean}) => void;
    removeObject: (vxkey: string) => void;
}