export interface RawProject {
    projectName: string
    timelines: Record<string, RawTimeline>
}

export interface RawTimeline {
    name: string;        
    id: string;          
    objects: RawObject[]
    splines: Record<string, RawSpline>
    length: number
}

export interface RawObject {
    vxkey: string,
    tracks: RawTrack[]
    staticProps: RawStaticProp[]
    settings: Record<string, boolean>
}

export interface RawTrack {
    keyframes:  RawKeyframe[],
    propertyPath: string,
}

export interface RawKeyframe {
    keyframeKey: string;
    time: number; 
    value: number;
    handles: [number, number, number, number] | number[]
}

export interface RawStaticProp {
    value: number;
    propertyPath: string,
}

export interface RawSpline {
    splineKey: string;
    vxkey: string;
    nodes: [ number, number, number][];
}