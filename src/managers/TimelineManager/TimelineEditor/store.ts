import { create } from "zustand";
import { useTimelineManagerAPI } from "..";
import { truncateToDecimals } from "../store";
import { parserPixelToTime, parserTimeToPixel } from "../utils/deal_data";
import { cursorStartLeft, handleCursorMutation } from "./components/TimelineArea/EditorCursor/utils";
import { produce } from "immer";
import { TimelineEditorAPIProps } from "../types/timelineEditorStore";
import animationEngineInstance from "@vxengine/singleton";
import { EditorTrack, EditorTrackTreeNode } from "@vxengine/types/data/editorData";

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
        set(
            produce((state: TimelineEditorAPIProps) => selectKeyframeLogic(state, trackKey, keyframeKey))
        )
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


    rebuildTrackTree: (tracks) => {
        set(produce((state: TimelineEditorAPIProps) => {
            state.trackTree = buildTrackTree(tracks)
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


export const buildTrackTree = (tracks: Record<string, EditorTrack>) => {
    const root: Record<string, EditorTrackTreeNode> = {};

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