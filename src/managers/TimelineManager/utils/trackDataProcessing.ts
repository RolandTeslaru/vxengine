import { edObjectProps, ITrack, ITrackTreeNode, PathGroup, RawObjectProps, RawTrackProps } from "@vxengine/AnimationEngine/types/track";
import { useTimelineManagerAPI } from "../store";


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


//
// Build Track Tree
//




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