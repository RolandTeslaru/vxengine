import * as THREE from "three"

export type CreateNodeDataFnType = (key: string, currentPath: string, value: any) => Object

export interface TreeNodeType {
    key: string;
    currentPath: string;
    children: Record<string, TreeNodeType>;
    refObject: any
    data: null | any
}

const isValidValue = (value: any) =>
    typeof value === "number" || (value instanceof THREE.Color && value.isColor);

export function createBranch(
    obj: Record<string, any>,
    prefix = "",
    parentKey = "",
    createNodeDataFn?: CreateNodeDataFnType,
): Record<string, TreeNodeType> {
    const tree: Record<string, TreeNodeType> = {};

    for (const [key, value] of Object.entries(obj)) {
        const currentPath = prefix ? `${prefix}.${key}` : key;

        if (isValidValue(value)) {
            const data = createNodeDataFn ? createNodeDataFn(key, currentPath, value) : null
            tree[key] = {
                key,
                currentPath,
                children: {}, // Leaf nodes – no children to load,
                refObject: value,
                data
            };
        } else if (typeof value === "object" && value !== null) {
            // Instead of traversing further, mark as expandable
            tree[key] = {
                key,
                children: null, // Indicates children are not loaded yet
                currentPath: currentPath,
                refObject: value,
                data: null
            };
        }
    }

    return tree;
}