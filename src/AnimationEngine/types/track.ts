

export interface VXVector2 {
    x: number;
    y: number;
}

export interface VXVector3 { 
    x: number;
    y: number;
    z: number;
}

export interface ITimeline {
    name: string;        
    id: string;          
    objects: RawObjectProps[]
    splines: Record<string, RawSpline>
    settings: Record<string, ISettings>
    length: number
}

export interface ITrack {
    vxkey: string,
    propertyPath: string;
    keyframes: Record<string, IKeyframe>;
    orderedKeyframeKeys: string[]
}
export interface IStaticProps {
    vxkey: string
    propertyPath: string;
    value: number;
}

export interface ISettings{
    useSplinePath?: boolean;
    positionSplineKey?: string
}

export interface IAdditionalSettingsProps{
    showPositionPath?: boolean
    showHelper?: boolean
}

export interface ISpline {
    splineKey: string; // the key for the spline, also used in the VXObjectStore, use this as a vxkey for accesiing it 
    vxkey: string; // the vxObject the spline is controlling
    nodes: [number, number, number][]
}



export interface IKeyframe {
    id: string
    vxkey: string,
    propertyPath: string,
    time: number; 
    value: number;
    handles: {
        in: VXVector2,
        out: VXVector2,
    }
}

export interface RawSpline {
    splineKey: string;
    vxkey: string;
    nodes: [ number, number, number][];
}

export interface ISplineNode {
    position: VXVector3;
}

export interface ISplineKeyframeNode {
    percentage: number;
    keyframeKey: string;
}

export interface PathGroup {
    children: Record<string, PathGroup>;
    trackKey?: string | null
    rowIndex?: number;
    prevRowIndex?: number;
    nextRowIndex?: number;
    localFinalTrackIndex?: number;
    isCollapsed: boolean;
    maxDepth?: number
}

export interface ITrackTreeNode {
    key: string;
    children: Record<string, ITrackTreeNode>
    track?: string
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
    positionSplineKey?: string
}

export interface RawTrackProps {
    keyframes:  RawKeyframeProps[],
    propertyPath: string,
}

export interface RawKeyframeProps {
    id: string
    time: number; 
    value: number;
    handles: [number, number, number, number]
}

export interface RawStaticPropProps {
    value: number;
    propertyPath: string,
}

