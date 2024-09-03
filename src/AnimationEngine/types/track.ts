import * as THREE from "three"

export interface ITimeline {
    name: string;        
    id: string;          
    objects: edObjectProps[]
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

// Editor Data Object
export interface edObjectProps {
    vxkey: string;
    tracks: ITrack[];
    staticProps: IStaticProps[]
}