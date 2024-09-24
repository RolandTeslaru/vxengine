import { create } from 'zustand';
import { MIN_SCALE_COUNT, START_CURSOR_TIME } from '@vxengine/AnimationEngine/interface/const';
import { useVXEngine } from '@vxengine/engine';
import { IKeyframe, IStaticProps, ITrack, PathGroup, RawObjectProps, edObjectProps } from '@vxengine/AnimationEngine/types/track';
import { ScrollSync } from 'react-virtualized';
import { createWithEqualityFn } from 'zustand/traditional';
import React from 'react';
import { handleSetCursor } from './utils/handleSetCursor';
import { AnimationEngine } from '@vxengine/AnimationEngine/engine';
import { useVXObjectStore } from "@vxengine/vxobject";
import { keyframes } from 'leva/dist/declarations/src/styles';
import { produce } from 'immer';
import { computeGroupPathFromRawObject, computeGroupPaths, extractDataFromTrackKey } from './utils/trackDataProcessing';
import { useObjectManagerStore, useObjectPropertyStore } from '../ObjectManager/store';
import { getNestedProperty } from '@vxengine/utils/nestedProperty';
import { parserPixelToTime } from './utils/deal_data';
import { vxObjectProps } from '@vxengine/types/objectStore';
import { EditorObjectProps, TimelineEditorStoreProps } from './types/store';
import { RowRndApi } from './components/row_rnd/row_rnd_interface';

export type GroupedPaths = Record<string, PathGroup>;


function processRawData(
    rawObjects: RawObjectProps[]
) {
    const editorData: Record<string, EditorObjectProps> = {};
    const tracks: Record<string, ITrack> = {};
    const staticProps: Record<string, IStaticProps> = {};
    const keyframes: Record<string, IKeyframe> = {};

    // Generate Editor Data Record
    rawObjects.forEach((rawObj) => {
        const trackKeys: string[] = [];
        const staticPropKeys: string[] = [];

        // Generate Track Record for rawObj
        rawObj.tracks.forEach((track) => {
            const keyframeIds: string[] = [];
            const trackKey = `${rawObj.vxkey}.${track.propertyPath}`;

            // Generate Keyframe Record for rawObj
            track.keyframes.forEach((kf) => {
                const keyframeId = kf.id || `keyframe-${Date.now()}`;
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
            trackKeys.push(trackKey);
            tracks[trackKey] = newTrack;
        });

        // Generate StaticProp Record for rawObj
        rawObj.staticProps.forEach((prop) => {
            const staticPropKey = `${rawObj.vxkey}.${prop.propertyPath}`;
            staticPropKeys.push(staticPropKey);

            const newStaticProp: IStaticProps = {
                vxkey: rawObj.vxkey,
                value: prop.value,
                propertyPath: prop.propertyPath
            };
            staticProps[staticPropKey] = newStaticProp;
        });

        editorData[rawObj.vxkey] = {
            vxkey: rawObj.vxkey,
            trackKeys: trackKeys,
            staticPropKeys: staticPropKeys,
        };
    });
    const groupedPaths = computeGroupPaths(editorData)

    return { editorData, tracks, staticProps, groupedPaths, keyframes };
}


export const useTimelineEditorAPI = createWithEqualityFn<TimelineEditorStoreProps>((set, get) => ({
    editorData: {},
    tracks: {},
    staticProps: {},
    groupedPaths: {},
    keyframes: {},

    animationEngineRef: React.createRef<AnimationEngine>(),

    setCollapsedGroups: (groupKey: string) => {
        set(produce((state: TimelineEditorStoreProps) => {
            const pathSegments = groupKey.split('/');
            let currentGroup: GroupedPaths | PathGroup = state.groupedPaths;

            // Bypass the root because currently currentGroup is of type GroupedPath
            const rootPath = pathSegments[0]
            // currentGroup is now PathGroup
            currentGroup = currentGroup[rootPath] as PathGroup;

            pathSegments.shift()
            pathSegments.forEach((segment) => {
                if (currentGroup.children[segment]) {
                    currentGroup = currentGroup.children[segment]
                }
            });

            if (currentGroup) {
                currentGroup.isCollapsed = !currentGroup.isCollapsed;
            }

        }), false);
    },

    setEditorData: (rawObjects: RawObjectProps[]) => {
        const { editorData, tracks, staticProps, groupedPaths, keyframes } = processRawData(rawObjects);
        set({
            editorData,
            tracks,
            staticProps,
            groupedPaths,
            keyframes
        });
    },

    scale: 1,
    scaleCount: MIN_SCALE_COUNT,
    cursorTime: START_CURSOR_TIME,
    width: Number.MAX_SAFE_INTEGER,

    activeTool: "mouse",
    snap: true,

    cursorThumbRef: null,
    cursorLineRef: null,

    scaleWidth: 160,
    scaleSplitCount: 10,
    changes: 0,

    clientHeight: 378,
    clientWidth: 490,
    scrollHeight: 270,


    selectedKeyframes: [],
    keyframesPositionData: {},



    scrollLeft: 0,
    scrollTop: 0,

    setScale: (count) => set({ scale: count }),
    setScaleCount: (count) => set({ scaleCount: count }),
    setWidth: (width) => set({ width }),
    setScrollLeft: (value) => set({ scrollLeft: Math.max(value, 0) }),
    setScrollTop: (scrollTop) => set({ scrollTop }),
    setActiveTool: (tool) => set({ activeTool: tool }),
    setSnap: (value) => set({ snap: value }),
    addChange: () => set((state) => ({ ...state, changes: state.changes + 1 })),
    setCursorTime: (time: number) => {
        set({ cursorTime: time });
    },

    selectedKeyframeKeys: [],
    setSelectedKeyframeKeys: (keyframeKeys: string[]) => set(produce((state: TimelineEditorStoreProps) => {
        state.selectedKeyframeKeys = keyframeKeys
    })),

    selectedTrackSegment: undefined,
    setSelectedTrackSegment : (firstKeyframeKey, secondKeyframeKey, trackKey) => set(produce((state: TimelineEditorStoreProps) => {
        state.selectedTrackSegment = {
            firstKeyframeKey: firstKeyframeKey,
            secondKeyframeKey :secondKeyframeKey,
            trackKey: trackKey
        }
    })),

    // Getter functions

    getTrack: (trackKey) => { return get().tracks[trackKey]; },
    getStaticProp: (staticPropKey) => { return get().staticProps[staticPropKey]; },
    getKeyframe: (keyframeId) => { return get().keyframes[keyframeId]; },

    getTracksForObject: (vxkey) => {
        const object = get().editorData[vxkey];
        if (object) {
            return object.trackKeys.map((trackKey: string) => get().tracks[trackKey]);
        }
        return [];
    },
    getStaticPropsForObject: (vxkey: string) => {
        const object = get().editorData[vxkey];
        if (object) {
            return object.staticPropKeys.map((staticPropKey: string) => get().staticProps[staticPropKey]);
        }
        return [];
    },
    getKeyframesForTrack: (trackKey) => {
        // console.log("Getting keyframe for track", trackKey)
        const track = get().tracks[trackKey];
        if (track) {
            return track.keyframes.map((id: string) => get().keyframes[id]);
        }
        return [];
    },

    // Cursor funcitons

    moveToNextKeyframe: (keyframes) => {
        const { cursorTime } = get();

        const sortedKeyframes = [...keyframes].sort((a, b) => a.time - b.time);

        const nextKeyframe = sortedKeyframes.find(kf => kf.time > cursorTime);

        if (nextKeyframe) {
            handleSetCursor({ time: nextKeyframe.time, });
        }
    },

    moveToPreviousKeyframe: (keyframes) => {
        const { cursorTime } = get();

        const sortedKeyframes = [...keyframes].sort((a, b) => a.time - b.time);

        const prevKeyframe = sortedKeyframes.reverse().find(kf => kf.time < cursorTime);

        if (prevKeyframe) {
            handleSetCursor({ time: prevKeyframe.time });
        }
    },

    // Writer functions

    addObjectToEditorData: (newVxObject: vxObjectProps) => {
        // Check if the object is already in the editorData.
        // it usually means it was added by the animationEngine when processing the raw data
        if (newVxObject.vxkey in get().editorData) {
            return
        }
        const newEdObject: EditorObjectProps = {
            vxkey: newVxObject.vxkey,
            trackKeys: [],
            staticPropKeys: []
        }
        set(produce((state: TimelineEditorStoreProps) => {
            state.editorData[newVxObject.vxkey] = newEdObject
        }))
    },

    addKeyframeToTrack: (state: TimelineEditorStoreProps, keyframeKey: string, trackKey: string) => {
        // console.log("Adding keyframe to track ", keyframeKey);
        const track = state.tracks[trackKey];

        if (track) {
            track.keyframes.push(keyframeKey);
        } else {
            console.error(`Track with key "${trackKey}" not found.`);
        }
    },

    createKeyframe: (trackKey, value, reRender = true) => {
        const { addChange, getTrack, addKeyframeToTrack, getKeyframesForTrack } = get();
        const { vxkey, propertyPath } = extractDataFromTrackKey(trackKey)

        const keyframeId = `keyframe-${Date.now()}`

        if (!value) {
            value = getNestedProperty(useVXObjectStore.getState().objects[vxkey].ref.current, propertyPath)
        }

        const newKeyframe: IKeyframe = {
            id: keyframeId,
            time: get().cursorTime,
            value: value,
            vxkey: vxkey,
            propertyPath: propertyPath,
            handles: {
                in: { x:0, y:0},
                out: { x:1, y:1 }
            },
        };

        const keyframes = getKeyframesForTrack(trackKey)

        set(produce((state: TimelineEditorStoreProps) => {
            state.keyframes[keyframeId] = newKeyframe;  // Add keyframe to Record
            let track = getTrack(trackKey)

            const isPropertyTracked = !!track;

            if (isPropertyTracked) {
                // Check if the cursor is on a keyframe that already exists
                const isCursorOnKeyframe = keyframes.some(kf => kf.time === get().cursorTime)
                if (isCursorOnKeyframe === false) {
                    addKeyframeToTrack(state, keyframeId, trackKey);
                }
            }
        }))
        const animationEngine = get().animationEngineRef.current
        // Refresh Raw Data and ReRender
        animationEngine.refreshKeyframe(trackKey, 'create', keyframeId, reRender)

        addChange();
    },

    removeKeyframe: (trackKey, keyframeKey, reRender = true) => {
        set(produce((state: TimelineEditorStoreProps) => {
            delete state.keyframes[keyframeKey]

            const track = state.tracks[trackKey]
            track.keyframes = track.keyframes.filter(kfKeys => kfKeys !== keyframeKey)
        }))

        const animationEngine = get().animationEngineRef.current
        if (!animationEngine) return

        animationEngine.refreshKeyframe(trackKey, "remove", keyframeKey, reRender)
    },

    makePropertyTracked: (staticPropKey, reRender) => {
        const { vxkey, propertyPath } = extractDataFromTrackKey(staticPropKey);
        const vxObjects = useVXObjectStore.getState().objects;
        set(produce((state: TimelineEditorStoreProps) => {
            const edObject = state.editorData[vxkey];

            const staticPropsForObject = state.getStaticPropsForObject(vxkey); // this will be filtered
            const staticProp = staticPropsForObject.find(prop => prop.propertyPath === propertyPath)

            const value = staticProp
                ? staticProp.value
                : getNestedProperty(vxObjects[vxkey].ref.current, propertyPath);

            // Remove static Prop Logic
            // Delete from Record
            delete state.staticProps[staticPropKey]

            // Delete from editorData vxobject
            edObject.staticPropKeys = edObject.staticPropKeys.filter((propKey) => propKey !== staticPropKey);

            // Handle Keyframe
            const keyframeId = `keyframe-${Date.now()}`
            const newKeyframe: IKeyframe = {
                id: keyframeId,
                time: get().cursorTime,
                value: value,
                vxkey: vxkey,
                propertyPath: propertyPath,
                handles: {
                    in: { x:0, y:0},
                    out: { x:1, y:1 }
                },
            };
            state.keyframes[keyframeId] = newKeyframe

            // Handle Track 
            const trackKey = staticPropKey;
            const newTrack: ITrack = {
                vxkey: vxkey,
                propertyPath: propertyPath,
                keyframes: [newKeyframe.id]
            }
            state.tracks[trackKey] = newTrack;
            edObject.trackKeys.push(trackKey)

            // Recompute grouped Paths for Visual 
            state.groupedPaths = computeGroupPaths(state.editorData)
        }))

        const animationEngine = get().animationEngineRef.current

        // Refresh Raw Data and ReRender
        animationEngine.refreshCurrentTimeline()
    },


    makePropertyStatic: (trackKey, reRender) => {
        const { vxkey, propertyPath } = extractDataFromTrackKey(trackKey);
        set(produce((state: TimelineEditorStoreProps) => {
            const edObject = state.editorData[vxkey];

            const tracksForObject = state.getTracksForObject(vxkey); // this will be filtered
            const vxObject = useVXObjectStore.getState().objects[vxkey]
            const value = getNestedProperty(vxObject.ref.current, propertyPath)

            // Remove the track Key from the edObject trackKetys string array
            const filteredTracksForObject = tracksForObject.filter(track => track.propertyPath !== track.propertyPath)
            edObject.trackKeys = filteredTracksForObject.map(track => `${vxkey}.${track.propertyPath}`)

            delete state.tracks[trackKey];

            // Handle StaticProp
            const staticPropKey = trackKey;
            const newStaticProp: IStaticProps = {
                vxkey: vxkey,
                propertyPath: propertyPath,
                value: value
            }
            state.staticProps[staticPropKey] = newStaticProp;
            edObject.staticPropKeys.push(staticPropKey)

            // Recompute grouped Paths for Visual 
            state.groupedPaths = computeGroupPaths(state.editorData)
        }))

        const animationEngine = get().animationEngineRef.current

        // Refresh Raw Data and ReRender
        animationEngine.refreshCurrentTimeline()
    },


    setKeyframeTime: (keyframeKey: string, newTime: number, reRender = true) => {
        set(produce((state: TimelineEditorStoreProps) => {
            state.keyframes[keyframeKey].time = newTime;
        }))

        const keyframe = get().keyframes[keyframeKey]
        const trackKey = `${keyframe.vxkey}.${keyframe.propertyPath}`;

        const animationEngine = get().animationEngineRef.current
        if (!animationEngine)
            return

        animationEngine.refreshKeyframe(trackKey, "update", keyframeKey, reRender)
    },


    setKeyframeValue: (keyframeKey, newValue, reRender = true) => {
        // console.log("TimelineEditorAPI: Setting", keyframeKey, " to value:", newValue)
        set(produce((state: TimelineEditorStoreProps) => {
            state.keyframes[keyframeKey].value = newValue;
        }))

        const keyframe = get().keyframes[keyframeKey]
        const trackKey = `${keyframe.vxkey}.${keyframe.propertyPath}`;

        // Refresh Keyframe
        const animationEngine = get().animationEngineRef.current
        if (!animationEngine)
            return

        animationEngine.refreshKeyframe(trackKey, "update", keyframeKey, reRender)
    },


    setKeyframeHandles: (keyframeKey, trackKey, inHandle, outHandle, reRender = true) => {
        set(produce((state: TimelineEditorStoreProps) => {
            state.keyframes[keyframeKey].handles = {
                in: inHandle,
                out: outHandle
            }
        }))

        // Refresh Keyframe
        const animationEngine = get().animationEngineRef.current
        if (!animationEngine)
            return

        animationEngine.refreshKeyframe(trackKey, "update", keyframeKey, reRender)
    },


    createStaticProp: (vxkey: string, propertyPath: string, value: number, reRender = true) => {
        const staticPropKey = `${vxkey}.${propertyPath}`
        // console.log("Creating StaticProp Key", staticPropKey)

        const newStaticProp: IStaticProps = {
            vxkey: vxkey,
            propertyPath: propertyPath,
            value: value
        }

        set(produce((state: TimelineEditorStoreProps) => {
            state.staticProps[staticPropKey] = newStaticProp;           // Add to Record
            state.editorData[vxkey].staticPropKeys.push(staticPropKey)  // Add to editorData
        }))

        const animationEngine = get().animationEngineRef.current
        if (!animationEngine)
            return

        animationEngine.refreshStaticProp("create", staticPropKey, reRender)
    },

    removeStaticProp: (staticPropKey: string) => {
        // console.log("Removing static Prop with key", staticPropKey)
        const { vxkey, propertyPath } = extractDataFromTrackKey(staticPropKey)
        set(produce((state: TimelineEditorStoreProps) => {
            // Delete from Record
            delete state.staticProps[staticPropKey]

            // Delete from editorData vxobject
            const edObject = state.editorData[vxkey];
            edObject.staticPropKeys = edObject.staticPropKeys.filter((propKey) => propKey !== staticPropKey);
        }))
    },

    setStaticPropValue: (staticPropKey: string, newValue: number, reRender = true) => {
        set(produce((state: TimelineEditorStoreProps) => {
            state.staticProps[staticPropKey].value = newValue;
        }))

        // Refresh Keyframe
        const animationEngine = get().animationEngineRef.current
        if (!animationEngine) return

        animationEngine.refreshStaticProp("update", staticPropKey, reRender)
    },

    handlePropertyValueChange: (vxkey, propertyPath, newValue, reRender = true) => {
        const state = get();
        const generalKey = `${vxkey}.${propertyPath}`;  // TrackKey or StaticPropKey
        const track = state.getTrack(generalKey);
        const isPropertyTracked = !!track;

        if (isPropertyTracked) {
            const trackKey = generalKey;
            const keyframes = state.getKeyframesForTrack(trackKey);

            // Check if the cursor is under any keyframe
            let targetedKeyframe: IKeyframe | undefined;
            keyframes.some(kf => {
                if (kf.time === state.cursorTime) {
                    targetedKeyframe = kf;
                    return true;  // Exit early once we find the keyframe
                }
                return false;
            });

            // if keyframe exists, update its value
            // else create a new keyframe at cursortime
            if (targetedKeyframe)
                state.setKeyframeValue(targetedKeyframe.id, newValue, reRender);
            else
                state.createKeyframe(trackKey, newValue, reRender);

        } else {
            const staticPropKey = generalKey;
            // Check if the static prop exists
            const staticProp = state.getStaticProp(staticPropKey);

            if (staticProp)
                state.setStaticPropValue(staticPropKey, newValue, reRender);
            else
                state.createStaticProp(vxkey, propertyPath, newValue, reRender);

        }

        useObjectPropertyStore.getState().updateProperty(vxkey, propertyPath, newValue);
    }

})
);