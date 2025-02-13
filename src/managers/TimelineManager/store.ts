import { createWithEqualityFn } from 'zustand/traditional';
import { produce } from 'immer';
import { buildTrackTree, extractDataFromTrackKey } from './utils/trackDataProcessing';
import { updateProperty, useObjectManagerAPI } from '../ObjectManager/stores/managerStore';
import { getNestedProperty } from '@vxengine/utils/nestedProperty';
import { vxObjectProps } from '@vxengine/managers/ObjectManager/types/objectStore';
import { useVXObjectStore } from '../ObjectManager';
import processRawData from './utils/processRawData';
import { useAnimationEngineAPI } from '@vxengine/AnimationEngine';
import { isEqual } from 'lodash';
import { AnimationEngine } from '@vxengine/AnimationEngine/engine';
import { handleKeyframeMutation } from './TimelineEditor/components/TimelineArea/EditArea/Keyframe/utils';
import { useTimelineEditorAPI } from './TimelineEditor/store';
import { v4 as uuidv4 } from 'uuid';
import animationEngineInstance from '@vxengine/singleton';
import { EditorKeyframe, EditorObject, EditorSpline, EditorStaticProp, EditorTrack } from '@vxengine/types/data/editorData';
import { TimelineMangerAPIProps } from './types/store';

export const useTimelineManagerAPI = createWithEqualityFn<TimelineMangerAPIProps>((set, get) => ({
    editorObjects: {},
    tracks: {},
    staticProps: {},
    splines: {},

    currentTimelineLength: 0,
    setCurrentTimelineLength: (length: number) => {
        const currentTimeline = useAnimationEngineAPI.getState().currentTimeline
        currentTimeline.length = length;

        set({ currentTimelineLength: length })
    },

    setEditorData: (rawObjects, rawSplines, IS_DEVELOPMENT) => {
        const { editorObjects, tracks, staticProps, splines } = processRawData(rawObjects, rawSplines);
        console.log("Setting editor data")
        
        if(IS_DEVELOPMENT)
            useTimelineEditorAPI.getState().rebuildTrackTree(tracks)

        set({
            editorObjects,
            tracks,
            staticProps,
            splines,
        });
    },

    changes: 0,
    addChange: () => set((state) => ({ ...state, changes: state.changes + 1 })),


    //
    // Getter functions
    //

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

    // Writer Functions

    addObjectToEditorData: (newVxObject: vxObjectProps) => {
        // Check if the object is already in the editorObjects.
        // it usually means it was added by the animationEngineInstance when processing the raw data
        if (newVxObject.vxkey in get().editorObjects) {
            return
        }
        const newEdObject: EditorObject = {
            vxkey: newVxObject.vxkey,
            trackKeys: [],
            staticPropKeys: []
        }
        set(produce((state: TimelineMangerAPIProps) => {
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

        // Default Keyframe that will be added when creating a new track
        const keyframeKey = `keyframe-${uuidv4()}`
        animationEngineInstance.hydrationService.hydrateStaticProp({
            action: "remove",
            vxkey,
            propertyPath
        })

        set(produce((state: TimelineMangerAPIProps) => {
            let value;

            const staticPropsForObject = state.getStaticPropsForObject(vxkey); // this will be filtered

            if (staticPropsForObject) {
                const staticProp = staticPropsForObject.find((prop: EditorStaticProp) => prop.propertyPath === propertyPath)
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
            createTrackLogic(state, vxkey, propertyPath)
            createKeyframeLogic(state, trackKey, keyframeKey, value,)

            // Recompute Track Tree
            useTimelineEditorAPI.getState().rebuildTrackTree(state.tracks)
        }))

        if(reRender)
            animationEngineInstance.reRender({force: true})

        get().addChange()
    },

    makePropertyStatic: (trackKey, reRender = true) => {
        const { vxkey, propertyPath } = extractDataFromTrackKey(trackKey);
        let doesTrackExist = false;

        set(produce((state: TimelineMangerAPIProps) => {
            const vxObject = useVXObjectStore.getState().objects[vxkey]
            const value = getNestedProperty(vxObject?.ref?.current, propertyPath) || 0
            const edObject = useTimelineManagerAPI.getState().editorObjects[vxkey];

            doesTrackExist = !!edObject.trackKeys.find(key => key === trackKey)

            if (doesTrackExist)
                removeTrackLogic(state, vxkey, propertyPath)

            createStaticPropLogic(state, vxkey, propertyPath, value)

            // Recompute grouped Paths for Visual 
            useTimelineEditorAPI.getState().rebuildTrackTree(state.tracks)
        }))

        if(reRender)
            animationEngineInstance.reRender({force: true})
        get().addChange()
    },



    //
    //       T R A C K
    //


    createTrack: (trackKey) => {
        const {vxkey, propertyPath } = extractDataFromTrackKey(trackKey);

        set(produce((state: TimelineMangerAPIProps) => {
            createTrackLogic(state, vxkey, propertyPath)
            useTimelineEditorAPI.getState().rebuildTrackTree(state.tracks)
        }))
        get().addChange()
    },

    removeTrack: ({ trackKey, reRender }) => {
        const {vxkey, propertyPath } = extractDataFromTrackKey(trackKey);
        set(produce((state: TimelineMangerAPIProps) => {
            removeTrackLogic(state, vxkey, propertyPath)
            useTimelineEditorAPI.getState().rebuildTrackTree(state.tracks)
        }))
        
        if(reRender)
            animationEngineInstance.reRender({force: true})
        get().addChange()
    },


    //
    //      S P L I N E
    //


    createSpline: ({ vxkey }) => {
        const splineKey = `${vxkey}.spline`;
        const progress = 0
        const tension = 0.5

        const vxObject = useVXObjectStore.getState().objects[vxkey];
        if (!vxObject) {
            console.error("useTimelineManagerAPI createSpline(): Could not find the vxobject")
            return;
        }

        // Handle edSpline creation
        const initialPosition = vxObject.ref.current.position
        const initialNode = [
            AnimationEngine.truncateToDecimals(initialPosition.x),
            AnimationEngine.truncateToDecimals(initialPosition.y),
            AnimationEngine.truncateToDecimals(initialPosition.z)
        ] as [number, number, number];
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
        ] as [number, number, number][];

        set(
            produce((state: TimelineMangerAPIProps) => {
                const editorSpline: EditorSpline = {
                    splineKey,
                    vxkey,
                    nodes
                }
                state.splines[splineKey] = editorSpline;

                createStaticPropLogic(state, vxkey, "splineProgress", progress)
                createStaticPropLogic(state, vxkey, "splineTension", tension)
            })
        )

        // Handle engine spline creation (wasm)
        animationEngineInstance.hydrationService.hydrateSpline({
            action: "create", 
            splineKey, 
            objVxKey: vxkey,
            initialTension: tension,
            nodes
        })

        animationEngineInstance.reRender({force: true})

        get().addChange();
    },

    removeSpline: ({ vxkey }) => {
        const splineKey = `${vxkey}.spline`;

        set(produce((state: TimelineMangerAPIProps) => {
            delete state.splines[splineKey];
        }))
        // Remove spline progress track
        get().removeProperty(vxkey, "splineProgress");
        get().removeProperty(vxkey, "splineTension");

        // Remove spline object from timeline
        animationEngineInstance.hydrationService.hydrateSpline({
            action: "remove", 
            splineKey, 
        })

        animationEngineInstance.reRender({force: true})

        useTimelineEditorAPI.getState().rebuildTrackTree(get().tracks)

        get().addChange();
    },

    insertNode: ({ splineKey, index }) => {
        set(
            produce((state: TimelineMangerAPIProps) => {
                const spline = state.splines[splineKey]
                if (!spline) {
                    console.error(`useTimelineManagerAPI insertNode(): Spline with vxkey ${splineKey} does not exist`)
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

        animationEngineInstance.hydrationService.hydrateSpline({
            action: "clone", 
            splineKey, 
        });

        animationEngineInstance.reRender({force: true})

        get().addChange();
    },

    removeNode: ({ splineKey, index }) => {
        set(
            produce((state: TimelineMangerAPIProps) => {
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

        ;
        animationEngineInstance.hydrationService.hydrateSpline({
            action: "removeNode", 
            splineKey, 
            nodeIndex: index,
        });

        animationEngineInstance.reRender({force: true})

        get().addChange();
    },

    setSplineNodePosition: (splineKey, nodeIndex, newPosition) => {
        set(
            produce((state: TimelineMangerAPIProps) => {
                const spline = state.splines[splineKey];
                spline.nodes[nodeIndex] = [
                    newPosition.x,
                    newPosition.y,
                    newPosition.z,
                ]
            })
        )

        
        animationEngineInstance.hydrationService.hydrateSpline({
            action: "updateNode", 
            splineKey,
            nodeIndex: nodeIndex,
            newData: [newPosition.x, newPosition.y, newPosition.z], 
        })

        animationEngineInstance.reRender({force: true})

        get().addChange();
    },

    setSplineNodeAxisValue: (splineKey, nodeIndex, axis, newValue, reRender= true ) => {
        set(produce((state: TimelineMangerAPIProps) => {
            const spline = state.splines[splineKey];
            switch(axis){
                case "x":
                    spline.nodes[nodeIndex][0] = newValue;
                    break;
                case "y":
                    spline.nodes[nodeIndex][1] = newValue;
                    break;
                case "z":
                    spline.nodes[nodeIndex][2] = newValue;
                    break;
            }
        }))

        ;
        animationEngineInstance.hydrationService.hydrateSpline({
            action: "clone", 
            splineKey,
        });

        if(reRender)
            animationEngineInstance.reRender({force: true})
    },

    //
    //      K E Y F R A M E
    //


    createKeyframe: ({ trackKey, value, reRender = true }) => {
        const keyframeKey = `keyframe-${uuidv4()}`;

        set(produce((state: TimelineMangerAPIProps) =>
            createKeyframeLogic(state, trackKey, keyframeKey, value)
        ))
        
        if(reRender)
            animationEngineInstance.reRender({force: true})

        get().addChange()
    },

    removeKeyframe: ({ keyframeKey, trackKey, reRender = true }) => {
        const {vxkey, propertyPath} = extractDataFromTrackKey(trackKey)
        set(produce((state: TimelineMangerAPIProps) => removeKeyframeLogic(state, vxkey, propertyPath, keyframeKey)))

        if(reRender)
            animationEngineInstance.reRender({force: true})
        get().addChange()
    },

    // TODO: Find a way to batch and throttle the state updates 
    setKeyframeTime: (keyframeKey: string, trackKey: string, newTime: number, reRender = true, mutateUI = true) => {
        const { vxkey, propertyPath } = extractDataFromTrackKey(trackKey);
        newTime = truncateToDecimals(newTime)
        // Handle State Update
        set(produce((state: TimelineMangerAPIProps) => {
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
        
        animationEngineInstance.hydrationService.hydrateKeyframe({
            vxkey,
            propertyPath,
            action: "updateTime",
            keyframeKey,
            newTime
        })

        // Handle UI Mutation
        if (mutateUI)
            handleKeyframeMutation(keyframeKey, newTime, true);

        if(reRender)
            animationEngineInstance.reRender({force: true})

        get().addChange()
    },

    setKeyframeValue: (keyframeKey, trackKey, newValue, reRender = true, updateStore = true) => {
        const { vxkey, propertyPath } = extractDataFromTrackKey(trackKey);
        newValue = truncateToDecimals(newValue);

        if (updateStore) {
            set(produce((state: TimelineMangerAPIProps) => {
                const track = state.tracks[trackKey];
                if (!track) return;

                track.keyframes[keyframeKey].value = newValue;
            }))
        }

        // Refresh Keyframe
        
        animationEngineInstance.hydrationService.hydrateKeyframe({
            action: "updateValue",
            vxkey,
            propertyPath,
            keyframeKey,
            newValue
        })

        if(reRender)
            animationEngineInstance.reRender({force: true})

        get().addChange()
    },

    setKeyframeHandles: (keyframeKey, trackKey, inHandle, outHandle, reRender = true) => {
        const { vxkey, propertyPath } = extractDataFromTrackKey(trackKey);
        set(produce((state: TimelineMangerAPIProps) => {
            const track = state.tracks[trackKey];
            if (!track) return;

            track.keyframes[keyframeKey].handles = {
                in: inHandle,
                out: outHandle
            }
        }))

        animationEngineInstance.hydrationService.hydrateKeyframe({
            action: "updateHandles",
            vxkey,
            propertyPath,
            keyframeKey,
            newHandles: [inHandle.x, inHandle.y, outHandle.x, outHandle.y]
        })

        if(reRender)
            animationEngineInstance.reRender({force: true})
        get().addChange()
    },


    //
    //      S T A T I C     P R O P 
    //

    createStaticProp: ({ vxkey, propertyPath, value, reRender }) => {
        value = truncateToDecimals(value);

        set(produce((state: TimelineMangerAPIProps) => createStaticPropLogic(state, vxkey, propertyPath, value)))

        if(reRender)
            animationEngineInstance.reRender({force: true})
        get().addChange()
    },

    removeStaticProp: ({ staticPropKey, reRender }) => {
        set(produce((state: TimelineMangerAPIProps) => removeStaticPropLogic(state, staticPropKey)))
    
        if(reRender)
            animationEngineInstance.reRender({force: true})
        get().addChange()
    },

    setStaticPropValue: (staticPropKey: string, newValue: number, reRender = true) => {
        newValue = truncateToDecimals(newValue)
        set(produce((state: TimelineMangerAPIProps) => {
            state.staticProps[staticPropKey].value = newValue;
        }))

        const { vxkey, propertyPath } = extractDataFromTrackKey(staticPropKey)
        // Refresh Keyframe
        
        animationEngineInstance.hydrationService.hydrateStaticProp({
            action: "update",
            vxkey,
            propertyPath,
            newValue,
        })
        if(reRender)
            animationEngineInstance.reRender({ force: true });
        get().addChange()
    },

    removeProperty: (vxkey, propertyPath, reRender) => {
        set(produce((state: TimelineMangerAPIProps) => {
            removePropertyLogic(state, vxkey, propertyPath);
        }))
       
        if(reRender)
            animationEngineInstance.reRender({ force: true });

        get().addChange()
    }
}))






function createKeyframeLogic(
    state: TimelineMangerAPIProps,
    trackKey: string,
    keyframeKey: string,
    value?: number
) {
    const track = state.tracks[trackKey]
    if (!track) return;

    
    const time = truncateToDecimals(animationEngineInstance.currentTime)

    // Check if the cursor is on an exsting keyframe
    // if so, return because we cannot create overlapped keyframes
    const keyframesOnTrackArray = Object.values(track.keyframes)
    const isCursorOnExistingKeyframe = keyframesOnTrackArray.some(kf => kf.time === time);
    if (isCursorOnExistingKeyframe) return

    const { vxkey, propertyPath } = extractDataFromTrackKey(trackKey)
    if (value === undefined || value === null) {
        const vxobject = useVXObjectStore.getState().objects[vxkey]
        value = getNestedProperty(vxobject.ref.current, propertyPath)
    }

    const newKeyframe: EditorKeyframe = {
        id: keyframeKey,
        time,
        value,
        vxkey,
        propertyPath: propertyPath,
        handles: {
            in: { x: 0.7, y: 0.7 },
            out: { x: 0.3, y: 0.3 }
        },
    };

    track.keyframes[keyframeKey] = newKeyframe;

    updatedOrderedKeyframeIdsLogic(state, trackKey)
    state.addChange();

    animationEngineInstance.hydrationService.hydrateKeyframe({
        action: "create",
        vxkey,
        propertyPath,
        keyframeKey,
        value,
        time,
        handles: [0.7, 0.7, 0.3, 0.3]
    })
}

function removePropertyLogic(state: TimelineMangerAPIProps, vxkey: string, propertyPath: string){
    const generalKey = `${vxkey}.${propertyPath}`;
    const doesTrackExist = state.tracks[generalKey];
    const doesStaticPropExist = state.staticProps[generalKey];

    if(!!doesStaticPropExist){
        removeStaticPropLogic(state, generalKey);
        
    }
    if(!!doesTrackExist){
        removeTrackLogic(state, vxkey, propertyPath);
    }
} 

function removeStaticPropLogic(state: TimelineMangerAPIProps, staticPropKey: string) {
    const { vxkey, propertyPath } = extractDataFromTrackKey(staticPropKey)
    delete state.staticProps[staticPropKey] // Delete from record

    // Delete from editorObjects vxobject
    const edObject = state.editorObjects[vxkey];
    edObject.staticPropKeys = edObject.staticPropKeys.filter((propKey) => propKey !== staticPropKey);

    animationEngineInstance.hydrationService.hydrateStaticProp({
        action: "remove",
        vxkey,
        propertyPath
    })
}

function removeKeyframeLogic(state: TimelineMangerAPIProps, vxkey: string, propertyPath: string, keyframeKey: string) {
    const trackKey = `${vxkey}.${propertyPath}`
    const track = state.tracks[trackKey]
    if (!track) return;

    delete track.keyframes[keyframeKey];
    updatedOrderedKeyframeIdsLogic(state, trackKey)

    animationEngineInstance.hydrationService.hydrateKeyframe({
        action: "remove",
        vxkey,
        propertyPath,
        keyframeKey
    })
}

function removeTrackLogic(state: TimelineMangerAPIProps, vxkey: string, propertyPath: string) {
    const trackKey = `${vxkey}.${propertyPath}`;
    const track = state.tracks[trackKey]

    if (!track) return;

    delete state.tracks[trackKey]

    // Remove the track key from the editor object
    const trackKeys = state.editorObjects[vxkey].trackKeys.filter(key => key !== trackKey)
    state.editorObjects[vxkey].trackKeys = trackKeys;

    animationEngineInstance.hydrationService.hydrateTrack({
        action: "remove",
        vxkey,
        propertyPath
    });
}


function createStaticPropLogic(state: TimelineMangerAPIProps, vxkey: string, propertyPath: string, value: number) {
    const staticPropKey = `${vxkey}.${propertyPath}`
    const newStaticProp: EditorStaticProp = {
        vxkey: vxkey,
        propertyPath: propertyPath,
        value: value
    }
    state.staticProps[staticPropKey] = newStaticProp;              // Add to Record
    state.editorObjects[vxkey].staticPropKeys.push(staticPropKey)  // Add to editorObjects

    animationEngineInstance.hydrationService.hydrateStaticProp({
        action: "create",
        vxkey,
        propertyPath,
        value
    })
}


function createTrackLogic(state: TimelineMangerAPIProps, vxkey: string, propertyPath: string) {
    const trackKey = `${vxkey}.${propertyPath}`

    state.editorObjects[vxkey].trackKeys.push(trackKey);

    const newTrack: EditorTrack = {
        vxkey,
        propertyPath,
        keyframes: {},
        orderedKeyframeKeys: []
    }
    state.tracks[trackKey] = newTrack;

    animationEngineInstance.hydrationService.hydrateTrack({
        action: "create",
        vxkey,
        propertyPath
    })
}

export function updatedOrderedKeyframeIdsLogic(state: TimelineMangerAPIProps, trackKey: string) {
    const track = state.tracks[trackKey];
    const sortedKeys = Object.keys(track.keyframes).sort(
        (a, b) => track.keyframes[a].time - track.keyframes[b].time
    )

    if (!isEqual(sortedKeys, track.orderedKeyframeKeys)) {
        track.orderedKeyframeKeys = sortedKeys
    }
}

export const truncateToDecimals = (value: number) => {
    return AnimationEngine.truncateToDecimals(value, AnimationEngine.ENGINE_PRECISION)
}




export const modifyPropertyValue = (
    mode: "start" | "changing" | "end" | "press",
    vxkey: string,
    propertyPath: string,
    newValue: number,
    reRender: boolean = true
) => {
    newValue = truncateToDecimals(newValue);

    const generalKey = `${vxkey}.${propertyPath}`;  // TrackKey or StaticPropKey
    const state = useTimelineManagerAPI.getState();
    const tracks = state.tracks;
    const track = state.tracks[generalKey];
    const isPropertyTracked = !!track;

    
    const time = animationEngineInstance.currentTime

    if (isPropertyTracked) {
        const trackKey = generalKey;
        const keyframesOnTrack = Object.values(tracks[trackKey].keyframes)

        // Check if the cursor is under any keyframe
        let targetKeyframe: EditorKeyframe | undefined;
        keyframesOnTrack.some((kf: EditorKeyframe) => {
            if (kf.time === time) {
                targetKeyframe = kf;
                return true;  // Exit early once we find the keyframe
            }
            return false;
        });
        let targetKeyframeKey = targetKeyframe?.id

        if (!targetKeyframe) {
            state.createKeyframe({ trackKey, value: newValue, reRender });
        }
        else {
            if (mode === "start" || mode === "changing") {
                animationEngineInstance.hydrationService.hydrateKeyframe({
                    action: "updateValue",
                    vxkey,
                    propertyPath,
                    keyframeKey: targetKeyframeKey,
                    newValue
                })
            }
            else if (mode === "end" || mode === "press") {
                state.setKeyframeValue(targetKeyframeKey, trackKey, newValue)
            }
        }
    }
    else {
        const staticPropKey = generalKey;
        const staticProp = state.staticProps[staticPropKey];

        if (!staticProp) {
            state.createStaticProp({ vxkey, propertyPath, value: newValue, reRender })
        }
        else {
            if (mode === "start" || mode === "changing") {
                animationEngineInstance.hydrationService.hydrateStaticProp({
                    action: "update",
                    vxkey,
                    propertyPath,
                    newValue,
                })
            }
            else if (mode === "end" || mode === "press") {
                state.setStaticPropValue(staticPropKey, newValue, reRender);
            }
        }
    }

    if(reRender)
        animationEngineInstance.reRender({force: true})

    updateProperty(vxkey, propertyPath, newValue);
}



export const modifyBatchPropertyValues = (
    mode: "start" | "changing" | "end" | "press",
    properties: { vxkey: string, propertyPath: string, newValue: number }[]
) => {
    
    const time = animationEngineInstance.currentTime
    const state = useTimelineManagerAPI.getState();
    const tracks = state.tracks;

    properties.forEach(property => {
        const generalKey = `${property.vxkey}.${property.propertyPath}`;
        const track = state.tracks[generalKey];
        const isPropertyTracked = !!track;

        if (isPropertyTracked) {
            const trackKey = generalKey;
            const keyframesOnTrack = Object.values(tracks[trackKey].keyframes)

            // Check if the cursor is under any keyframe
            let targetKeyframe: EditorKeyframe | undefined;
            keyframesOnTrack.some((kf: EditorKeyframe) => {
                if (kf.time === time) {
                    targetKeyframe = kf;
                    return true;  // Exit early once we find the keyframe
                }
                return false;
            });
            let targetKeyframeKey = targetKeyframe?.id

            if (!targetKeyframe) {
                state.createKeyframe({ trackKey, value: property.newValue, reRender: true });
            }
        }

    })
}