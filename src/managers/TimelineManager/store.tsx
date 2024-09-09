import { create } from 'zustand';
import { MIN_SCALE_COUNT, START_CURSOR_TIME } from 'vxengine/AnimationEngine/interface/const';
import { useVXEngine } from 'vxengine/engine';
import { IKeyframe, IStaticProps, ITrack, PathGroup, RawObjectProps, edObjectProps } from 'vxengine/AnimationEngine/types/track';
import { ScrollSync } from 'react-virtualized';
import { createWithEqualityFn } from 'zustand/traditional';
import React from 'react';
import { handleSetCursor } from './utils/handleSetCursor';
import { AnimationEngine } from 'vxengine/AnimationEngine/engine';
import vx, { useVXObjectStore } from 'vxengine/store';
import { keyframes } from 'leva/dist/declarations/src/styles';
import { produce } from 'immer';
import { computeGroupDataForEdObject, groupTracksByParent } from './utils/trackDataProcessing';

export type GroupedPaths = Record<string, PathGroup>;

export interface TimelineEditorStoreProps {
    editorData: Record<string, edObjectProps>;
    tracks: Record<string, ITrack>,
    staticProps: Record<string, IStaticProps>
    keyframes: Record<string, IKeyframe>
    groupedPaths: GroupedPaths




    scale: number;
    setScale: (count: number) => void;
    cursorTime: number;
    setCursorTime: (time: number) => void;
    width: number;
    setWidth: (width: number) => void;
    activeTool: string;
    setActiveTool: (tool: string) => void;
    snap: boolean;
    setSnap: (value: boolean) => void;
    scaleCount: number;
    setScaleCount: (count: number) => void;
    editAreaRef: React.MutableRefObject<HTMLDivElement | null>
    trackListRef: React.MutableRefObject<HTMLDivElement | null>
    scaleWidth: number
    scaleSplitCount: number
    startLeft: number
    changes: number
    addChange: () => void
    editorRef: React.MutableRefObject<HTMLDivElement | null>
    cursorTimeRef: React.MutableRefObject<number>;

    scrollLeft: number;

    setEditorData: (rawObjects: RawObjectProps[]) => void;
    setScrollLeft: (scrollLeft: number) => void;
    scrollTop: number;
    setScrollTop: (scrollTop: number) => void;
    clientWidth: number;
    clientHeight: number;
    scrollHeight: number;

    collapsedGroups: Record<string, boolean>;
    setCollapsedGroups: (groupKey: string) => void;

    createNewKeyframe: (animationEngine: AnimationEngine, vxkey: string, propertyPath: string, value: number) => void;
    moveToNextKeyframe: (animationEngine: AnimationEngine, vxkey: string, propertyPath: string) => void;
    moveToPreviousKeyframe: (animationEngine: AnimationEngine, vxkey: string, propertyPath: string) => void;
    updateEditorDataProperty: (vxkey: string, propertyPath: string, value: number) => void


    getTrack: (vxkey: string, propertyPath: string) => ITrack | undefined,
    getStaticProp: (vxkey: string, propertyPath: string) => IStaticProps | undefined
    getKeyframe: (keyframeId: string) => IKeyframe | undefined
    getKeyframesForTrack: (vxkey: string, propertyPath: string) => IKeyframe[] | [],
    getTracksForObject: (vxkey: string) => ITrack[] | [],
    getStaticPropsForObject: (vxkey: string) => IStaticProps[] | [],
}

type SetState<T> = (partial: T | Partial<T> | ((state: T) => T | Partial<T>), replace?: boolean) => void;

export const updateEditorDataProperty = (
    set: SetState<TimelineEditorStoreProps>,
    vxkey: string,
    propertyPath: string,
    value: any
) => {
    set(
        produce((state: TimelineEditorStoreProps) => {
            if (!state.editorData[vxkey]) {
                state.editorData[vxkey] = {
                    vxkey: vxkey,
                    tracks: [],
                    staticProps: [],
                };
            }

            const keys = propertyPath.split(".");
            let target = state.editorData[vxkey];

            for (let i = 0; i < keys.length; i++) {
                if (!target[keys[i]]) target[keys[i]] = {};
                target = target[keys[i]];
            }

            target[keys[keys.length - 1]] = value;
        }),
        false
    );
};

function convertToNormalizedStructure(
    rawObjects: RawObjectProps[]
) {
    const editorData: Record<string, { vxkey: string; trackIds: string[]; staticPropIds: string[] }> = {};
    const tracks: Record<string, ITrack> = {};
    const staticProps: Record<string, IStaticProps> = {};
    const groupedPaths: Record<string, PathGroup> = {};
    const keyframes: Record<string, IKeyframe> = {};

    let rowIndex = 0;

    // Generate Editor Data Record
    rawObjects.forEach((rawObj) => {
        const trackIds: string[] = [];
        const staticPropIds: string[] = [];

        // Generate Track Record for rawObj
        rawObj.tracks.forEach((track) => {
            const keyframeIds: string[] = [];
            const trackKey = `${rawObj.vxkey}.${track.propertyPath}`;

            // Generate Keyframe Record for rawObj
            track.keyframes.forEach((kf) => {
                const keyframeId = kf.id || `keyframe-${Date.now()}-${Math.random()}`;
                const newKeyframe: IKeyframe = {
                    id: keyframeId,
                    vxkey: rawObj.vxkey,
                    propertyPath: track.propertyPath,
                    time: kf.time,
                    value: kf.value,
                    handles: kf.handles
                }
                keyframes[keyframeId] = newKeyframe
                keyframeIds.push(keyframeId);
            });

            const newTrack: ITrack = {
                keyframes: keyframeIds,
                propertyPath: track.propertyPath,
                vxkey: rawObj.vxkey,
            };
            trackIds.push(trackKey);
            tracks[trackKey] = newTrack;
        });

        // Generate StaticProp Record for rawObj
        rawObj.staticProps.forEach((prop) => {
            const staticPropKey = `${rawObj.vxkey}.static.${prop.propertyPath}`;
            staticPropIds.push(staticPropKey);

            const newStaticProp: IStaticProps = {
                vxkey: rawObj.vxkey,
                value: prop.value,
                propertyPath: prop.propertyPath
            };
            staticProps[staticPropKey] = newStaticProp;
        });

        editorData[rawObj.vxkey] = {
            vxkey: rawObj.vxkey,
            trackIds: trackIds,
            staticPropIds: staticPropIds,
        };

        const { groupedPaths: objGroupedPaths, newIndex } = computeGroupDataForEdObject(rawObj, rowIndex);
        rowIndex = newIndex;
        groupedPaths[rawObj.vxkey] = objGroupedPaths;
    });

    return { editorData, tracks, staticProps, groupedPaths, keyframes };
}


export const useTimelineEditorStore = createWithEqualityFn<TimelineEditorStoreProps>((set, get) => ({
    editorData: {},
    tracks: {},
    staticProps: {},
    groupedPaths: {},
    keyframes: {},

    setEditorData: (rawObjects: RawObjectProps[]) => {
        const { editorData, tracks, staticProps, groupedPaths } = convertToNormalizedStructure(rawObjects);
        set({
            editorData,
            tracks,
            staticProps,
            groupedPaths
        });
    },

    setGroupedPaths: (tracks, rowIndex) => {
        const { groupedPaths, finalIndex } = groupTracksByParent(tracks, rowIndex);

        set({ groupedPaths });
    },


    scale: 1,
    scaleCount: MIN_SCALE_COUNT,
    cursorTime: START_CURSOR_TIME,
    cursorTimeRef: (() => {
        const ref = React.createRef<number>();
        // @ts-expect-error
        ref.current = 0;
        return ref;
    })(),

    width: Number.MAX_SAFE_INTEGER,

    activeTool: "mouse",
    snap: true,
    editAreaRef: React.createRef<HTMLDivElement>(),
    trackListRef: React.createRef<HTMLDivElement>(),
    scaleWidth: 160,
    scaleSplitCount: 10,
    startLeft: 20,
    changes: 0,

    scrollLeft: 0,
    scrollTop: 0,
    clientHeight: 378,
    clientWidth: 490,
    scrollHeight: 270,

    selectedKeyframes: [],
    editorRef: React.createRef<HTMLDivElement>(),


    setScale: (count) => set({ scale: count }),
    setScaleCount: (count) => set({ scaleCount: count }),
    setWidth: (width) => set({ width }),
    setScrollLeft: (value) => set({ scrollLeft: Math.max(value, 0) }),
    setScrollTop: (scrollTop) => set({ scrollTop }),
    setActiveTool: (tool) => set({ activeTool: tool }),
    setSnap: (value) => set({ snap: value }),
    addChange: () => set((state) => ({ ...state, changes: state.changes + 1 })),
    setCursorTime: (time: number) => {
        get().cursorTimeRef.current = time;
        set({ cursorTime: time });
    },

    collapsedGroups: {},
    setCollapsedGroups: (groupKey: string) => {
        set(produce((state: TimelineEditorStoreProps) => {
            state.collapsedGroups[groupKey] = !state.collapsedGroups[groupKey];
        }), false);
    },

    updateEditorDataProperty: (vxkey, propertyPath, value) => {
        updateEditorDataProperty(set, vxkey, propertyPath, value);
    },

    // Getter functions

    getTrack: (vxkey, propertyPath) => {
        const trackKey = `${vxkey}.${propertyPath}`
        return useTimelineEditorStore.getState().tracks[trackKey];
    },

    getStaticProp: (vxkey, propertyPath) => {
        const staticPropKey = `${vxkey}.static.${propertyPath}`;
        return useTimelineEditorStore.getState().staticProps[staticPropKey];
    },

    getKeyframe: (keyframeId) => {
        return useTimelineEditorStore.getState().keyframes[keyframeId];
    },

    getKeyframesForTrack: (vxkey, propertyPath) => {
        const trackKey = `${vxkey}.${propertyPath}`;
        const track = useTimelineEditorStore.getState().tracks[trackKey];
        if (track) {
            return track.keyframes.map((id: string) => useTimelineEditorStore.getState().keyframes[id]);
        }
        return [];
    },

    getTracksForObject: (vxkey) => {
        const object = useTimelineEditorStore.getState().editorData[vxkey];
        if (object) {
            return object.trackIds.map((trackKey: string) => useTimelineEditorStore.getState().tracks[trackId]);
        }
        return [];
    },

    getStaticPropsForObject: (vxkey: string) => {
        const object = useTimelineEditorStore.getState().editorData[vxkey];
        if (object) {
            return object.staticPropIds.map((staticPropKey: string) => useTimelineEditorStore.getState().staticProps[staticPropId]);
        }
        return [];
    },

    createNewKeyframe: (animationEngine, vxkey, propertyPath, value) => {
        console.log("TimelineEditor: Creating New keyframe for vxkey", vxkey, " with propertyPath", propertyPath);

        const { cursorTimeRef, addChange, getTrack } = get();

        const newKeyframe: IKeyframe = {
            id: `keyframe-${Date.now()}`,
            time: cursorTimeRef.current,
            value: value
        };

        set(state => {
            // Create a new copy of editorData
            const updatedEditorData = produce(state.editorData, draft => {
                const edObject = draft[vxkey];
                let track = getTrack(vxkey, propertyPath);

                const isPropertyTracked = track !== undefined;
                const isPropertyStatic = !isPropertyTracked;

                if (isPropertyTracked) {
                    // Check if the track object or keyframes array is frozen or sealed
                    if (Object.isFrozen(track) || Object.isSealed(track)) {
                        track = {
                            ...track,
                            keyframes: [...track.keyframes], // Shallow copy to make the array mutable
                        };

                        // Update the draft with the new, mutable track
                        draft[vxkey].tracks = draft[vxkey].tracks.map(t =>
                            t.propertyPath === propertyPath ? track : t
                        );
                    }

                    const isCursorOnKeyframe = track.keyframes.some(kf => kf.time === cursorTimeRef.current);
                    if (!isCursorOnKeyframe) {
                        track.keyframes.push(newKeyframe); // This is where the error occurs
                    }
                } else if (isPropertyStatic) {
                    edObject.staticProps = edObject.staticProps.filter(prop => prop.propertyPath !== propertyPath);
                    track = {
                        propertyPath: propertyPath,
                        keyframes: [newKeyframe]
                    };
                    edObject.tracks.push(track);
                }
            });

            animationEngine.updateCurrentTimeline(updatedEditorData);

            return {
                ...state,
                editorData: updatedEditorData
            };
        });

        addChange();
    },
    moveToNextKeyframe: (animationEngine, vxkey, propertyPath) => {
        const { getTrack, cursorTime, setCursorTime, scale } = get();
        const track = getTrack(vxkey, propertyPath);

        if (track) {
            const nextKeyframe = track.keyframes.find(kf => kf.time > cursorTime);
            if (nextKeyframe) {
                handleSetCursor({
                    time: nextKeyframe.time,
                    animationEngine,
                    scale,
                    setCursorTime,
                });
            }
        }
    },

    moveToPreviousKeyframe: (animationEngine, vxkey, propertyPath) => {
        const { getTrack, cursorTime, setCursorTime, scale } = get();
        const track = getTrack(vxkey, propertyPath);

        if (track) {
            const prevKeyframe = [...track.keyframes].reverse().find(kf => kf.time < cursorTime);
            if (prevKeyframe) {
                handleSetCursor({
                    time: prevKeyframe.time,
                    animationEngine,
                    scale,
                    setCursorTime,
                });
            }
        }
    },
})
);