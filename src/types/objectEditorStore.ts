import { StoredObjectProps } from "./objectStore";

export interface ObjectEditorStoreProps {
    transformMode: "translate" | "rotate" | "scale";
    setTransformMode: (mode: "translate" | "rotate" | "scale") => void;
    selectedObjects: StoredObjectProps[];
    selectedObjectKeys: string[];
    selectObjects: (vxkeys: string[]) => void;
    hoveredObject: StoredObjectProps | null;
    setHoveredObject: (obj: StoredObjectProps) => void;
}