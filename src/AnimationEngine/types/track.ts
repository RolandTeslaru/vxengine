import * as THREE from "three"

export interface ITimeline {
    name: string;        
    id: string;          
    objects: RawObjectProps[]
}

export interface ITrack {
    vxkey: string,
    propertyPath: string;
    keyframes: string[];
}
export interface IStaticProps {
    vxkey: string
    propertyPath: string;
    value: number;
}

export interface IKeyframe {
    id: string
    vxkey: string,
    propertyPath: string,
    time: number; 
    value: number | THREE.Vector3; 
    handles?: [number, number, number, number]; 
}
export interface PathGroup {
    children: Record<string, PathGroup>;
    trackKey?: string | null
    rowIndex?: number;
    prevRowIndex?: number;
    nextRowIndex?: number;
    localFinalTrackIndex?: number;
    isCollapsed: boolean
}
// Editor Data Object
export interface edObjectProps {
    vxkey: string;
    trackKeys: string[],
    staticPropKeys: string[]
}

export interface RawObjectProps {
    vxkey: string,
    tracks: RawTrackProps[]
    staticProps: IStaticProps[]
}

export interface RawTrackProps {
    keyframes:  IKeyframe[],
    propertyPath: string,
}

export interface RawStaticPropProps {
    value: number;
    propertyPath: string,
}