import * as THREE from "three"
import { VXObjectParam } from "@vxengine/vxobject/types";

export interface ParamTreeNode {
    key: string; // The name of the property
    children: Record<string, ParamTreeNode>; // Nested children
    param: VXObjectParam
}

export type ParamTree = Record<string, ParamTreeNode>

const isValidValue = (value: any) =>
    typeof value === "number" || (value instanceof THREE.Color && value.isColor);

const getValueType = (value: any) => {
    if (typeof value === "number")
        return "number"
    else if (value instanceof THREE.Color || value.isColor)
        return "color"
}

export function createParamTree(
    obj: Record<string, any>,
    prefix = "",
    parentKey = "",
    visited = new WeakSet(), // Keep track of visited objects
    depth = 0,
    maxDepth = 10 // Limit the depth to prevent infinite recursion
): ParamTree {
    // Base case: Prevent too deep recursion
    if (depth > maxDepth) return {};

    // Check for circular references
    if (visited.has(obj)) {
        // @ts-expect-error
        return { circularReference: true };
    }

    // Mark this object as visited
    visited.add(obj);

    const tree: Record<string, any> = {};

    for (const [key, value] of Object.entries(obj)) {
        const fullKey = parentKey ? `${parentKey}.${key}` : key;

        if (isValidValue(value)) {
            // Add valid values as leaf nodes
            tree[key] = {
                key,
                param: {
                    propertyPath: `${prefix}.${fullKey}`,
                    type: getValueType(value)
                },
                children: {},
            };
        } else if (typeof value === "object" && value !== null) {
            // Recursively traverse child objects
            const children = createParamTree(value, prefix, fullKey, visited, depth + 1, maxDepth);
            if (Object.keys(children).length > 0) {
                tree[key] = { key, children };
            }
        }
    }

    // Remove the object from visited before returning to allow other branches to visit it
    visited.delete(obj);

    return tree;
}