import { AnimationEngine } from "@vxengine/AnimationEngine/engine";
import { vxObjectProps } from "@vxengine/managers/ObjectManager/types/objectStore";
import { EditorObject, EditorTrack, EditorStaticProp, EditorSpline, EditorKeyframe, EditorVector2, EditorKeyframeHandles } from "@vxengine/types/data/editorData";
import { RawObject, RawSpline } from "@vxengine/types/data/rawData";

export type SelectedKeyframe = {
    trackKey: string;
    keyframeKey: string;
    isSelected: boolean;
  };

export interface TimelineManagerAPIProps {
    // Records of data used in the editor
    editorObjects: Record<string, EditorObject>;
    tracks: Record<string, EditorTrack>,
    staticProps: Record<string, EditorStaticProp>
    splines: Record<string, EditorSpline>
    
    currentTimelineLength: number;
    setCurrentTimelineLength: (length: number) => void;

    changes: number,
    addChange: () => void

    setEditorData: (rawObjects: RawObject[], rawSplines: Record<string, RawSpline>, IS_DEVELOPMENT: boolean) => void;

    // Getter functions
    getAllKeyframes: () => EditorKeyframe[]
    getTracksForObject: (vxkey: string) => EditorTrack[] | [],
    getStaticPropsForObject: (vxkey: string) => EditorStaticProp[] | [],
    
    makePropertyTracked: (vxkey: string, propertyPath: string, reRender?: boolean) => void
    makePropertyStatic: (vxkey: string, propertPath: string, reRender?: boolean) => void

    createTrack: (props: {state?: TimelineManagerAPIProps, vxkey: string, propertyPath: string}) => void
    removeTrack: (props: {state?: TimelineManagerAPIProps, vxkey: string, propertyPath: string, reRender: boolean}) => void

    createSpline: (props: {vxkey: string}) => void
    removeSpline: (props: {vxkey: string}) => void
    insertNode: (props: {splineKey: string, index: number}) => void
    removeNode: (props: {splineKey: string, index: number}) => void
    setSplineNodePosition:(splineKey: string, nodeIndex: number, newPosition: {x: number, y:number, z:number}) => void;
    setSplineNodeAxisValue: (splineKey: string, nodeIndex: number, axis: "x" | "y" | "z",  newValue: number, reRender?: boolean) => void;
    
    // Keyframe functions
    createKeyframe: (props: {state?: TimelineManagerAPIProps, vxkey: string, propertyPath: string, value?: number, reRender?: boolean, handles?: EditorKeyframeHandles, time?: number, overlapKeyframeCheck?: boolean}) => void;
    removeKeyframe: (props: {state?: TimelineManagerAPIProps, keyframeKey: string, vxkey: string, propertyPath: string, reRender: boolean}) => void;
    setKeyframeTime: (keyframeKey: string, trackKey: string, newTime: number, keyframesMap: Map<string, HTMLElement>, trackSegementsMap: Map<string, HTMLElement>, reRender?: boolean) => void;
    setKeyframeValue: (keyframeKey: string, trackKey: string, newValue: number, reRender?: boolean, updateStore?: boolean) => void;
    setKeyframeHandles: (keyframeKey: string, trackKey: string, inHandle: EditorVector2, outHandle: EditorVector2, reRender?: boolean) => void;
    // StaticProp function
    createStaticProp: (props: {state?: TimelineManagerAPIProps, vxkey: string, propertyPath: string, value: number,reRender: boolean }) => void;
    removeStaticProp: (props: {state?: TimelineManagerAPIProps, vxkey: string, propertyPath: string, reRender?: boolean,}) => void
    setStaticPropValue: (staticPropKey: string, newValue: number, reRender?: boolean) => void;

    removeProperty: (vxkey: string, propertyPath: string, reRender?: boolean) => void;
}

