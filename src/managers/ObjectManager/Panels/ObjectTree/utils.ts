import { useAnimationEngineAPI } from "@vxengine/AnimationEngine";
import { ObjectTreeNodeProps } from "@vxengine/types/objectEditorStore";
import { useVXObjectStore } from "../../stores/objectStore";
import animationEngineInstance from "@vxengine/singleton";

export const filterTree = (tree: Record<string, ObjectTreeNodeProps>, query: string): Record<string, ObjectTreeNodeProps> => {
    const result: Record<string, ObjectTreeNodeProps> = {};

    Object.entries(tree).forEach(([vxkey, node]) => {
        const isMatch = node.name.toLowerCase().includes(query.toLowerCase());
        const filteredChildren = filterTree(node.children, query);

        if (isMatch || Object.keys(filteredChildren).length > 0) {
            result[vxkey] = {
                ...node,
                children: filteredChildren,
            };
        }
    });

    return result;
};

export const regeneratePropertySetters = (vxkey: string) => {
    const rawTimeline = useAnimationEngineAPI.getState().currentTimeline
    const rawObject = rawTimeline.objects.find(obj => obj.vxkey === vxkey)
    const vxObject = useVXObjectStore.getState().objects[vxkey]
    animationEngineInstance.propertyControlService.rebuildObjectPropertySetters(vxObject, rawObject)
}