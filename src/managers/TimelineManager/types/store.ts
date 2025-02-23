import { AnimationEngine } from "@vxengine/AnimationEngine/engine";
import { vxObjectProps } from "@vxengine/managers/ObjectManager/types/objectStore";
import { EditorObject, EditorTrack, EditorStaticProp, EditorSpline, EditorKeyframe, EditorVector2 } from "@vxengine/types/data/editorData";
import { RawObject, RawSpline } from "@vxengine/types/data/rawData";

export type SelectedKeyframe = {
    trackKey: string;
    keyframeKey: string;
    isSelected: boolean;
  };

export interface TimelineMangerAPIProps {
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

    addObjectToEditorData: (newVxObject: vxObjectProps) => void
    removeObjectFromEditorData: (vxkey: string) => void
    
    makePropertyTracked: (staticPropKey: string, reRender?: boolean) => void
    makePropertyStatic: (trackKey: string, reRender?: boolean) => void

    createTrack: (trackKey: string) => void
    removeTrack: (props: {trackKey: string, reRender: boolean}) => void

    createSpline: (props: {vxkey: string}) => void
    removeSpline: (props: {vxkey: string}) => void
    insertNode: (props: {splineKey: string, index: number}) => void
    removeNode: (props: {splineKey: string, index: number}) => void
    setSplineNodePosition:(splineKey: string, nodeIndex: number, newPosition: {x: number, y:number, z:number}) => void;
    setSplineNodeAxisValue: (splineKey: string, nodeIndex: number, axis: "x" | "y" | "z",  newValue: number, reRender?: boolean) => void;
    
    // Keyframe functions
    createKeyframe: (props: {trackKey: string, value?: number, reRender?: boolean}) => void;
    removeKeyframe: (props: {keyframeKey: string, trackKey: string, reRender: boolean}) => void;
    setKeyframeTime: (keyframeKey: string, trackKey: string, newTime: number, reRender?: boolean, mutateUI?: boolean) => void;
    setKeyframeValue: (keyframeKey: string, trackKey: string, newValue: number, reRender?: boolean, updateStore?: boolean) => void;
    setKeyframeHandles: (keyframeKey: string, trackKey: string, inHandle: EditorVector2, outHandle: EditorVector2, reRender?: boolean) => void;
    // StaticProp function
    createStaticProp: (props: {vxkey: string, propertyPath: string, value: number,reRender: boolean }) => void;
    removeStaticProp: (props: {staticPropKey: string, reRender?: boolean,}) => void
    setStaticPropValue: (staticPropKey: string, newValue: number, reRender?: boolean) => void;

    removeProperty: (vxkey: string, propertyPath: string, reRender?: boolean) => void;
}

