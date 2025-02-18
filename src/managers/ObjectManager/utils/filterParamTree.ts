import { ParamTreeNode } from "./createPropertyTree";

export const filterParamTree = (tree: Record<string, ParamTreeNode>, query: string): Record<string, ParamTreeNode> => {
    const result: Record<string, ParamTreeNode> = {};

    Object.entries(tree).forEach(([key, node]) => {
        if (!node.key) return
        const isMatch = node.key.toLowerCase().includes(query.toLowerCase());
        const filteredChildren = filterParamTree(node.children, query);

        if (isMatch || Object.keys(filteredChildren).length > 0) {
            result[key] = {
                ...node,
                children: filteredChildren,
            };
        }
    });

    return result;
};