import React from "react"

export interface UtilityNodeProps {
    type: "keyframe" | "spline"
    ref:    THREE.Object3D | null
    data: KeyframeNodeDataProps
}

export interface KeyframeNodeDataProps {
    keyframeKeys: string[];
}

export interface SplineNodeDataProps {
    
}