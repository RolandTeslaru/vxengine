import { AnimationEngine } from "@vxengine/AnimationEngine/engine";
import { edObjectProps, IKeyframe, ISettings, ISpline, IStaticProps, ITimeline, ITrack, RawObjectProps, VXVector2 } from "@vxengine/AnimationEngine/types/track";
import { vxObjectProps } from "@vxengine/managers/ObjectManager/types/objectStore";
import { GroupedPaths } from "../store";

export interface TimelineEditorStoreProps {
    // Records of data used in the editor
    editorObjects: Record<string, edObjectProps>;
    tracks: Record<string, ITrack>,
    staticProps: Record<string, IStaticProps>
    keyframes: Record<string, IKeyframe>

    currentTimelineLength: number;
    setCurrentTimelineLength: (length: number) => void;

    groupedPaths: GroupedPaths

    collapsedGroups: Record<string, boolean>
    setCollapsedGroups: (groupKey: string) => void;

    scale: number;
    setScale: (count: number) => void;
    cursorTime: number;
    setCursorTime: (time: number) => void;
    activeTool: string;
    setActiveTool: (tool: string) => void;
    snap: boolean;
    setSnap: (value: boolean) => void;

    changes: number
    addChange: () => void

    searchQuery: string
    setSearchQuery: (query: string) => void

    setEditorData: (rawObjects: RawObjectProps[]) => void;
    
    selectedKeyframeKeys: string[];
    setSelectedKeyframeKeys: (keyframeKeys: string[]) => void;

    selectedTrackSegment: {
        firstKeyframeKey: string,
        secondKeyframeKey: string,
        trackKey: string,
    };
    setSelectedTrackSegment: (firstKeyframeKey: string, secondKeyframeKey: string, trackKey) => void;
    
    lastKeyframeSelectedIndex: number | null
    setLastKeyframeSelectedIndex: (newIndex: number) => void

    // Keyframe Controls
    moveToNextKeyframe: (trackKey: string) => void;
    moveToPreviousKeyframe: (trackKey: string) => void;

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

    createTrack: (trackKey: string, keyframeKeys?: string[]) => void
    removeTrack: (props: {trackKey: string, reRender: boolean}) => void

    // Keyframe functions
    createKeyframe: (props: {trackKey: string, value?: number, reRender?: boolean}) => void;
    removeKeyframe: (props: {trackKey: string, keyframeKey: string, reRender: boolean}) => void;
    setKeyframeTime: (keyframeKey: string, newTime: number, reRender?: boolean) => void;
    setKeyframeValue: (keyframeKey: string, newValue: number, reRender?: boolean) => void;
    setKeyframeHandles: (keyframeKey: string, trackKey: string, inHandle: VXVector2, outHandle: VXVector2, reRender?: boolean) => void;
    // StaticProp function
    createStaticProp: (props: {vxkey: string, propertyPath: string, value: number, reRender: boolean, state?: TimelineEditorStoreProps}) => void;
    removeStaticProp: (props: {staticPropKey: string, reRender?: boolean, state?: TimelineEditorStoreProps,}) => void
    setStaticPropValue: (staticPropKey: string, newValue: number, reRender?: boolean) => void;

    handlePropertyValueChange: (
        vxkey: string, 
        propertyPath: string, 
        newValue: number,
        reRender?: boolean
    ) => void

    removeProperty: (vxkey: string, propertyPath: string) => void;

}

export interface EditorObjectProps {
    vxkey: string; 
    trackKeys: string[]; 
    staticPropKeys: string[]
}
