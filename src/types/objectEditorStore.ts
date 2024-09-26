import { vxObjectProps } from "./objectStore";
import { UtilityNodeProps } from "./utilityNode";

export interface ObjectEditorStoreProps {
    transformMode: "translate" | "rotate" | "scale";
    setTransformMode: (mode: "translate" | "rotate" | "scale") => void;

    selectedObjects: vxObjectProps[];
    selectedObjectKeys: string[];
    selectObjects: (vxkeys: string[]) => void;
    
    hoveredObject: vxObjectProps | null;
    setHoveredObject: (vxobject: vxObjectProps) => void;
    
    selectedUtilityNode: UtilityNodeProps;
    setSelectedUtilityNode: (utilityNodeKey: string) => void;

    utilityTransformAxis: string[];
    setUtilityTransformAxis: (axis: string[]) => void;

    utilityNodes: Record<string, UtilityNodeProps>
    addUtilityNode: (node: UtilityNodeProps, key: string) => void
    removeUtilityNode: (key: string) => void
}