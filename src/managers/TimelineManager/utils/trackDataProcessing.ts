import { edObjectProps, ITrack, ITrackTreeNode, PathGroup, RawObjectProps, RawTrackProps } from "@vxengine/AnimationEngine/types/track";
import { useTimelineEditorAPI } from "../store";

export const precomputeRowIndices = (
    groupedPaths: Record<string, PathGroup>,
    currentRowIndex,
    prevRowIndex
): number => {
    Object.entries(groupedPaths).forEach(([key, group]) => {
        const childrenAllKeys = Object.keys(group.children);
        const isPath = group.children && childrenAllKeys.length > 0;
        const isNestedToPreviousPath = !(group.children && childrenAllKeys.length > 1)
        const isTrack = !isPath && group.trackKey;

        group.prevRowIndex = prevRowIndex;
        group.rowIndex = currentRowIndex;
        // group.nextRowIndex = isNestedToPreviousPath ? 1 : currentRowIndex + 1;
        // const isCollapsed = useTimelineEditorAPI.getState().collapsedGroups[groupKey] || false;


        if (isPath) {
            if (isNestedToPreviousPath) {
                group.nextRowIndex = prevRowIndex;
            }
            else {
                currentRowIndex += 1;
                group.nextRowIndex = currentRowIndex;
            }
            const childFinalIndex = precomputeRowIndices(group.children, currentRowIndex, group.rowIndex);
            group.localFinalTrackIndex = childFinalIndex;
            currentRowIndex = childFinalIndex + 1;
        } else if (isTrack) {
            group.nextRowIndex = currentRowIndex + 1;
            group.localFinalTrackIndex = group.nextRowIndex - 1;
            currentRowIndex = group.nextRowIndex;
        }
    });

    const allKeys = Object.keys(groupedPaths);

    return groupedPaths[allKeys[allKeys.length - 1]]?.localFinalTrackIndex || currentRowIndex;
};

// The trackKeys array from an edObject looks like this "RedBox.material.thing1.thign2"
// We need to remove the vxkey from the trackKey
export const extractDataFromTrackKey = (trackKey: string) => {
    const firstDotIndex = trackKey.indexOf('.');

    if (firstDotIndex === -1) {
        return { vxkey: trackKey, propertyPath: '' };
    }

    const vxkey = trackKey.substring(0, firstDotIndex);
    const propertyPath = trackKey.substring(firstDotIndex + 1);

    return { vxkey, propertyPath };
};

export const groupTracksByParent = (trackKeys: string[], trackRowIndex: number) => {
    const groupedPaths: Record<string, PathGroup> = {};

    trackKeys.forEach((trackKey) => {
        const { vxkey, propertyPath } = extractDataFromTrackKey(trackKey)
        const pathSegments = propertyPath.split('.');

        let currentGroup = groupedPaths;

        pathSegments.forEach((key, index) => {
            if (!currentGroup[key]) {
                currentGroup[key] = {
                    children: {},
                    trackKey: null,
                    isCollapsed: false,
                };
            }

            if (index === pathSegments.length - 1) {
                currentGroup[key].trackKey = trackKey;
            } else {
                currentGroup = currentGroup[key].children;
            }
        });
    });

    const childrenLength = Object.values(groupedPaths).length

    let finalIndex;
    // console.log(childrenLength, "Group Track By Parent ", groupedPaths)
    // Call precomputeRowIndices and return both grouped tracks and the final index
    if (childrenLength > 1)
        finalIndex = precomputeRowIndices(groupedPaths, trackRowIndex + 1, 0);
    else
        finalIndex = precomputeRowIndices(groupedPaths, trackRowIndex, 0);
    return { groupedPaths, finalIndex };
};


interface ComputedGroupData {
    groupedPaths: PathGroup,
    newIndex: number;
}

export const computeGroupPathFromRawObject = (
    edObject: edObjectProps,
    rowIndex: number
): ComputedGroupData => {
    const { trackKeys } = edObject;
    const { groupedPaths, finalIndex } = groupTracksByParent(trackKeys, rowIndex);

    const nextRowIndex = finalIndex + 1
    // Check if the object is empty basically
    if (Object.entries(groupedPaths).length === 0) {
        return { groupedPaths: null, newIndex: finalIndex }
    }

    const rootGroupedPaths: PathGroup = {
        rowIndex,
        prevRowIndex: null,
        nextRowIndex: nextRowIndex,
        children: groupedPaths,
        trackKey: null,
        isCollapsed: false,
        maxDepth: finalIndex - rowIndex + 1
    };

    return { groupedPaths: rootGroupedPaths, newIndex: nextRowIndex };
};

export const computeGroupPaths = (editorObjects: Record<string, edObjectProps>) => {
    let rowIndex = 0;
    const groupedPaths = {};

    Object.values(editorObjects).map((edObject: edObjectProps) => {
        const { groupedPaths: objGroupedPaths, newIndex } = computeGroupPathFromRawObject(edObject, rowIndex);
        rowIndex = newIndex;
        if (objGroupedPaths !== null)
            groupedPaths[edObject.vxkey] = objGroupedPaths;
    })

    return groupedPaths
}

export const buildTrackTree = (tracks: Record<string, ITrack>) => {
    const root: Record<string, ITrackTreeNode> = {};

    for (const key in tracks) {
        const path = key.split(".");
        let currentLevel = root;

        path.forEach((part, index) => {
            if (!currentLevel[part]) {
                currentLevel[part] = {
                    key: part,
                    children: {}
                }
            }

            if (index === path.length - 1) {
                currentLevel[part].track = key;
            }

            currentLevel = currentLevel[part].children;
        })
    }


    // Process merging single-child nodes recursively
    for (const key in root) {
        root[key] = mergeSingleChildNodes(root[key]);
    }

    return root;
}

function mergeSingleChildNodes(node: ITrackTreeNode): ITrackTreeNode {
    while (node.children && Object.keys(node.children).length === 1) {
        const childKey = Object.keys(node.children)[0];
        const child = node.children[childKey];
        node.key = `${node.key}.${child.key}`;
        node.children = child.children;
        if (child.track) {
            node.track = child.track;
        }
    }

    if (node.children) {
        for (const key in node.children) {
            node.children[key] = mergeSingleChildNodes(node.children[key]);
        }
    }
    return node;
}