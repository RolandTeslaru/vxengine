import { vxObjectProps, vxObjectTypes } from "../managers/ObjectManager/types/objectStore";

export interface ObjectTreeNodeProps {
    key: string
    name: string;
    type: string;
    children: Record<string, ObjectTreeNodeProps>;
    isSelectable?: boolean
}


export interface ObjectManagerStoreProps {
    transformMode: "translate" | "rotate" | "scale";
    setTransformMode: (mode: "translate" | "rotate" | "scale") => void;

    transformSpace: "world" | "local";
    setTransformSpace: (space: "world" | "local") => void;

    selectedObjectKeys: string[];
    selectObject: (vxkey: string) => ObjectManagerStoreProps
    unselectObject: (vxkey: string) => ObjectManagerStoreProps
    clearSelectedObjects: () => ObjectManagerStoreProps

    hoveredObject: vxObjectProps | null;
    setHoveredObject: (vxobject: vxObjectProps) => void;

    tree: Record<string, ObjectTreeNodeProps>;
    pendingChildren: Record<string, ObjectTreeNodeProps>;
    addToTree: (vxobject: vxObjectProps, icon?: string) => void
    reattachTreeNode: (vxkey: string) => void
    removeFromTree: (vxkey: string) => void
}