export type vxObjectTypes = "object" | "effect" | "splineNode" | "keyframeNode"

export interface BaseVxProps {
    ref: React.MutableRefObject<any>
    vxkey: string
    params?: string[]
    disabledParams?: string[]
}

export interface vxEntityProps extends BaseVxProps {
    type: "object";
    name: string,

}

export interface vxSplineNodeProps extends BaseVxProps {
    type: "splineNode";
    index: number
    splineKey: string
}
export interface vxKeyframeNodeProps extends BaseVxProps {
    type: "keyframeNode"
    data: {
        keyframeKeys: string[] | string
    }
}

export interface vxEffectProps extends BaseVxProps {
    type: "effect";
    name: string
}


export type vxObjectProps = vxEffectProps | vxKeyframeNodeProps | vxKeyframeNodeProps | vxEntityProps | vxSplineNodeProps

export interface ObjectStoreStateProps {
    objects: Record<string, vxObjectProps>
    addObject: (object: vxObjectProps) => void;
    removeObject: (vxkey: string) => void;
}