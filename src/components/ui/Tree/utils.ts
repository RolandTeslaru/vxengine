import * as THREE from "three"
import { CreateNodeDataFnType, TreeNodeDataType, TreeNodeType } from "./types";

const isValidValue = (value: any) =>
    typeof value === "number" || (value instanceof THREE.Color && value.isColor);


export function createTree(
    refObject: Record<string, any>,
    prefix = "",
    parentKey = "",
    createNodeDataFn?: CreateNodeDataFnType,
): Record<string, TreeNodeType> {
    const node: TreeNodeDataType = {
        refObject,
        children: {},
        currentPath: prefix,
        key: parentKey
    }
    return createBranch(node, createNodeDataFn)
}

export function createBranch(
    parentNode: TreeNodeDataType,
    createNodeDataFn?: CreateNodeDataFnType,
): Record<string, TreeNodeType> {
    const tree: Record<string, TreeNodeType> = {};

    // Check if the parent node's path ends with ".uniforms"
    const isUniformParent = parentNode.key === 'uniforms' || parentNode.currentPath.endsWith(".uniforms");

    for (const [key, value] of Object.entries(parentNode.refObject)) {
        let currentPath = parentNode.currentPath ? `${parentNode.currentPath}.${key}` : key;

        // Check if it's a uniform object with a valid inner 'value'
        const isUniformObject = typeof value === "object" && value !== null && 'value' in value;

        if (isUniformParent && isUniformObject && isValidValue(value.value)) {
            currentPath = currentPath + ".value"
            // Create a leaf node for the uniform itself, using its .value property
            tree[`${key}.value`] = {
                key,
                currentPath, // Path is correct: e.g., uniforms.myUniform
                children: {}, // No children, this is the leaf
                data: (createNodeDataFn && createNodeDataFn({ key, currentPath, value: value.value, parentNode })),
                refObject: value.value, // Use the inner value
            };
        } else if (isValidValue(value)) { // Original check for simple valid values
            tree[key] = {
                key,
                currentPath,
                children: {},
                data: (createNodeDataFn && createNodeDataFn({key, currentPath, value, parentNode})),
                refObject: value,
            }
        } else if (typeof value === "object" && value !== null) { // Original check for other expandable objects
            // Mark as expandable
            tree[key] = {
                key,
                children: null, // Indicates children are not loaded yet
                currentPath,
                refObject: value,
                data: null // Data will be potentially loaded/created on expansion
            };
        }
        // Other types (e.g., primitives other than number, null) are ignored by default
    }

    return tree;
}