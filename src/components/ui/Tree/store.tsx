import { create } from "zustand"
import { TreeNodeDataType } from "./types"
import { CreateBranchFunctionType } from "@vxengine/managers/ObjectManager/utils/createPropertyTree"
import { createContext } from "react"

interface TreeState {
  expandedKeys: Record<string, boolean>
  setExpandedKeys: (expandedKeys: Record<string, boolean>) => void
  createBranchFn: CreateBranchFunctionType
  toggleExpand: (nodeKey: string, node: TreeNodeDataType) => void
}


// Factory function to create the store hook
export const createTreeStore = (
  defaultExpandedKeys: Record<string, boolean> = {},
  createBranchFn: CreateBranchFunctionType
) => create<TreeState>((set, get) => ({
  expandedKeys: defaultExpandedKeys,
  createBranchFn: createBranchFn, // Store the function passed from props

  setExpandedKeys: (keys) => set({ expandedKeys: keys }),

  toggleExpand: (nodeKey, node) => {
    const state = get();
    const isCurrentlyExpanded = state.expandedKeys[nodeKey] || false;

    if (!isCurrentlyExpanded && node.children === null && node.refObject) {
      // Use the stored createBranch function
      const loadedChildren = state.createBranchFn(node.key, node.currentPath, null);
      // Note: Directly mutating node.children like this outside of React state
      // can be problematic if the original `tree` prop structure is expected
      // to remain immutable. Consider how `createBranch` updates the tree data.
      // A potentially better approach might involve updating the tree structure
      // within the Zustand store itself, but that significantly increases complexity.
      // For now, we'll keep the mutation as it was, assuming `createBranch`
      // handles the necessary updates or the mutation is acceptable.
      node.children = loadedChildren; // Be mindful of this mutation
    }

    set((state) => ({
      expandedKeys: {
        ...state.expandedKeys,
        [nodeKey]: !isCurrentlyExpanded,
      },
    }));
  },
}));

export const TreeStoreContext = createContext<ReturnType<typeof createTreeStore> | null>(null);
