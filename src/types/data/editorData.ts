import { PropertySideEffectType } from "@vxengine/AnimationEngine/types/PropertyControlService";

export interface EditorObject {
    vxkey: string;
    trackKeys: string[],
    staticPropKeys: string[]
}

export interface EditorTrack {
    vxkey: string,
    propertyPath: string;
    keyframes: Record<string, EditorKeyframe>;
    orderedKeyframeKeys: string[];
    sideEffect?: PropertySideEffectType
}

export interface EditorKeyframe {
    id: string
    vxkey: string,
    propertyPath: string,
    time: number; 
    value: number;
    handles: EditorKeyframeHandles
}

export interface EditorStaticProp {
    vxkey: string
    propertyPath: string;
    value: number;
}

export interface EditorSpline {
    splineKey: string; // the key for the spline, also used in the VXObjectStore, use this as a vxkey for accesiing it 
    vxkey: string; // the vxObject the spline is controlling
    nodes: [number, number, number][]
}

export interface EditorTrackTreeNode {
    key: string;
    children: Record<string, EditorTrackTreeNode>
    track?: string
}


export interface EditorVector2 {
    x: number;
    y: number;
}

export interface EditorVector3 { 
    x: number;
    y: number;
    z: number;
}

export interface EditorKeyframeHandles {
    in: EditorVector2,
    out: EditorVector2,
}