import { create } from "zustand";
import { useTimelineManagerAPI } from "..";
import { truncateToDecimals } from "../store";
import { parserPixelToTime, parserTimeToPixel } from "../utils/deal_data";
import { cursorStartLeft, handleCursorMutation } from "./components/TimelineArea/EditorCursor/utils";
import { produce } from "immer";
import { TimelineEditorAPIProps } from "../types/timelineEditorStore";
import animationEngineInstance from "@vxengine/singleton";
import { EditorTrack, EditorTrackTreeNode } from "@vxengine/types/data/editorData";
import { TimelineMangerAPIProps } from "../types/store";

export type SelectedKeyframe = {
    trackKey: string;
    keyframeKey: string;
    isSelected: boolean;
};

export const useTimelineEditorAPI = create<TimelineEditorAPIProps>((set, get) => ({
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

    selectedTrackSegment: undefined,
    setSelectedTrackSegment: (firstKeyframeKey, secondKeyframeKey, trackKey) => set(produce((state: TimelineEditorAPIProps) => {
        state.selectedTrackSegment = {
            firstKeyframeKey: firstKeyframeKey,
            secondKeyframeKey: secondKeyframeKey,
            trackKey: trackKey
        }
    })),

    // Cursor Functions

    setTime: (time) => {
        time = truncateToDecimals(time);

        animationEngineInstance.setCurrentTime(time, false);

        const cursorLeft = parserTimeToPixel(time, cursorStartLeft, get().scale);
        handleCursorMutation(cursorLeft);
    },
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
        console.log(`Adding object ${vxkey} to track tree`)
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

    addTrackToTrackTree: (vxkey, propertyPath) => {
        const timelineMangerAPI = useTimelineManagerAPI.getState();
        const trackKey = `${vxkey}.${propertyPath}`

        const track = timelineMangerAPI.tracks[trackKey]
        if (!track) return

        set(produce((state: TimelineEditorAPIProps) => {
            // Collect all tracks for this vxkey, including the new one
            const tracksForObject = Object.keys(timelineMangerAPI.tracks)
                .filter(key => key.startsWith(`${vxkey}.`));
    
            // Rebuild and set the track tree for vxkey
            state.trackTree[vxkey] = buildTrackTree(vxkey, tracksForObject);
        }));
    },

    removeTrackFromTrackTree: (vxkey, propertyPath) => {
        const trackKeyToRemove = `${vxkey}.${propertyPath}`

        set(produce((state: TimelineEditorAPIProps) => {
            const root = state.trackTree[vxkey];
            if(!root) return;

            // Step 1: remove node with the matching track
            function removeNode(node: EditorTrackTreeNode){
                if(node.children){
                    for (const key in node.children){
                        const child = node.children[key];
                        if(child.track === trackKeyToRemove){
                            delete node.children[key];
                            return true;
                        } else if (removeNode(child)) {
                            return true
                        }
                    }
                }
            }
            removeNode(root);

            // Step 2: Cleanup up nodes with no children and no track
            function cleanupEmptyNodes(node: EditorTrackTreeNode){
                if(node.children){
                    for (const key in node.children)
                        if(cleanupEmptyNodes(node.children[key]))
                            delete node.children[key]

                    if(Object.keys(node.children).length === 0 && !node.track)
                        return true;
                    
                }
                return false;
            }

            cleanupEmptyNodes(root);

            // Step 3: Remove the root if it becomes empty and has no track
            if(Object.keys(root.children).length === 0 && !root.track)
                delete state.trackTree[vxkey]

            // Step 4: Re-merge all roots to maintain optimization
            for (const key in state.trackTree){
                state.trackTree[key] = mergeSingleChildNodes(state.trackTree[key])
            }
        }))
    },

    removeObjectFromTrackTree: (vxkey) => {
        console.log(`Removing object ${vxkey} from trackTree`)

        set(produce((state: TimelineEditorAPIProps) => {
            delete state.trackTree[vxkey];
        }))
    }

}))


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
    state.selectedKeyframesFlatMap = createFlatMap(state);
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