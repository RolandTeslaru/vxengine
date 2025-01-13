import { AnimationEngine } from "@vxengine/AnimationEngine/engine";
import { edObjectProps, IKeyframe, ISettings, RawSpline, IStaticProps, ITimeline, ITrack, RawObjectProps, VXVector2, ISpline, ITrackTreeNode } from "@vxengine/AnimationEngine/types/track";
import { vxObjectProps } from "@vxengine/managers/ObjectManager/types/objectStore";
import { GroupedPaths } from "../store";

export type SelectedKeyframe = {
    trackKey: string;
    keyframeKey: string;
    isSelected: boolean;
  };

export interface TimelineEditorStoreProps {
    // Records of data used in the editor
    editorObjects: Record<string, edObjectProps>;
    tracks: Record<string, ITrack>,
    staticProps: Record<string, IStaticProps>
    splines: Record<string, ISpline>
    
    trackTree: Record<string, ITrackTreeNode>

    currentTimelineLength: number;
    setCurrentTimelineLength: (length: number) => void;

    collapsedTrackNodes: Record<string, boolean>
    setCollapsedTrackNodes: (groupKey: string) => void;

    setTime: (time: number) => void;
    setTimeByPixel: (left: number) => void;

    scale: number;
    setScale: (count: number) => void;
    activeTool: string;
    setActiveTool: (tool: string) => void;
    snap: boolean;
    setSnap: (value: boolean) => void;

    changes: number
    addChange: () => void

    searchQuery: string
    setSearchQuery: (query: string) => void

    setEditorData: (rawObjects: RawObjectProps[], rawSplines: Record<string, RawSpline>) => void;

    clipboard: Record<string, Record<string, boolean>>,
    setClipboard: (content: Record<string, Record<string, boolean>>) => void
    
    selectedKeyframeKeys: Record<string, Record<string, boolean>>
    selectedKeyframesFlatMap: SelectedKeyframe[],
    selectKeyframe: (trackKey: string, keyframeKey: string) => void;
    removeSelectedKeyframe: (trackKey: string, keyframeKey: string) => void;
    clearSelectedKeyframes: () => void;
    isKeyframeSelected: (trackKey: string, keyframeKey: string) => boolean;

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
    getAllKeyframes: () => IKeyframe[]

    getTracksForObject: (vxkey: string) => ITrack[] | [],
    getStaticPropsForObject: (vxkey: string) => IStaticProps[] | [],

    addObjectToEditorData: (newVxObject: vxObjectProps) => void
    
    makePropertyTracked: (staticPropKey: string, reRender?: boolean) => void
    makePropertyStatic: (trackKey: string, reRender?: boolean) => void

    createTrack: (trackKey: string) => void
    removeTrack: (props: {trackKey: string, reRender: boolean}) => void

    createSpline: (props: {vxkey: string}) => void
    removeSpline: (props: {vxkey: string}) => void
    insertNode: (props: {splineKey: string, index: number}) => void
    removeNode: (props: {splineKey: string, index: number}) => void
    setSplineNodePosition:(splineKey: string, nodeIndex: number, newPosition: {x: number, y:number, z:number}) => void;

    // Keyframe functions
    createKeyframe: (props: {trackKey: string, value?: number, reRender?: boolean}) => void;
    removeKeyframe: (props: {keyframeKey: string, trackKey: string, reRender: boolean}) => void;
    setKeyframeTime: (keyframeKey: string, trackKey: string, newTime: number, reRender?: boolean, mutateUI?: boolean) => void;
    setKeyframeValue: (keyframeKey: string, trackKey: string, newValue: number, reRender?: boolean) => void;
    setKeyframeHandles: (keyframeKey: string, trackKey: string, inHandle: VXVector2, outHandle: VXVector2, reRender?: boolean) => void;
    // StaticProp function
    createStaticProp: (props: {vxkey: string, propertyPath: string, value: number, reRender: boolean, state?: TimelineEditorStoreProps}) => void;
    removeStaticProp: (props: {staticPropKey: string, reRender?: boolean, state?: TimelineEditorStoreProps,}) => void
    setStaticPropValue: (staticPropKey: string, newValue: number, reRender?: boolean) => void;

    removeProperty: (vxkey: string, propertyPath: string) => void;

}

export interface EditorObjectProps {
    vxkey: string; 
    trackKeys: string[]; 
    staticPropKeys: string[]
}
