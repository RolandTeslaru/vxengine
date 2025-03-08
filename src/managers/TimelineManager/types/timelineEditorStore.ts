import { EditorTrack, EditorTrackTreeNode } from "@vxengine/types/data/editorData";
import { SelectedKeyframe } from "./store";

export interface TimelineEditorAPIProps {
    trackTree: Record<string, EditorTrackTreeNode>,

    scale: number;
    setScale: (value: number) => void;

    activeTool: string;
    setActiveTool: (tool: string) => void;

    snap: boolean;
    setSnap: (value: boolean) => void;

    searchQuery: string
    setSearchQuery: (query: string) => void

    clipboard: Record<string, Record<string, boolean>>,
    setClipboard: (content: Record<string, Record<string, boolean>>) => void


    selectedKeyframeKeys: Record<string, Record<string, boolean>>
    selectedKeyframesFlatMap: SelectedKeyframe[],
    selectKeyframe: (trackKey: string, keyframeKey: string) => void;
    removeSelectedKeyframe: (trackKey: string, keyframeKey: string) => void;
    clearSelectedKeyframes: () => void;
    isKeyframeSelected: (trackKey: string, keyframeKey: string) => boolean;

    selectedTrackSegment: {
        firstKeyframeKey: string,
        secondKeyframeKey: string,
        trackKey: string,
    };
    setSelectedTrackSegment: (firstKeyframeKey: string, secondKeyframeKey: string, trackKey) => void;

    lastKeyframeSelectedIndex: number | null
    setLastKeyframeSelectedIndex: (newIndex: number) => void

    // Keyframe Controls
    moveToNextKeyframe: (trackKey: string) => void;
    moveToPreviousKeyframe: (trackKey: string) => void;

    setTime: (time: number) => void;
    setTimeByPixel: (left: number) => void

    collapsedTrackNodes: Record<string, boolean>
    setCollapsedTrackNodes: (groupKey: string) => void;

    addObjectToTrackTree: (vxkey: string, tracks: Record<string, EditorTrack>) => void
    addTrackToTrackTree: (vxkey: string, propertyPath: string) => void
    removeTrackFromTrackTree: (vxkey: string, propertyPath: string) => void
    removeObjectFromTrackTree: (vxkey: string) => void
}
