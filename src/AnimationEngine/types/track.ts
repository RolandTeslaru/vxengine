import * as THREE from "three"

export interface ITimeline {
    name: string;        
    id: string;          
    tracks: ITrack[];
}

export interface ITrack {
    propertyPath: string;
    selected?: boolean;
    classNames?: string[];
    keyframes: IKeyframe[];
    vxkey: string;
}

export interface IKeyframe {
    id: string
    time: number; // The time (position) of the keyframe
    value?: number | THREE.Vector3; // The value of the property at this keyframe
    handles?: [number, number, number, number]; // Optional handles for bezier curves
}