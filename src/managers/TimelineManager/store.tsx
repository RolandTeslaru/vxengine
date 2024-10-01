import { create } from 'zustand';
import { MIN_SCALE_COUNT, START_CURSOR_TIME } from '@vxengine/AnimationEngine/interface/const';
import { useVXEngine } from '@vxengine/engine';
import { IKeyframe, IStaticProps, ITimeline, ITrack, PathGroup, RawObjectProps, edObjectProps } from '@vxengine/AnimationEngine/types/track';
import { ScrollSync } from 'react-virtualized';
import { createWithEqualityFn } from 'zustand/traditional';
import React from 'react';
import { handleSetCursor } from './utils/handleSetCursor';
import { AnimationEngine } from '@vxengine/AnimationEngine/engine';
import { useVXObjectStore, vx } from "@vxengine/vxobject";
import { keyframes } from 'leva/dist/declarations/src/styles';
import { produce } from 'immer';
import { computeGroupPathFromRawObject, computeGroupPaths, extractDataFromTrackKey } from './utils/trackDataProcessing';
import { useObjectManagerAPI, useObjectPropertyAPI } from '../ObjectManager/store';
import { getNestedProperty } from '@vxengine/utils/nestedProperty';
import { parserPixelToTime } from './utils/deal_data';
import { vxObjectProps } from '@vxengine/types/objectStore';
import { EditorObjectProps, TimelineEditorStoreProps } from './types/store';
import { RowRndApi } from './components/row_rnd/row_rnd_interface';
import { useVXAnimationStore } from '@vxengine/AnimationEngine';

export type GroupedPaths = Record<string, PathGroup>;

const DEBUG_REFRESHER = true;

function processRawData(
    rawObjects: RawObjectProps[]
) {
    const editorObjects: Record<string, EditorObjectProps> = {};
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

        editorObjects[rawObj.vxkey] = {
            vxkey: rawObj.vxkey,
            trackKeys: trackKeys,
            staticPropKeys: staticPropKeys,
        };
    });
    const groupedPaths = computeGroupPaths(editorObjects)

    return { editorObjects, tracks, staticProps, groupedPaths, keyframes };
}

function removeStaticPropLogic(state: TimelineEditorStoreProps, staticPropKey: string) {
    const { vxkey, propertyPath } = extractDataFromTrackKey(staticPropKey)
    delete state.staticProps[staticPropKey] // Delete from record

    // Delete from editorObjects vxobject
    const edObject = state.editorObjects[vxkey];
    edObject.staticPropKeys = edObject.staticPropKeys.filter((propKey) => propKey !== staticPropKey);
}

function removeKeyframeLogic(state: TimelineEditorStoreProps, trackKey: string, keyframeKey: string) {
    delete state.keyframes[keyframeKey]

    const track = state.tracks[trackKey]
    track.keyframes = track.keyframes.filter(kfKeys => kfKeys !== keyframeKey)
}

function removeTrackLogic(state: TimelineEditorStoreProps, trackKey: string) {
    const { vxkey, propertyPath } = extractDataFromTrackKey(trackKey);
    const track = state.tracks[trackKey]

    // Remove all keyframes required by the track
    track.keyframes.forEach(keyframeKey => {
        removeKeyframeLogic(state, trackKey, keyframeKey)
    })

    delete state.tracks[trackKey]

    // Remove the track key from the editor object
    const trackKeys = state.editorObjects[vxkey].trackKeys.filter(key => key !== trackKey)
    state.editorObjects[vxkey].trackKeys = trackKeys;
}

function createKeyframeLogic(
    state: TimelineEditorStoreProps, 
    trackKey: string, 
    keyframeKey: string, 
    value?: number
) {
    const { vxkey, propertyPath } = extractDataFromTrackKey(trackKey)

    if (!value) {
        value = getNestedProperty(useVXObjectStore.getState().objects[vxkey].ref.current, propertyPath)
    }

    const newKeyframe: IKeyframe = {
        id: keyframeKey,
        time: state.cursorTime,
        value: value,
        vxkey: vxkey,
        propertyPath: propertyPath,
        handles: {
            in: { x: 0.7, y: 0.7 },
            out: { x: 0.3, y: 0.3 }
        },
    };

    const keyframes = state.getKeyframesForTrack(trackKey)

    state.keyframes[keyframeKey] = newKeyframe;  // Add keyframe to Record
    let track = state.getTrack(trackKey)

    const isPropertyTracked = !!track;

    if (isPropertyTracked) {
        // Check if the cursor is on a keyframe that already exists
        const isCursorOnKeyframe = keyframes.some(kf => kf.time === state.cursorTime)
        if (isCursorOnKeyframe === false) {
            state.addKeyframeToTrack(state, keyframeKey, trackKey);
        }
    }

    state.addChange();
}

function createStaticPropLogic(state: TimelineEditorStoreProps, vxkey: string, propertyPath: string, value: number) {
    const staticPropKey = `${vxkey}.${propertyPath}`
    const newStaticProp: IStaticProps = {
        vxkey: vxkey,
        propertyPath: propertyPath,
        value: value
    }

    state.staticProps[staticPropKey] = newStaticProp;              // Add to Record
    state.editorObjects[vxkey].staticPropKeys.push(staticPropKey)  // Add to editorObjects
}


function createTrackLogic(state: TimelineEditorStoreProps, trackKey: string, keyframeKeys: string[]) {
    const {vxkey, propertyPath} = extractDataFromTrackKey(trackKey);

    state.editorObjects[vxkey].trackKeys.push(trackKey);
    
    const newTrack: ITrack = {
        vxkey,
        propertyPath,
        keyframes: keyframeKeys || []
    }
    state.tracks[trackKey] = newTrack;
}

export const useTimelineEditorAPI = createWithEqualityFn<TimelineEditorStoreProps>((set, get) => ({
    editorObjects: {},
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
        const { editorObjects, tracks, staticProps, groupedPaths, keyframes, } = processRawData(rawObjects);
        set({
            editorObjects,
            tracks,
            staticProps,
            groupedPaths,
            keyframes,

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
    setSelectedTrackSegment: (firstKeyframeKey, secondKeyframeKey, trackKey) => set(produce((state: TimelineEditorStoreProps) => {
        state.selectedTrackSegment = {
            firstKeyframeKey: firstKeyframeKey,
            secondKeyframeKey: secondKeyframeKey,
            trackKey: trackKey
        }
    })),

    // Getter functions

    getTrack: (trackKey) => { return get().tracks[trackKey]; },
    getStaticProp: (staticPropKey) => { return get().staticProps[staticPropKey]; },
    getKeyframe: (keyframeId) => { return get().keyframes[keyframeId]; },

    getTracksForObject: (vxkey) => {
        const object = get().editorObjects[vxkey];
        if (object) {
            return object.trackKeys.map((trackKey: string) => get().tracks[trackKey]);
        }
        return [];
    },
    getStaticPropsForObject: (vxkey: string) => {
        const object = get().editorObjects[vxkey];
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
        // Check if the object is already in the editorObjects.
        // it usually means it was added by the animationEngine when processing the raw data
        if (newVxObject.vxkey in get().editorObjects) {
            return
        }
        const newEdObject: EditorObjectProps = {
            vxkey: newVxObject.vxkey,
            trackKeys: [],
            staticPropKeys: []
        }
        set(produce((state: TimelineEditorStoreProps) => {
            state.editorObjects[newVxObject.vxkey] = newEdObject
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

    createTrack: (trackKey, keyframeKeys) => {
        set(produce((state: TimelineEditorStoreProps) => {
            createTrackLogic(state, trackKey, keyframeKeys)
            state.groupedPaths = computeGroupPaths(state.editorObjects)
        }))

        const animationEngine = get().animationEngineRef.current
        if (!animationEngine) return

        // Refresh only the track 
        animationEngine.refreshTrack(trackKey, "create")
    },

    removeTrack: ({ trackKey, reRender }) => {
        console.log("REmoving Track key ", trackKey)
        set(produce((state: TimelineEditorStoreProps) => {
            removeTrackLogic(state, trackKey)
            state.groupedPaths = computeGroupPaths(state.editorObjects)
        }))

        const animationEngine = get().animationEngineRef.current
        if (!animationEngine) return

        // Refresh only the track 
        animationEngine.refreshTrack(trackKey, "remove", reRender)
    },

    createKeyframe: ({ trackKey, value, reRender = true }) => {
        const keyframeKey = `keyframe-${Date.now()}`

        set(produce((state: TimelineEditorStoreProps) => createKeyframeLogic(state, trackKey, keyframeKey, value)))
        const animationEngine = get().animationEngineRef.current
        // Refresh Raw Data and ReRender
        animationEngine.refreshKeyframe(trackKey, 'create', keyframeKey, reRender)
    },

    removeKeyframe: ({ trackKey, keyframeKey, reRender }) => {
        set(produce((state: TimelineEditorStoreProps) => removeKeyframeLogic(state, trackKey, keyframeKey)))
        // Only refreshe the currentTimeline if removeKeyframe is not used inside a nested immer produce
        // Because refresh requires the state from timelineEditorStore which is not done by the time it gets called
        const animationEngine = get().animationEngineRef.current
        if (!animationEngine) return

        animationEngine.refreshKeyframe(trackKey, "remove", keyframeKey, reRender)
    },

    makePropertyTracked: (staticPropKey, reRender) => {
        const { vxkey, propertyPath } = extractDataFromTrackKey(staticPropKey);
        const vxObjects = useVXObjectStore.getState().objects;
        let doesPropertyExist = false
        const trackKey = staticPropKey;

        const track = get().tracks[trackKey]
        if (track) {
            console.error("VXAnimationEngine: property ", trackKey, " is already tracked")
            return
        }

        const animationEngine = get().animationEngineRef.current

        // Default Keyframe that will be added when creating a new track
        const keyframeKey = `keyframe-${Date.now()}`
        animationEngine.refreshStaticProp("remove", staticPropKey, false)

        set(produce((state: TimelineEditorStoreProps) => {
            let value;

            const staticPropsForObject = state.getStaticPropsForObject(vxkey); // this will be filtered

            if (staticPropsForObject) {
                const staticProp = staticPropsForObject.find(prop => prop.propertyPath === propertyPath)
                if (staticProp) {
                    value = staticProp.value;
                    removeStaticPropLogic(state, staticPropKey)
                    doesPropertyExist = true;
                }
                else
                    value = getNestedProperty(vxObjects[vxkey].ref.current, propertyPath);
            }
            else
                value = getNestedProperty(vxObjects[vxkey].ref.current, propertyPath);

            // Handle Track 
            createTrackLogic(state, trackKey, [keyframeKey])
            createKeyframeLogic(state, trackKey, keyframeKey, value,)

            // Recompute grouped Paths for Visual 
            state.groupedPaths = computeGroupPaths(state.editorObjects)
        }))
        // Refresh Raw Data and ReRender
        animationEngine.refreshKeyframe(trackKey, "create", keyframeKey, false)
        animationEngine.refreshTrack(trackKey, "create", true)
    },


    makePropertyStatic: (trackKey, reRender = true) => {
        const { vxkey, propertyPath } = extractDataFromTrackKey(trackKey);
        const staticPropKey = trackKey;
        let doesTrackExist = false;
        set(produce((state: TimelineEditorStoreProps) => {

            const vxObject = useVXObjectStore.getState().objects[vxkey]
            const value = getNestedProperty(vxObject.ref.current, propertyPath)
            const edObject = useTimelineEditorAPI.getState().editorObjects[vxkey];

            doesTrackExist =  !!edObject.trackKeys.find(key => key === trackKey)

            if(doesTrackExist)
                removeTrackLogic(state, trackKey)

            createStaticPropLogic(state, vxkey, propertyPath, value)

            // Recompute grouped Paths for Visual 
            state.groupedPaths = computeGroupPaths(state.editorObjects)
        }))

        const animationEngine = get().animationEngineRef.current
        if (!animationEngine) return;

        if(doesTrackExist)
            animationEngine.refreshTrack(trackKey, "remove")

        animationEngine.refreshStaticProp("create", staticPropKey, true )
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


    createStaticProp: ({ vxkey, propertyPath, value, reRender, state }) => {
        const staticPropKey = `${vxkey}.${propertyPath}`

        if (state)
            createStaticPropLogic(state, vxkey, propertyPath, value)
        else {
            set(produce((state: TimelineEditorStoreProps) => createStaticPropLogic(state, vxkey, propertyPath, value)))
            const animationEngine = get().animationEngineRef.current
            if (!animationEngine)
                return

            animationEngine.refreshStaticProp("create", staticPropKey, reRender)
        }
    },

    removeStaticProp: ({ staticPropKey, state, reRender }) => {
        if (state)
            removeStaticPropLogic(state, staticPropKey)
        else {
            set(produce((state: TimelineEditorStoreProps) => removeStaticPropLogic(state, staticPropKey)))
            // Refresh Keyframe
            const animationEngine = get().animationEngineRef.current
            if (!animationEngine) return

            animationEngine.refreshStaticProp("remove", staticPropKey, reRender)
        }
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
        const generalKey = `${vxkey}.${propertyPath}`;  // TrackKey or StaticPropKey
        const track = get().getTrack(generalKey);
        const isPropertyTracked = !!track;

        if (isPropertyTracked) {
            const trackKey = generalKey;
            const keyframes = get().getKeyframesForTrack(trackKey);

            // Check if the cursor is under any keyframe
            let targetedKeyframe: IKeyframe | undefined;
            keyframes.some((kf: IKeyframe) => {
                if (kf.time === get().cursorTime) {
                    targetedKeyframe = kf;
                    return true;  // Exit early once we find the keyframe
                }
                return false;
            });

            // if keyframe exists, update its value
            // else create a new keyframe at cursortime
            if (targetedKeyframe)
                get().setKeyframeValue(targetedKeyframe.id, newValue, reRender);
            else
                get().createKeyframe({
                    trackKey,
                    value: newValue,
                    reRender
                });

        } else {
            const staticPropKey = generalKey;
            // Check if the static prop exists
            const staticProp = get().getStaticProp(staticPropKey);

            if (staticProp)
                get().setStaticPropValue(staticPropKey, newValue, reRender);
            else
                get().createStaticProp({ vxkey, propertyPath, value: newValue, reRender });

        }

        useObjectPropertyAPI.getState().updateProperty(vxkey, propertyPath, newValue);
    },

    dumpData: () => {

    }
}))