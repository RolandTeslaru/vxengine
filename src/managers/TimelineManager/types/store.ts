import { AnimationEngine } from "@vxengine/AnimationEngine/engine";
import { edObjectProps, IKeyframe, ISettings, ISpline, IStaticProps, ITimeline, ITrack, RawObjectProps, VXVector2 } from "@vxengine/AnimationEngine/types/track";
import { vxObjectProps } from "@vxengine/types/objectStore";
import { GroupedPaths } from "../store";
import { RowRndApi } from "../components/row_rnd/row_rnd_interface";

export interface KeyframesPositionDataProps { 
    left: number
}

export interface TimelineEditorStoreProps {
    // Records of data used in the editor
    editorObjects: Record<string, edObjectProps>;
    tracks: Record<string, ITrack>,
    staticProps: Record<string, IStaticProps>
    keyframes: Record<string, IKeyframe>

    animationEngineRef: React.MutableRefObject<AnimationEngine | null>

    groupedPaths: GroupedPaths

    setCollapsedGroups: (groupKey: string) => void;

    scale: number;
    setScale: (count: number) => void;
    cursorTime: number;
    setCursorTime: (time: number) => void;
    width: number;
    setWidth: (width: number) => void;
    activeTool: string;
    setActiveTool: (tool: string) => void;
    snap: boolean;
    setSnap: (value: boolean) => void;
    scaleCount: number;
    setScaleCount: (count: number) => void;

    cursorThumbRef: React.MutableRefObject<RowRndApi | null>
    cursorLineRef: React.MutableRefObject<RowRndApi | null>

    scaleWidth: number
    scaleSplitCount: number
    changes: number
    addChange: () => void

    keyframesPositionData: Record<string, KeyframesPositionDataProps>

    scrollLeft: number;

    setEditorData: (rawObjects: RawObjectProps[]) => void;
    setScrollLeft: (scrollLeft: number) => void;
    scrollTop: number;
    setScrollTop: (scrollTop: number) => void;
    clientWidth: number;
    clientHeight: number;
    scrollHeight: number;

    selectedKeyframeKeys: string[];
    setSelectedKeyframeKeys: (keyframeKeys: string[]) => void;

    selectedTrackSegment: {
        firstKeyframeKey: string,
        secondKeyframeKey: string,
        trackKey: string,
    };
    setSelectedTrackSegment: (firstKeyframeKey: string, secondKeyframeKey: string, trackKey) => void;

    // Keyframe Controls
    moveToNextKeyframe: (keyframes: IKeyframe[]) => void;
    moveToPreviousKeyframe: (keyframes: IKeyframe[]) => void;

    // Getter functions
    getTrack: (trackKey: string) => ITrack | undefined,
    getStaticProp: (staticPropKey) => IStaticProps | undefined
    getKeyframe: (keyframeId: string) => IKeyframe | undefined

    getTracksForObject: (vxkey: string) => ITrack[] | [],
    getStaticPropsForObject: (vxkey: string) => IStaticProps[] | [],
    getKeyframesForTrack: (trackKey: string) => IKeyframe[] | [],

    addObjectToEditorData: (newVxObject: vxObjectProps) => void
    addKeyframeToTrack: (state: TimelineEditorStoreProps, keyframeKey: string, trackKey: string) => void
    
    makePropertyTracked: (staticPropKey: string, reRender?: boolean) => void
    makePropertyStatic: (trackKey: string, reRender?: boolean) => void
    // Keyframe functions
    createKeyframe: (trackKey: string, value?: number, reRender?: boolean) => void;
    removeKeyframe: (trackKey: string, keyframeKey: string, reRender?: boolean) => void;
    setKeyframeTime: (keyframeKey: string, newTime: number, reRender?: boolean) => void;
    setKeyframeValue: (keyframeKey: string, newValue: number, reRender?: boolean) => void;
    setKeyframeHandles: (keyframeKey: string, trackKey: string, inHandle: VXVector2, outHandle: VXVector2, reRender?: boolean) => void;
    // StaticProp function
    createStaticProp: (vxkey: string, propertyPath: string, value: number, reRender?: boolean) => void;

    setStaticPropValue: (staticPropKey: string, newValue: number, reRender?: boolean) => void;
    removeStaticProp: (staticPropKey: string, reRender?: boolean) => void

    handlePropertyValueChange: (
        vxkey: string, 
        propertyPath: string, 
        newValue: number,
        reRender?: boolean
    ) => void

}

export interface EditorObjectProps {
    vxkey: string; 
    trackKeys: string[]; 
    staticPropKeys: string[]
}
