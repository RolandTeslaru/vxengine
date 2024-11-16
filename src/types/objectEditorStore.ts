import { vxObjectProps, vxObjectTypes } from "../managers/ObjectManager/types/objectStore";

export interface ObjectEditorStoreProps {
    transformMode: "translate" | "rotate" | "scale";
    setTransformMode: (mode: "translate" | "rotate" | "scale") => void;

    transformSpace: "world" | "local";
    setTransformSpace: (space: "world" | "local") => void;

    selectedObjects: vxObjectProps[];
    selectedObjectKeys: string[];
    selectObjects: (
        vxkeys: string[], 
        type?: vxObjectTypes,
        animate?: boolean
    ) => void;
    
    hoveredObject: vxObjectProps | null;
    setHoveredObject: (vxobject: vxObjectProps) => void;
}