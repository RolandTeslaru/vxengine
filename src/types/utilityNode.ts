import React from "react"

export interface BaseUtilityNodeProps {
    ref: THREE.Object3D | null;
    nodeKey: string;
}

export interface KeyframeNodeProps extends BaseUtilityNodeProps {
    type: "keyframe";
    data: KeyframeNodeDataProps;  // Required for keyframe nodes
}

export interface SplineNodeProps extends BaseUtilityNodeProps {
    type: "spline";
    index: number; 
    splineKey: string
}

export type UtilityNodeProps = KeyframeNodeProps | SplineNodeProps;

export interface KeyframeNodeDataProps {
    keyframeKeys: string[];
}