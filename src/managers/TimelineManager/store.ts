import { START_CURSOR_TIME } from '@vxengine/AnimationEngine/interface/const';
import { getVXEngineState, useVXEngine } from '@vxengine/engine';
import { IKeyframe, IStaticProps, ITrack, PathGroup, RawObjectProps } from '@vxengine/AnimationEngine/types/track';
import { createWithEqualityFn } from 'zustand/traditional';
import { handleSetCursor } from './utils/handleSetCursor';
import { produce } from 'immer';
import { computeGroupPaths, extractDataFromTrackKey } from './utils/trackDataProcessing';
import {  useObjectPropertyAPI } from '../ObjectManager/stores/managerStore';
import { getNestedProperty } from '@vxengine/utils/nestedProperty';
import { vxObjectProps } from '@vxengine/managers/ObjectManager/types/objectStore';
import { EditorObjectProps, TimelineEditorStoreProps } from './types/store';
import { useVXObjectStore } from '../ObjectManager';
import processRawData from './utils/processRawData';
import { useAnimationEngineAPI } from '@vxengine/AnimationEngine';
import { debounce } from 'lodash';
import { AnimationEngine } from '@vxengine/AnimationEngine/engine';

export type GroupedPaths = Record<string, PathGroup>;

const DEBUG_REFRESHER = true;
export const startLeft = 0;


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

    if(!track) return;

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
    if (value === undefined || value === null) {
        const vxobject = useVXObjectStore.getState().objects[vxkey]
        value = getNestedProperty(vxobject.ref.current, propertyPath)
    }
    
    const newKeyframe: IKeyframe = {
        id: keyframeKey,
        time: truncateToDecimals(state.cursorTime),
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
        const isCursorOnKeyframe = keyframes.some((kf: IKeyframe) => kf.time === state.cursorTime)
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

    currentTimelineLength: 0,
    setCurrentTimelineLength: (length: number) => {
        const currentTimeline = useAnimationEngineAPI.getState().currentTimeline
        currentTimeline.length = length;

        set({ currentTimelineLength: length })
    },

    collapsedGroups: {},
    setCollapsedGroups: ( groupKey: string) => {
        set(produce((state: TimelineEditorStoreProps) => {
            const value = state.collapsedGroups[groupKey]
            state.collapsedGroups[groupKey] = !value
        }), false)
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

    scale: 6,
    setScale: (count) => set({ scale: count }),

    cursorTime: START_CURSOR_TIME,
    setCursorTime: (time: number) => set({ cursorTime: time }),

    activeTool: "mouse",
    setActiveTool: (tool) => set({ activeTool: tool }),

    snap: true,
    setSnap: (value) => set({ snap: value }),

    searchQuery: "",
    setSearchQuery: (query) => set({ searchQuery: query }),

    changes: 0,
    addChange: () => set((state) => ({ ...state, changes: state.changes + 1 })),

    clipboard: [],
    setClipboard: (keyframeKeys: string[]) => set({ clipboard: keyframeKeys}),

    selectedKeyframeKeys: [],
    setSelectedKeyframeKeys: (keyframeKeys: string[]) => set(produce((state: TimelineEditorStoreProps) => {
        state.selectedKeyframeKeys = keyframeKeys
    })),

    lastKeyframeSelectedIndex: null,
    setLastKeyframeSelectedIndex: (newIndex: number) => set({ lastKeyframeSelectedIndex: newIndex}),

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

    moveToNextKeyframe: (trackKey) => {
        const { cursorTime } = get();

        const keyframesForTrack = get().getKeyframesForTrack(trackKey);

        const sortedKeyframes = [...keyframesForTrack].sort((a, b) => a.time - b.time);

        const nextKeyframe = sortedKeyframes.find(kf => kf.time > cursorTime);

        if (nextKeyframe) {
            handleSetCursor({ time: nextKeyframe.time, });
        }
    },

    moveToPreviousKeyframe: (trackKey) => {
        const { cursorTime } = get();
        const keyframesForTrack = get().getKeyframesForTrack(trackKey);

        const sortedKeyframes = [...keyframesForTrack].sort((a, b) => a.time - b.time);

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

        get().addChange()
    },

    createTrack: (trackKey, keyframeKeys) => {
        set(produce((state: TimelineEditorStoreProps) => {
            createTrackLogic(state, trackKey, keyframeKeys)
            state.groupedPaths = computeGroupPaths(state.editorObjects)
        }))

        const animationEngine = getVXEngineState().getState().animationEngine
        // Refresh only the track 
        animationEngine.refreshTrack(trackKey, "create")
        get().addChange()
    },

    removeTrack: ({ trackKey, reRender }) => {
        set(produce((state: TimelineEditorStoreProps) => {
            removeTrackLogic(state, trackKey)
            state.groupedPaths = computeGroupPaths(state.editorObjects)
        }))

        const animationEngine = getVXEngineState().getState().animationEngine
        // Refresh only the track 
        animationEngine.refreshTrack(trackKey, "remove", reRender)
        get().addChange()
    },

    createKeyframe: ({ trackKey, value, reRender = true }) => {
        const keyframeKey = `keyframe-${Date.now()}`

        set(produce((state: TimelineEditorStoreProps) => createKeyframeLogic(state, trackKey, keyframeKey, value)))
        const animationEngine = getVXEngineState().getState().animationEngine
        // Refresh Raw Data and ReRender
        animationEngine.refreshKeyframe(trackKey, 'create', keyframeKey, reRender)
        get().addChange()
    },

    removeKeyframe: ({ keyframeKey, reRender }) => {
        const keyframe = get().keyframes[keyframeKey];
        const vxkey = keyframe.vxkey;
        const propertyPath = keyframe.propertyPath;
        const trackKey = `${vxkey}.${propertyPath}`
        
        set(produce((state: TimelineEditorStoreProps) => removeKeyframeLogic(state, trackKey, keyframeKey)))
        // Only refreshe the currentTimeline if removeKeyframe is not used inside a nested immer produce
        // Because refresh requires the state from timelineEditorStore which is not done by the time it gets called
        const animationEngine = getVXEngineState().getState().animationEngine
        animationEngine.refreshKeyframe(trackKey, "remove", keyframeKey, reRender)
        get().addChange()
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

        const animationEngine = getVXEngineState().getState().animationEngine
        // Default Keyframe that will be added when creating a new track
        const keyframeKey = `keyframe-${Date.now()}`
        animationEngine.refreshStaticProp("remove", staticPropKey, false)

        set(produce((state: TimelineEditorStoreProps) => {
            let value;

            const staticPropsForObject = state.getStaticPropsForObject(vxkey); // this will be filtered

            if (staticPropsForObject) {
                const staticProp = staticPropsForObject.find((prop: IStaticProps) => prop.propertyPath === propertyPath)
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
        get().addChange()
    },


    makePropertyStatic: (trackKey, reRender = true) => {
        const { vxkey, propertyPath } = extractDataFromTrackKey(trackKey);
        const staticPropKey = trackKey;
        let doesTrackExist = false;
        
        set(produce((state: TimelineEditorStoreProps) => {
            const vxObject = useVXObjectStore.getState().objects[vxkey]
            const value = getNestedProperty(vxObject?.ref?.current, propertyPath) || 0
            const edObject = useTimelineEditorAPI.getState().editorObjects[vxkey];

            doesTrackExist =  !!edObject.trackKeys.find(key => key === trackKey)

            if(doesTrackExist)
                removeTrackLogic(state, trackKey)

            createStaticPropLogic(state, vxkey, propertyPath, value)

            // Recompute grouped Paths for Visual 
            state.groupedPaths = computeGroupPaths(state.editorObjects)
        }))

        const animationEngine = getVXEngineState().getState().animationEngine
        if(doesTrackExist)
            animationEngine.refreshTrack(trackKey, "remove")

        animationEngine.refreshStaticProp("create", staticPropKey, true )
        get().addChange()
    },


    setKeyframeTime: (keyframeKey: string, newTime: number, reRender = true) => {
        newTime = truncateToDecimals(newTime)
        set(produce((state: TimelineEditorStoreProps) => {
            state.keyframes[keyframeKey].time = newTime;
        }))

        const keyframe = get().keyframes[keyframeKey]
        const trackKey = `${keyframe.vxkey}.${keyframe.propertyPath}`;

        const animationEngine = getVXEngineState().getState().animationEngine
        animationEngine.refreshKeyframe(trackKey, "update", keyframeKey, reRender)
        get().addChange()
    },


    setKeyframeValue: (keyframeKey, newValue, reRender = true) => {
        newValue = truncateToDecimals(newValue);
        // console.log("TimelineEditorAPI: Setting", keyframeKey, " to value:", newValue)
        set(produce((state: TimelineEditorStoreProps) => {
            state.keyframes[keyframeKey].value = newValue;
        }))

        const keyframe = get().keyframes[keyframeKey]
        const trackKey = `${keyframe.vxkey}.${keyframe.propertyPath}`;

        // Refresh Keyframe
        const animationEngine = getVXEngineState().getState().animationEngine
        animationEngine.refreshKeyframe(trackKey, "update", keyframeKey, reRender)
        get().addChange()
    },


    setKeyframeHandles: (keyframeKey, trackKey, inHandle, outHandle, reRender = true) => {
        set(produce((state: TimelineEditorStoreProps) => {
            state.keyframes[keyframeKey].handles = {
                in: inHandle,
                out: outHandle
            }
        }))

        // Refresh Keyframe
        const animationEngine = getVXEngineState().getState().animationEngine
        animationEngine.refreshKeyframe(trackKey, "update", keyframeKey, reRender)
        get().addChange()
    },


    createStaticProp: ({ vxkey, propertyPath, value, reRender, state }) => {
        value = truncateToDecimals(value);
        const staticPropKey = `${vxkey}.${propertyPath}`

        if (state)
            createStaticPropLogic(state, vxkey, propertyPath, value)
        else {
            set(produce((state: TimelineEditorStoreProps) => createStaticPropLogic(state, vxkey, propertyPath, value)))
            const animationEngine = getVXEngineState().getState().animationEngine
            animationEngine.refreshStaticProp("create", staticPropKey, reRender)
        }
        get().addChange()
    },

    removeStaticProp: ({ staticPropKey, state, reRender }) => {
        if (state)
            removeStaticPropLogic(state, staticPropKey)
        else {
            set(produce((state: TimelineEditorStoreProps) => removeStaticPropLogic(state, staticPropKey)))
            // Refresh Keyframe
            const animationEngine = getVXEngineState().getState().animationEngine
            animationEngine.refreshStaticProp("remove", staticPropKey, reRender)
        }
        get().addChange()
    },

    setStaticPropValue: (staticPropKey: string, newValue: number, reRender = true) => {
        newValue = truncateToDecimals(newValue)
        set(produce((state: TimelineEditorStoreProps) => {
            state.staticProps[staticPropKey].value = newValue;
        }))

        // Refresh Keyframe
        const animationEngine = getVXEngineState().getState().animationEngine
        animationEngine.refreshStaticProp("update", staticPropKey, reRender)
        get().addChange()
    },

    handlePropertyValueChange: (vxkey, propertyPath, newValue, reRender = true) => {
        newValue = truncateToDecimals(newValue);
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
                get().createKeyframe({trackKey,value: newValue,reRender});
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
        get().addChange()
    },

    removeProperty: (vxkey, propertyPath) => {
        const key = `${vxkey}.${propertyPath}`
        const track = get().getTrack(key);
        const staticProp = get().getStaticProp(key)

        const doesTrackExist = !!track;
        const doesStaticPropExist = !!staticProp;

        if(doesTrackExist){
            get().removeTrack({ trackKey: key, reRender: true})
        }
        if(doesStaticPropExist){
            get().removeStaticProp({staticPropKey: key, reRender: true})
        }
        get().addChange()
    }
}))


export const truncateToDecimals = (value: number) => {
    return AnimationEngine.truncateToDecimals(value, AnimationEngine.ENGINE_PRECISION)
}

