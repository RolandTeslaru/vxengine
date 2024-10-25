import { vxObjectProps } from "./objectStore";

export interface ObjectEditorStoreProps {
    transformMode: "translate" | "rotate" | "scale";
    setTransformMode: (mode: "translate" | "rotate" | "scale") => void;

    selectedObjects: vxObjectProps[];
    selectedObjectKeys: string[];
    selectObjects: (vxkeys: string[]) => void;
    
    hoveredObject: vxObjectProps | null;
    setHoveredObject: (vxobject: vxObjectProps) => void;
}