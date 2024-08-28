import * as THREE from "three"

export interface ITimeline {
    name: string;        
    id: string;          
    objects: { 
        vxkey: string;
        tracks: ITrack[];
        staticProps: IStaticProps[];
    }[]
}

export interface ITrack {
    propertyPath: string;
    keyframes: IKeyframe[];
}
export interface IStaticProps {
    name: string;
    propertyPath: string;
    value: number;
}

export interface IKeyframe {
    id: string
    time: number; 
    value?: number | THREE.Vector3; 
    handles?: [number, number, number, number]; 
}

export interface IEditorData {
    vxkey: string;
    tracks: ITrack[];
}[]