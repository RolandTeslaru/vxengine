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
    name: string
}


export type vxObjectProps = vxEffectProps 
    | vxKeyframeNodeProps 
    | vxKeyframeNodeProps 
    | vxEntityProps 
    | vxSplineNodeProps 
    | vxVirtualEntityProps

export interface ObjectStoreStateProps {
    objects: Record<string, vxObjectProps>
    addObject: (object: vxObjectProps) => void;
    removeObject: (vxkey: string) => void;
}