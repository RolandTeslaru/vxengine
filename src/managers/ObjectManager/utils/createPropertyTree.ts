import * as THREE from "three"
import { VXElementParam } from "@vxengine/vxobject/types";

export type ParamTreeNodeDataType = {
    key: string; // The name of the property
    children: Record<string, ParamTreeNodeDataType>; // Nested children
    param?: VXElementParam;
    rawObject: Record<string, any>
    currentPath: string
}

export type ParamTree = Record<string, ParamTreeNodeDataType>

const isValidValue = (value: any) =>
    typeof value === "number" || (value instanceof THREE.Color && value.isColor);

const getValueType = (value: any) => {
    if (typeof value === "number")
        return "number"
    else if (value instanceof THREE.Color || value.isColor)
        return "color"
}

export function createParamTreeLevel(
    obj: Record<string, any>,
    prefix = "",
    parentKey = ""
): Record<string, ParamTreeNodeDataType> {
    const tree: Record<string, ParamTreeNodeDataType> = {};

    for (const [key, value] of Object.entries(obj)) {
        const currentPath = prefix ? `${prefix}.${key}` : key;

        if (isValidValue(value)) {
            const propertyPath = currentPath
            tree[key] = {
                key,
                currentPath: currentPath,
                param: {
                    propertyPath,
                    type: getValueType(value),
                },
                rawObject: null,
                children: {} // Leaf nodes – no children to load
            };
        } else if (typeof value === "object" && value !== null) {
            // Instead of traversing further, mark as expandable
            tree[key] = {
                key,
                children: null, // Indicates children are not loaded yet
                rawObject: value, // Save the reference to load later
                currentPath: currentPath
            };
        }
    }

    return tree;
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