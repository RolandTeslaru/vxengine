import { create } from "zustand";
import { useTimelineManagerAPI } from "..";
import { truncateToDecimals } from "../store";
import { parserPixelToTime, parserTimeToPixel } from "../utils/deal_data";
import { cursorStartLeft, handleCursorMutation } from "./components/TimelineArea/EditorCursor/utils";
import { produce } from "immer";
import { TimelineEditorAPIProps } from "../types/timelineEditorStore";
import animationEngineInstance from "@vxengine/singleton";
import { EditorTrack, EditorTrackTreeNode } from "@vxengine/types/data/editorData";
import { ONE_SECOND_UNIT_WIDTH } from "@vxengine/managers/constants";
import { createWithEqualityFn } from "zustand/traditional";
import { shallow } from "zustand/shallow";

export type SelectedKeyframe = {
    trackKey: string;
    keyframeKey: string;
    isSelected: boolean;
};

export const useTimelineEditorAPI = createWithEqualityFn<TimelineEditorAPIProps>()(
    (set, get) => ({
        trackTree: {},

        collapsedTrackNodes: {},
        setCollapsedTrackNodes: (nodeKey: string) => {
            set(produce((state: TimelineEditorAPIProps) => {
                const value = state.collapsedTrackNodes[nodeKey]
                state.collapsedTrackNodes[nodeKey] = !value
            }), false)
        },

        scale: 6,
        setScale: (value) => set({ scale: value }),

        activeTool: "mouse",
        setActiveTool: (tool) => set({ activeTool: tool }),

        snap: true,
        setSnap: (value) => set({ snap: value }),

        searchQuery: "",
        setSearchQuery: (query) => set({ searchQuery: query }),

        clipboard: {},
        setClipboard: (content) => set({ clipboard: content }),

        selectedKeyframeKeys: {},
        selectedKeyframesFlatMap: [],
        selectKeyframe: (trackKey, keyframeKey) => {
            set(produce((state: TimelineEditorAPIProps) => {
                selectKeyframeLogic(state, trackKey, keyframeKey)
            }))
        },
        removeSelectedKeyframe: (trackKey, keyframeKey) => {
            set(
                produce((state: TimelineEditorAPIProps) => {
                    if (!state.selectedKeyframeKeys[trackKey]) return;

                    delete state.selectedKeyframeKeys[trackKey][keyframeKey];
                    if (Object.entries(state.selectedKeyframeKeys[trackKey]).length === 0)
                        delete state.selectedKeyframeKeys[trackKey];

                    // Update the flat map using the reusable function
                    state.selectedKeyframesFlatMap = createFlatMap(state);
                })
            )
        },
        clearSelectedKeyframes: () => {
            set(
                produce((state: TimelineEditorAPIProps) => {
                    state.selectedKeyframeKeys = {};
                    state.selectedKeyframesFlatMap = [];
                })
            )
        },
        isKeyframeSelected: (trackKey, keyframeKey) => {
            return get().selectedKeyframeKeys[trackKey]?.[keyframeKey] ?? false
        },

        lastKeyframeSelectedIndex: null,
        setLastKeyframeSelectedIndex: (newIndex: number) => set({ lastKeyframeSelectedIndex: newIndex }),

        selectedTrackSegments: {},
        selectTrackSegment: (firstKeyframeKey, secondKeyframeKey, trackKey) => set(produce((state: TimelineEditorAPIProps) => {
            const trackSegment = {
                firstKeyframeKey: firstKeyframeKey,
                secondKeyframeKey: secondKeyframeKey,
                trackKey: trackKey
            }
            const segmentKey = `${firstKeyframeKey}.${secondKeyframeKey}`;
            state.selectedTrackSegments[segmentKey] = trackSegment
        })),
        unselectTrackSegment: (firstKeyframeKey, secondKeyframeKey) => {
            set(produce((state: TimelineEditorAPIProps) => {
                const segmentKey = `${firstKeyframeKey}.${secondKeyframeKey}`;
                delete state.selectedTrackSegments[segmentKey]
            }))

        },
        clearSelectedTrackSegments: () => {
            set(produce((state: TimelineEditorAPIProps) => {
                state.selectedTrackSegments = {};
            }))
        },

        // Cursor Functions

        setTime: (time, cursorLockOn = true) => {
            time = truncateToDecimals(time);

            animationEngineInstance.setCurrentTime(time, false);

            const cursorLeft = parserTimeToPixel(time, cursorStartLeft, get().scale);
            handleCursorMutation(cursorLeft);

            if (cursorLockOn)
                set(produce((state: TimelineEditorAPIProps) => {
                    state.cursorLockedOnTime = time;
                }))
        },

        cursorLockedOnTime: 0,

        setTimeByPixel: (left) => {
            let time = parserPixelToTime(left, cursorStartLeft)
            time = truncateToDecimals(time);


            animationEngineInstance.setCurrentTime(time, false);

            handleCursorMutation(left);
        },

        moveToNextKeyframe: (trackKey) => {
            const timelineManagerState = useTimelineManagerAPI.getState();
            const track = timelineManagerState.tracks[trackKey]
            if (!track) return

            const time = animationEngineInstance.currentTime

            const sortedKeyframes = Object.values(track.keyframes).sort((a, b) => a.time - b.time);

            const nextKeyframe = sortedKeyframes.find(kf => kf.time > time);

            if (nextKeyframe)
                get().setTime(nextKeyframe.time)
        },
        moveToPreviousKeyframe: (trackKey) => {
            const timelineManagerState = useTimelineManagerAPI.getState();
            const track = timelineManagerState.tracks[trackKey]
            if (!track) return

            const time = animationEngineInstance.currentTime

            const sortedKeyframes = Object.values(track.keyframes).sort((a, b) => a.time - b.time);

            const prevKeyframe = sortedKeyframes.reverse().find(kf => kf.time < time);

            if (prevKeyframe)
                get().setTime(prevKeyframe.time)
        },

        addObjectToTrackTree: (vxkey, tracks) => {
            if (Object.entries(tracks).length === 0)
                return

            set(produce((state: TimelineEditorAPIProps) => {
                const root = state.trackTree;

                for (const key in tracks) {
                    const path = key.split(".")
                    let currentLevel = root;

                    path.forEach((part, index) => {
                        if (!currentLevel[part]) {
                            currentLevel[part] = {
                                key: part,
                                children: {}
                            }
                        }

                        if (index === path.length - 1) {
                            currentLevel[part].track = key
                        }

                        currentLevel = currentLevel[part].children
                    })
                }

                for (const key in state.trackTree) {
                    state.trackTree[key] = mergeSingleChildNodes(state.trackTree[key])
                }
            }))
        },

        addTrackToTrackTree: ({ timelineManagerState, vxkey, propertyPath }) => {
            timelineManagerState = timelineManagerState ?? useTimelineManagerAPI.getState();
            const trackKey = `${vxkey}.${propertyPath}`

            const track = timelineManagerState.tracks[trackKey]
            if (!track) return

            set(produce((state: TimelineEditorAPIProps) => {
                // Collect all tracks for this vxkey, including the new one
                const tracksForObject = Object.keys(timelineManagerState.tracks)
                    .filter(key => key.startsWith(`${vxkey}.`));

                // Rebuild and set the track tree for vxkey
                state.trackTree[vxkey] = buildTrackTree(vxkey, tracksForObject);
            }));
        },

        removeTrackFromTrackTree: (vxkey, propertyPath) => {
            const trackKeyToRemove = `${vxkey}.${propertyPath}`

            set(produce((state: TimelineEditorAPIProps) => {
                const root = state.trackTree[vxkey];
                if (!root) return;

                let trackFoundAndRemoved = false
                // Step 1a: Check if the root node itself has the track
                if (root.track === trackKeyToRemove) {
                    root.track = undefined; // Remove track from root
                    trackFoundAndRemoved = true;
                    // Don't delete the root node yet, just remove its track reference.
                    // Cleanup logic below will handle pruning if necessary.
                } else {
                    // Step 1b: If not on root, search and remove the descendant node with the matching track
                    function removeNode(node: EditorTrackTreeNode): boolean { // Returns true if track was found and removed in this subtree
                        if (node.children) {
                            for (const key in node.children) {
                                const child = node.children[key];
                                if (child.track === trackKeyToRemove) {
                                    // Found the node holding the track, delete this child node entirely
                                    delete node.children[key];
                                    return true; // Found and removed
                                } else if (removeNode(child)) { // Recurse into children
                                    // If the recursive call removed the track, this branch is handled
                                    return true; // Found and removed in grandchild/descendant
                                }
                            }
                        }
                        return false; // Track not found in this subtree
                    }
                    trackFoundAndRemoved = removeNode(root);
                }

                // If track wasn't found anywhere in this tree, just return
                if (!trackFoundAndRemoved) return;


                // Step 2: Cleanup up nodes with no children and no track (bottom-up)
                // This function determines if a node itself should be removed by its parent
                function cleanupEmptyNodes(node: EditorTrackTreeNode): boolean { // Returns true if this node is now empty and should be deleted
                    if (node.children) {
                        // Recursively clean children first
                        for (const key in node.children) {
                            if (cleanupEmptyNodes(node.children[key])) { // If child should be deleted
                                delete node.children[key];
                            }
                        }
                        // Check if this node should now be deleted (empty children AND no track)
                        if (Object.keys(node.children).length === 0 && !node.track) {
                            return true; // Signal to parent that this node is empty
                        }
                    } else {
                        // Leaf node (or node that became a leaf after children cleanup):
                        // Check if it should be deleted (it has no track)
                        if (!node.track) {
                            return true; // Signal to parent that this node is empty
                        }
                    }
                    return false; // Keep this node
                }

                // Run cleanup. Check if the root node itself should be deleted based on the cleanup result.
                const shouldDeleteRoot = cleanupEmptyNodes(root);

                // Step 3: Remove the root from the state if cleanup indicated it's now empty
                if (shouldDeleteRoot) {
                    delete state.trackTree[vxkey];
                }

                // Step 4: Re-merge single child nodes for all remaining roots to maintain optimization.
                // This needs to happen regardless of whether the current root was deleted,
                // as the cleanup might have affected the structure.
                // The original code did this, so we preserve the behavior.
                for (const key in state.trackTree) {
                    // Ensure we don't try to merge a potentially deleted root (though the loop shouldn't include it)
                    if (state.trackTree[key]) {
                        state.trackTree[key] = mergeSingleChildNodes(state.trackTree[key])
                    }
                }
            }))
        },

        removeObjectFromTrackTree: (vxkey) => {
            set(produce((state: TimelineEditorAPIProps) => {
                delete state.trackTree[vxkey];
            }))
        }

    }), shallow
)

const createFlatMap = (state: TimelineEditorAPIProps): SelectedKeyframe[] => {
    const { selectedKeyframeKeys } = state;
    return Object.entries(selectedKeyframeKeys).reduce(
        (acc: SelectedKeyframe[], [trackKey, keyframeKeys]) => {
            Object.keys(keyframeKeys).forEach((keyframeKey) => {
                acc.push({
                    trackKey,
                    keyframeKey,
                    isSelected: keyframeKeys[keyframeKey],
                });
            });
            return acc;
        }, []);
};

function selectKeyframeLogic(state: TimelineEditorAPIProps, trackKey: string, keyframeKey: string) {
    if (!state.selectedKeyframeKeys[trackKey])
        state.selectedKeyframeKeys[trackKey] = {};

    state.selectedKeyframeKeys[trackKey][keyframeKey] = true;

    // Update the flat map using the reusable function
    state.selectedKeyframesFlatMap.push({
        trackKey,
        keyframeKey,
        isSelected: true
    })
}


function buildTrackTree(vxkey, tracksForObject) {
    // Initialize the root node with the object's vxkey
    const root = { key: vxkey, children: {} };

    // Build the unmerged tree from all tracks
    tracksForObject.forEach(trackKey => {
        const propertyPath = trackKey.slice(vxkey.length + 1); // Remove 'vxkey.' prefix
        const path = propertyPath.split(".");
        let currentLevel = root.children;
        path.forEach((part, index) => {
            if (!currentLevel[part]) {
                currentLevel[part] = {
                    key: part,
                    children: {}
                };
            }
            if (index === path.length - 1) {
                currentLevel[part].track = trackKey;
            }
            currentLevel = currentLevel[part].children;
        });
    });

    // Optimize the tree by merging single-child nodes
    return mergeSingleChildNodes(root);
}


function mergeSingleChildNodes(node: EditorTrackTreeNode): EditorTrackTreeNode {
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



export const selectKeyframeSTATIC = (trackKey: string, keyframeKey: string) => {
    useTimelineEditorAPI.setState(
        produce((state: TimelineEditorAPIProps) => selectKeyframeLogic(state, trackKey, keyframeKey))
    )
}


export const moveToNextKeyframeSTATIC = (trackKey: string) => {
    const timelineManagerAPIState = useTimelineManagerAPI.getState();
    const timelineEditorAPIState = useTimelineEditorAPI.getState();
    const track = timelineManagerAPIState.tracks[trackKey]
    if (!track) return

    const time = animationEngineInstance.currentTime

    const sortedKeyframes = Object.values(track.keyframes).sort((a, b) => a.time - b.time);

    const nextKeyframe = sortedKeyframes.find(kf => kf.time > time);

    if (nextKeyframe)
        timelineEditorAPIState.setTime(nextKeyframe.time)
}

export const moveToPreviousKeyframeSTATIC = (trackKey: string) => {
    const timelineManagerAPIState = useTimelineManagerAPI.getState();
    const timelineEditorAPIState = useTimelineEditorAPI.getState();
    const track = timelineManagerAPIState.tracks[trackKey]
    if (!track) return

    const time = animationEngineInstance.currentTime

    const sortedKeyframes = Object.values(track.keyframes).sort((a, b) => a.time - b.time);

    const prevKeyframe = sortedKeyframes.reverse().find(kf => kf.time < time);

    if (prevKeyframe)
        timelineEditorAPIState.setTime(prevKeyframe.time)
}