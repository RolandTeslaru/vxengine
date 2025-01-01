import { START_CURSOR_TIME } from '@vxengine/AnimationEngine/interface/const';
import { getVXEngineState, useVXEngine } from '@vxengine/engine';
import { IKeyframe, ISpline, IStaticProps, ITrack, PathGroup, RawObjectProps, RawSpline } from '@vxengine/AnimationEngine/types/track';
import { createWithEqualityFn } from 'zustand/traditional';
import { handleSetCursor } from './utils/handleSetCursor';
import { produce } from 'immer';
import { buildTrackTree, extractDataFromTrackKey } from './utils/trackDataProcessing';
import { updateProperty, useObjectPropertyAPI } from '../ObjectManager/stores/managerStore';
import { getNestedProperty } from '@vxengine/utils/nestedProperty';
import { ObjectStoreStateProps, vxObjectProps } from '@vxengine/managers/ObjectManager/types/objectStore';
import { EditorObjectProps, SelectedKeyframe, TimelineEditorStoreProps } from './types/store';
import { useVXObjectStore } from '../ObjectManager';
import processRawData from './utils/processRawData';
import { useAnimationEngineAPI } from '@vxengine/AnimationEngine';
import { debounce, isEqual } from 'lodash';
import { AnimationEngine } from '@vxengine/AnimationEngine/engine';
import { invalidate } from '@react-three/fiber';
import { useRefStore } from '@vxengine/utils';
import { handleKeyframeMutation } from './components/TimelineArea/EditArea/Keyframe';

export type GroupedPaths = Record<string, PathGroup>;

const DEBUG_REFRESHER = true;
const startLeft = 13.616;

function removeStaticPropLogic(state: TimelineEditorStoreProps, staticPropKey: string) {
    const { vxkey, propertyPath } = extractDataFromTrackKey(staticPropKey)
    delete state.staticProps[staticPropKey] // Delete from record

    // Delete from editorObjects vxobject
    const edObject = state.editorObjects[vxkey];
    edObject.staticPropKeys = edObject.staticPropKeys.filter((propKey) => propKey !== staticPropKey);
}

function removeKeyframeLogic(state: TimelineEditorStoreProps, trackKey: string, keyframeKey: string) {
    const track = state.tracks[trackKey]
    if (!track) return;

    delete track.keyframes[keyframeKey];
    updatedOrderedKeyframeIdsLogic(state, trackKey)
}

function removeTrackLogic(state: TimelineEditorStoreProps, trackKey: string) {
    const { vxkey, propertyPath } = extractDataFromTrackKey(trackKey);
    const track = state.tracks[trackKey]

    if (!track) return;

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
    const track = state.tracks[trackKey]
    if (!track) return;

    // Check if the cursor is on an exsting keyframe
    // if so, return because we cannot create overlapped keyframes
    const keyframesOnTrackArray = Object.values(track.keyframes)
    const isCursorOnExistingKeyframe = keyframesOnTrackArray.some(kf => kf.time === state.cursorTime);
    if (isCursorOnExistingKeyframe) return

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

    track.keyframes[keyframeKey] = newKeyframe;

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


function createTrackLogic(state: TimelineEditorStoreProps, trackKey: string) {
    const { vxkey, propertyPath } = extractDataFromTrackKey(trackKey);

    state.editorObjects[vxkey].trackKeys.push(trackKey);

    const newTrack: ITrack = {
        vxkey,
        propertyPath,
        keyframes: {},
        orderedKeyframeKeys: []
    }
    state.tracks[trackKey] = newTrack;
}

const createFlatMap = (state: TimelineEditorStoreProps): SelectedKeyframe[] => {
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

export function updatedOrderedKeyframeIdsLogic(state: TimelineEditorStoreProps, trackKey: string) {
    const track = state.tracks[trackKey];
    const sortedKeys = Object.keys(track.keyframes).sort(
        (a, b) => track.keyframes[a].time - track.keyframes[b].time
    )

    if(!isEqual(sortedKeys, track.orderedKeyframeKeys)){
        track.orderedKeyframeKeys = sortedKeys
    }
}


function selectKeyframeLogic(state: TimelineEditorStoreProps, trackKey: string, keyframeKey: string) {
    if (!state.selectedKeyframeKeys[trackKey])
        state.selectedKeyframeKeys[trackKey] = {};

    state.selectedKeyframeKeys[trackKey][keyframeKey] = true;

    // Update the flat map using the reusable function
    state.selectedKeyframesFlatMap = createFlatMap(state);
}




export const useTimelineEditorAPI = createWithEqualityFn<TimelineEditorStoreProps>((set, get) => ({
    editorObjects: {},
    tracks: {},
    staticProps: {},
    trackTree: {},
    splines: {},

    currentTimelineLength: 0,
    setCurrentTimelineLength: (length: number) => {
        const currentTimeline = useAnimationEngineAPI.getState().currentTimeline
        currentTimeline.length = length;

        set({ currentTimelineLength: length })
    },

    collapsedTrackNodes: {},
    setCollapsedTrackNodes: (nodeKey: string) => {
        set(produce((state: TimelineEditorStoreProps) => {
            const value = state.collapsedTrackNodes[nodeKey]
            state.collapsedTrackNodes[nodeKey] = !value
        }), false)
    },

    setEditorData: (rawObjects, rawSplines) => {
        const { editorObjects, tracks, staticProps, splines, trackTree } = processRawData(rawObjects, rawSplines);
        set({
            editorObjects,
            tracks,
            staticProps,
            splines,
            trackTree
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

    clipboard: {},
    setClipboard: (content) => set({ clipboard: content }),

    selectedKeyframeKeys: {},
    selectedKeyframesFlatMap: [],
    selectKeyframe: (trackKey, keyframeKey) => {
        set(
            produce((state: TimelineEditorStoreProps) => selectKeyframeLogic(state, trackKey, keyframeKey))
        )
    },
    removeSelectedKeyframe: (trackKey, keyframeKey) => {
        set(
            produce((state: TimelineEditorStoreProps) => {
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
            produce((state: TimelineEditorStoreProps) => {
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
    setSelectedTrackSegment: (firstKeyframeKey, secondKeyframeKey, trackKey) => set(produce((state: TimelineEditorStoreProps) => {
        state.selectedTrackSegment = {
            firstKeyframeKey: firstKeyframeKey,
            secondKeyframeKey: secondKeyframeKey,
            trackKey: trackKey
        }
    })),


    //
    // Getter functions
    //


    getTrack: (trackKey) => { return get().tracks[trackKey]; },
    getStaticProp: (staticPropKey) => { return get().staticProps[staticPropKey]; },
    getAllKeyframes: () => {
        const tracks = get().tracks;
        return Object.values(tracks)
            .flatMap(track => Object.values(track.keyframes));
    },

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

    // Cursor funcitons

    moveToNextKeyframe: (trackKey) => {
        const track = get().tracks[trackKey]
        if (!track) return
        const { cursorTime } = get();

        const sortedKeyframes = Object.values(track.keyframes).sort((a, b) => a.time - b.time);

        const nextKeyframe = sortedKeyframes.find(kf => kf.time > cursorTime);

        if (nextKeyframe) {
            handleSetCursor({ time: nextKeyframe.time, });
        }
    },
    moveToPreviousKeyframe: (trackKey) => {
        const track = get().tracks[trackKey]
        if (!track) return

        const { cursorTime } = get();
        const sortedKeyframes = Object.values(track.keyframes).sort((a, b) => a.time - b.time);

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
            createTrackLogic(state, trackKey)
            createKeyframeLogic(state, trackKey, keyframeKey, value,)

            // Recompute Track Tree
            state.trackTree = buildTrackTree(state.tracks)
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

            doesTrackExist = !!edObject.trackKeys.find(key => key === trackKey)

            if (doesTrackExist)
                removeTrackLogic(state, trackKey)

            createStaticPropLogic(state, vxkey, propertyPath, value)

            // Recompute grouped Paths for Visual 
            state.trackTree = buildTrackTree(state.tracks)
        }))

        const animationEngine = getVXEngineState().getState().animationEngine
        if (doesTrackExist)
            animationEngine.refreshTrack(trackKey, "remove")

        animationEngine.refreshStaticProp("create", staticPropKey, true)
        get().addChange()
    },



    //
    //       T R A C K
    //


    createTrack: (trackKey) => {
        set(produce((state: TimelineEditorStoreProps) => {
            createTrackLogic(state, trackKey)
            state.trackTree = buildTrackTree(state.tracks)
        }))

        const animationEngine = getVXEngineState().getState().animationEngine
        // Refresh only the track 
        animationEngine.refreshTrack(trackKey, "create")
        get().addChange()
    },

    removeTrack: ({ trackKey, reRender }) => {
        set(produce((state: TimelineEditorStoreProps) => {
            removeTrackLogic(state, trackKey)
            state.trackTree = buildTrackTree(state.tracks)
        }))

        const animationEngine = getVXEngineState().getState().animationEngine
        // Refresh only the track 
        animationEngine.refreshTrack(trackKey, "remove", reRender)
        get().addChange()
    },


    //
    //      S P L I N E
    //


    createSpline: ({ vxkey }) => {
        const splineKey = `${vxkey}.spline`;
        const trackKey = `${vxkey}.splineProgress`

        const vxObject = useVXObjectStore.getState().objects[vxkey];
        if (!vxObject) {
            console.error("useTimelineEditorAPI createSpline(): Could not find the vxobject")
            return;
        }

        // Handle edSpline creation
        const initialPosition = vxObject.ref.current.position
        const initialNode = [
            AnimationEngine.truncateToDecimals(initialPosition.x),
            AnimationEngine.truncateToDecimals(initialPosition.y),
            AnimationEngine.truncateToDecimals(initialPosition.z)
        ];
        const nodes = [
            initialNode,
            [
                AnimationEngine.truncateToDecimals(Math.random() * 10),
                AnimationEngine.truncateToDecimals(Math.random() * 10),
                AnimationEngine.truncateToDecimals(Math.random() * 10)
            ],
            [
                AnimationEngine.truncateToDecimals(Math.random() * 10),
                AnimationEngine.truncateToDecimals(Math.random() * 10),
                AnimationEngine.truncateToDecimals(Math.random() * 10)
            ]
        ]

        set(
            produce((state: TimelineEditorStoreProps) => {
                const edSpline: ISpline = {
                    splineKey,
                    vxkey,
                    nodes: nodes as [number, number, number][]
                }
                state.splines[splineKey] = edSpline;
            })
        )

        // Handle engine spline creation (wasm)
        const animationEngine = getVXEngineState().getState().animationEngine
        animationEngine.refreshSpline("create", splineKey, true)

        // Handle Spline Track creation
        get().createTrack(trackKey);
        get().createKeyframe({
            trackKey,
            value: 0,
            reRender: true
        });

        get().addChange();
    },

    removeSpline: ({ vxkey }) => {
        const trackKey = `${vxkey}.splineProgress`
        const splineKey = `${vxkey}.spline`;

        set(
            produce((state: TimelineEditorStoreProps) => {
                delete state.splines[splineKey];
            })
        )
        // Remove spline progress track
        get().removeTrack({ trackKey, reRender: false });

        // Remove spline object from timeline
        const animationEngine = getVXEngineState().getState().animationEngine
        animationEngine.refreshSpline("remove", splineKey, true)

        get().addChange();
    },

    insertNode: ({ splineKey, index }) => {
        set(
            produce((state: TimelineEditorStoreProps) => {
                const spline = state.splines[splineKey]
                if (!spline) {
                    console.error(`useTimelineEditorAPI insertNode(): Spline with vxkey ${splineKey} does not exist`)
                    return;
                }

                const nodes = spline.nodes;
                const prevNode = nodes[index];
                let nextNode = nodes[index + 1];

                if (!nextNode) {
                    nextNode = [
                        (Math.random() * 10 - 5),
                        (Math.random() * 6 - 3),
                        (Math.random() * 8 - 4)
                    ];
                    nodes.splice(index + 1, 0, nextNode);
                } else {
                    const interPoint: [number, number, number] = [
                        (prevNode[0] + nextNode[0]) / 2,
                        (prevNode[1] + nextNode[1]) / 2,
                        (prevNode[2] + nextNode[2]) / 2,
                    ];
                    nodes.splice(index + 1, 0, interPoint);
                }
            })
        )

        const animationEngine = getVXEngineState().getState().animationEngine;
        animationEngine.refreshSpline("update", splineKey, true);

        get().addChange();
    },

    removeNode: ({ splineKey, index }) => {
        set(
            produce((state: TimelineEditorStoreProps) => {
                const spline = state.splines[splineKey]
                if (!spline) {
                    console.error(`removeNode(): Spline with vxkey "${splineKey}" does not exist`);
                    return;
                }

                const nodes = spline.nodes

                // Ensure at least two nodes remain on the spline
                if (nodes.length <= 2) {
                    console.warn(`removeNode(): Cannot remove node. Spline must have at least two nodes.`);
                    return;
                }
                nodes.splice(index, 1);
            })
        )

        const animationEngine = getVXEngineState().getState().animationEngine;
        animationEngine.refreshSpline("update", splineKey, true);

        get().addChange();
    },

    setSplineNodePosition: (splineKey, nodeIndex, newPosition) => {
        set(
            produce((state: TimelineEditorStoreProps) => {
                const spline = state.splines[splineKey];
                spline.nodes[nodeIndex] = [
                    newPosition.x,
                    newPosition.y,
                    newPosition.z,
                ]
            })
        )

        const animationEngine = getVXEngineState().getState().animationEngine
        animationEngine.refreshSpline("update", splineKey, true)

        get().addChange();
    },


    //
    //      K E Y F R A M E
    //


    createKeyframe: ({ trackKey, value, reRender = true }) => {
        const keyframeKey = `keyframe-${Date.now()}`

        set(produce((state: TimelineEditorStoreProps) => {
            createKeyframeLogic(state, trackKey, keyframeKey, value)

            updatedOrderedKeyframeIdsLogic(state, trackKey);
        }))
        const animationEngine = getVXEngineState().getState().animationEngine
        // Refresh Raw Data and ReRender
        animationEngine.refreshKeyframe(trackKey, 'create', keyframeKey, reRender)
        get().addChange()
    },

    removeKeyframe: ({ keyframeKey, trackKey, reRender }) => {
        set(produce((state: TimelineEditorStoreProps) => removeKeyframeLogic(state, trackKey, keyframeKey)))
        // Only refresh the currentTimeline if removeKeyframe is not used inside a nested immer produce
        // Because refresh requires the state from timelineEditorStore which is not done by the time it gets called
        const animationEngine = getVXEngineState().getState().animationEngine
        animationEngine.refreshKeyframe(trackKey, "remove", keyframeKey, reRender)
        get().addChange()
    },

    // TODO: Find a way to batch and throttle the state updates 
    setKeyframeTime: (keyframeKey: string, trackKey: string, newTime: number, reRender = true, mutateUI = true) => {
        newTime = truncateToDecimals(newTime)
        // Handle State Update
        set(produce((state: TimelineEditorStoreProps) => {
            const track = state.tracks[trackKey];
            if (!track) 
                return;
            const keyframe = track.keyframes[keyframeKey];

            if (!keyframe) { 
                console.warn(`TimelineManagerAPI: Keyframe does not exist ${keyframeKey}`, track.keyframes);
                 return; 
            }

            track.keyframes[keyframeKey].time = newTime;

            updatedOrderedKeyframeIdsLogic(state, trackKey);
        }))

        // Handle Raw Timeline Update
        const animationEngine = getVXEngineState().getState().animationEngine
        animationEngine.refreshKeyframe(trackKey, "update", keyframeKey, reRender)

        // Handle UI Mutation
        if(mutateUI)
            handleKeyframeMutation(keyframeKey, newTime, true);

        get().addChange()
    },

    setKeyframeValue: (keyframeKey, trackKey, newValue, reRender = true) => {
        newValue = truncateToDecimals(newValue);
        set(produce((state: TimelineEditorStoreProps) => {
            const track = state.tracks[trackKey];
            if (!track) return;

            track.keyframes[keyframeKey].value = newValue;
        }))

        // Refresh Keyframe
        const animationEngine = getVXEngineState().getState().animationEngine
        animationEngine.refreshKeyframe(trackKey, "update", keyframeKey, reRender)
        get().addChange()
    },

    setKeyframeHandles: (keyframeKey, trackKey, inHandle, outHandle, reRender = true) => {
        set(produce((state: TimelineEditorStoreProps) => {
            const track = state.tracks[trackKey];
            if (!track) return;

            track.keyframes[keyframeKey].handles = {
                in: inHandle,
                out: outHandle
            }
        }))

        // Refresh Keyframe
        const animationEngine = getVXEngineState().getState().animationEngine
        animationEngine.refreshKeyframe(trackKey, "update", keyframeKey, reRender)
        get().addChange()
    },


    //
    //      S T A T I C     P R O P 
    //


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

    removeProperty: (vxkey, propertyPath) => {
        const key = `${vxkey}.${propertyPath}`
        const track = get().getTrack(key);
        const staticProp = get().getStaticProp(key)

        const doesTrackExist = !!track;
        const doesStaticPropExist = !!staticProp;

        if (doesTrackExist) {
            get().removeTrack({ trackKey: key, reRender: true })
        }
        if (doesStaticPropExist) {
            get().removeStaticProp({ staticPropKey: key, reRender: true })
        }
        get().addChange()
    }
}))


export const truncateToDecimals = (value: number) => {
    return AnimationEngine.truncateToDecimals(value, AnimationEngine.ENGINE_PRECISION)
}


export const handlePropertyValueChange = (vxkey: string, propertyPath: string, newValue: any, reRender = true) => {
    newValue = truncateToDecimals(newValue);

    const generalKey = `${vxkey}.${propertyPath}`;  // TrackKey or StaticPropKey
    const state = useTimelineEditorAPI.getState();
    const track = state.getTrack(generalKey);
    const isPropertyTracked = !!track;

    if (isPropertyTracked) {
        const trackKey = generalKey;
        const keyframesOnTrack = Object.values(state.tracks[trackKey].keyframes)

        // Check if the cursor is under any keyframe
        let targetedKeyframe: IKeyframe | undefined;
        keyframesOnTrack.some((kf: IKeyframe) => {
            if (kf.time === state.cursorTime) {
                targetedKeyframe = kf;
                return true;  // Exit early once we find the keyframe
            }
            return false;
        });
        // if keyframe exists, update its value
        // else create a new keyframe at cursortime
        if (targetedKeyframe)
            state.setKeyframeValue(targetedKeyframe.id, trackKey, newValue, reRender);
        else
            state.createKeyframe({ trackKey, value: newValue, reRender });
    } else {
        const staticPropKey = generalKey;
        // Check if the static prop exists
        const staticProp = state.getStaticProp(staticPropKey);

        if (staticProp)
            state.setStaticPropValue(staticPropKey, newValue, reRender);
        else
            state.createStaticProp({ vxkey, propertyPath, value: newValue, reRender });

    }

    updateProperty(vxkey, propertyPath, newValue);
    state.addChange()
}

export const selectKeyframeSTATIC = (trackKey: string, keyframeKey: string) => {
    useTimelineEditorAPI.setState(
        produce((state: TimelineEditorStoreProps) => selectKeyframeLogic(state, trackKey, keyframeKey))
    )
}

export const setKeyframeTimeSTATIC = (trackKey: string, keyframeKey: string) => {

}