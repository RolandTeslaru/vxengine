import * as THREE from "three"
import { VXElementParam } from "@vxengine/vxobject/types";

export type ParamTreeNodeDataType = {
    key: string; // The name of the property
    children: Record<string, ParamTreeNodeDataType>; // Nested children
    param?: VXElementParam;
    refObject: Record<string, any>
    currentPath: string
}

export const getValueType = (value: any) => {
    if(value === null || value === undefined) return ""
    if (typeof value === "number")
        return "number"
    else if (value instanceof THREE.Color || value.isColor)
        return "color"
}



export interface TreeNodeType {
    key: string;
    currentPath: string;
    children: Record<string, TreeNodeType>;
    refObject: any
    data: null | any
}