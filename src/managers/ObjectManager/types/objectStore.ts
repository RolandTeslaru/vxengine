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
    parentKey: string;
}

export interface vxEntityProps extends BaseVxProps {
    type: "entity";
    name: string,
}
export interface vxVirtualEntityProps extends BaseVxProps {
    type: "virtualEntity";
    name: string,
}

export interface vxSpline extends BaseVxProps {
    type: "spline",
    objectVxKey: string // the vxkey for the object it is controlling
    name: string
}

export interface vxSplineNodeProps extends BaseVxProps {
    type: "splineNode";
    index: number
    splineKey: string
    name: string
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
    name: string
}


export type vxObjectProps = vxEffectProps 
    | vxKeyframeNodeProps 
    | vxKeyframeNodeProps 
    | vxEntityProps 
    | vxSplineNodeProps 
    | vxVirtualEntityProps
    | vxSpline

export interface ObjectStoreStateProps {
    objects: Record<string, vxObjectProps>
    addObject: (object: vxObjectProps, props?: { type?: string, addToTree?: boolean}) => void;
    removeObject: (vxkey: string) => void;
}