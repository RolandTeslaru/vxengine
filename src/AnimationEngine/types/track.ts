

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
    splines: Record<string, ISpline>
    settings: Record<string, ISettings>
    length: number
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

export interface ISettings{
    useSplinePath?: boolean;
    positionSplineKey?: string
}

export interface IAdditionalSettingsProps{
    showPositionPath?: boolean
    showHelper?: boolean
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

export interface ISpline {
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

