import { vxObjectProps } from "./objectStore";

type utilityObjectTypes = "keyframeNode" | "splineNode"

interface SelectedUtilityObject {
    utilObject: THREE.Object3D;  // The object being selected
    type: utilityObjectTypes;    // The type of the utility object
    keyframeKeys: string[];   // Array of keyframe keys
}

export interface ObjectEditorStoreProps {
    transformMode: "translate" | "rotate" | "scale";
    setTransformMode: (mode: "translate" | "rotate" | "scale") => void;
    selectedObjects: vxObjectProps[];
    selectedObjectKeys: string[];
    selectObjects: (vxkeys: string[]) => void;
    hoveredObject: vxObjectProps | null;
    setHoveredObject: (vxobject: vxObjectProps) => void;
    selectedUtilityObject: SelectedUtilityObject | undefined;
    setSelectedUtilityObject: (
        utilObject: THREE.Object3D,
        type: utilityObjectTypes,
        keyframeKeys: string[]
    ) => void;

    utilityTransformAxis: string[];
    setUtilityTransformAxis: (axis: string[]) => void;
}