import { ParamTreeNodeDataType } from "./createPropertyTree";

export const filterParamTree = (
    tree: Record<string, ParamTreeNodeDataType> | null,
    query: string
  ): Record<string, ParamTreeNodeDataType> => {
    if (!tree) return null; // Return an empty object if tree is null
  
    const result: Record<string, ParamTreeNodeDataType> = {};
  
    Object.entries(tree).forEach(([key, node]) => {
      if (!node.key) return;
      const isMatch = node.key.toLowerCase().includes(query.toLowerCase());
      const filteredChildren = filterParamTree(node.children, query);
  
      if (isMatch || (!!filteredChildren && Object.keys(filteredChildren).length > 0)) {
        result[key] = {
          ...node,
          children: filteredChildren,
        };
      }
    });
  
    return result;
  };