import { create } from 'zustand';
import { produce } from 'immer';
import { buildTrackTree, extractDataFromTrackKey } from './utils/trackDataProcessing';
import { getNestedProperty } from '@vxengine/utils/nestedProperty';
import { vxObjectProps } from '@vxengine/managers/ObjectManager/types/objectStore';
import { useVXObjectStore } from '../ObjectManager';
import processRawData from './utils/processRawData';
import { useAnimationEngineAPI } from '@vxengine/AnimationEngine';
import { isEqual } from 'lodash';
import { AnimationEngine } from '@vxengine/AnimationEngine/engine';
import { handleKeyframeMutation, handleKeyframeMutationByTime } from './TimelineEditor/components/TimelineArea/EditArea/Keyframe/utils';
import { useTimelineEditorAPI } from './TimelineEditor/store';
import { v4 as uuidv4 } from 'uuid';
import animationEngineInstance from '@vxengine/singleton';
import { EditorKeyframe, EditorKeyframeHandles, EditorObject, EditorSpline, EditorStaticProp, EditorTrack } from '@vxengine/types/data/editorData';
import { TimelineManagerAPIProps } from './types/store';

export const useTimelineManagerAPI = create<TimelineManagerAPIProps>((set, get) => ({
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
        const { splines } = processRawData(rawObjects, rawSplines);

        set({
            splines,
        });
    },

    changes: 0,
    addChange: () => set(produce((state: TimelineManagerAPIProps) => {
        state.changes += 1;
    })),


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

    makePropertyTracked: (vxkey, propertyPath, reRender) => {
        const vxobject = useVXObjectStore.getState().objects[vxkey];
        if (!vxobject) {
            console.error(`Error making property tracked. Vxobject with vxkey ${vxkey} does not exist`)
            return
        }

        const objectRef = vxobject.ref.current
        let doesPropertyExist = false

        const trackKey = `${vxkey}.${propertyPath}`;

        const track = get().tracks[trackKey]
        if (track) {
            console.error("VXAnimationEngine: property ", trackKey, " is already tracked")
            return
        }

        // Default Keyframe that will be added when creating a new track
        const keyframeKey = `keyframe-${uuidv4()}`
        animationEngineInstance
            .hydrationService
            .hydrateStaticProp({ action: "remove", vxkey, propertyPath })

        set(produce((state: TimelineManagerAPIProps) => {
            let value: number;

            const staticPropsForObject = state.getStaticPropsForObject(vxkey); // this will be filtered

            if (staticPropsForObject) {
                // Check if the property is already a staticProp
                const staticProp = staticPropsForObject.find((prop: EditorStaticProp) => prop.propertyPath === propertyPath)
                if (staticProp) {
                    value = staticProp.value;
                    state.removeStaticProp({ state, vxkey, propertyPath, reRender: false })
                    doesPropertyExist = true;
                }
                else {
                    // Generate the property setter if the property is neither a staticProp or a track
                    animationEngineInstance
                        .propertyControlService
                        .generatePropertySetter(objectRef, vxkey, propertyPath)

                    value = getNestedProperty(objectRef, propertyPath);
                }
            }
            else
                value = getNestedProperty(objectRef, propertyPath);

            // Handle Track 
            state.createTrack({ state, vxkey, propertyPath })
            state.createKeyframe({ state, vxkey, propertyPath, value, reRender: false, overlapKeyframeCheck: true })
        }))

        if (reRender)
            animationEngineInstance.reRender({ force: true })

        get().addChange()
    },

    makePropertyStatic: (trackKey, reRender = true) => {
        const { vxkey, propertyPath } = extractDataFromTrackKey(trackKey);
        const vxobject = useVXObjectStore.getState().objects[vxkey]
        if (!vxobject) {
            console.error(`Error making property static. Vxobject with vxkey ${vxkey} does not exist`)
            return
        }

        const objectRef = vxobject.ref.current
        let doesTrackExist = false;

        set(produce((state: TimelineManagerAPIProps) => {

            const value = getNestedProperty(objectRef, propertyPath) || 0
            const edObject = useTimelineManagerAPI.getState().editorObjects[vxkey];

            doesTrackExist = !!edObject.trackKeys.find(key => key === trackKey)

            if (doesTrackExist)
                state.removeTrack({ state, vxkey, propertyPath, reRender: false })
            else
                animationEngineInstance
                    .propertyControlService
                    .generatePropertySetter(objectRef, vxkey, propertyPath)

            state.createStaticProp({ state, vxkey, propertyPath, value, reRender: false })
        }))

        if (reRender)
            animationEngineInstance.reRender({ force: true })
        get().addChange()
    },



    //
    //       T R A C K
    //


    createTrack: ({ state, vxkey, propertyPath }) => {

        if (state) {
            createTrackLogic(state, vxkey, propertyPath)
            useTimelineEditorAPI
                .getState()
                .addTrackToTrackTree({ timelineManagerState: state, vxkey, propertyPath })
        }
        else
            set(produce((state: TimelineManagerAPIProps) => {
                createTrackLogic(state, vxkey, propertyPath)
                useTimelineEditorAPI
                    .getState()
                    .addTrackToTrackTree({ timelineManagerState: state, vxkey, propertyPath })
            }))

        animationEngineInstance.hydrationService.hydrateTrack({
            action: "create",
            vxkey,
            propertyPath
        })

        get().addChange()
    },

    removeTrack: ({ state, vxkey, propertyPath, reRender }) => {
        if (state) {
            removeTrackLogic(state, vxkey, propertyPath)
        }
        else
            set(produce((state: TimelineManagerAPIProps) => {
                removeTrackLogic(state, vxkey, propertyPath)
            }))

        animationEngineInstance.hydrationService.hydrateTrack({
            action: "remove",
            vxkey,
            propertyPath
        });

        // Removing a track doesnt need the whole timelineManager state
        useTimelineEditorAPI
            .getState()
            .removeTrackFromTrackTree(vxkey, propertyPath)

        if (reRender)
            animationEngineInstance.reRender({ force: true })
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

        set(produce((state: TimelineManagerAPIProps) => {
            const editorSpline: EditorSpline = {
                splineKey,
                vxkey,
                nodes
            }
            state.splines[splineKey] = editorSpline;

            state.createStaticProp({ state, vxkey, propertyPath: "splineProgress", value: progress, reRender: false })
            state.createStaticProp({ state, vxkey, propertyPath: "splineTension", value: tension, reRender: false })
        }))

        // Handle engine spline creation (wasm)
        animationEngineInstance.hydrationService.hydrateSpline({
            action: "create",
            splineKey,
            objVxKey: vxkey,
            initialTension: tension,
            nodes
        })

        animationEngineInstance.reRender({ force: true })

        get().addChange();
    },

    removeSpline: ({ vxkey }) => {
        const splineKey = `${vxkey}.spline`;

        set(produce((state: TimelineManagerAPIProps) => {
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

        animationEngineInstance.reRender({ force: true })

        get().addChange();
    },

    insertNode: ({ splineKey, index }) => {
        set(produce((state: TimelineManagerAPIProps) => {
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
        }))

        animationEngineInstance.hydrationService.hydrateSpline({
            action: "clone",
            splineKey,
        });

        animationEngineInstance.reRender({ force: true })

        get().addChange();
    },

    removeNode: ({ splineKey, index }) => {
        set(produce((state: TimelineManagerAPIProps) => {
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
        }))

            ;
        animationEngineInstance.hydrationService.hydrateSpline({
            action: "removeNode",
            splineKey,
            nodeIndex: index,
        });

        animationEngineInstance.reRender({ force: true })

        get().addChange();
    },

    setSplineNodePosition: (splineKey, nodeIndex, newPosition) => {
        set(produce((state: TimelineManagerAPIProps) => {
            const spline = state.splines[splineKey];
            spline.nodes[nodeIndex] = [
                newPosition.x,
                newPosition.y,
                newPosition.z,
            ]
        }))


        animationEngineInstance.hydrationService.hydrateSpline({
            action: "updateNode",
            splineKey,
            nodeIndex: nodeIndex,
            newData: [newPosition.x, newPosition.y, newPosition.z],
        })

        animationEngineInstance.reRender({ force: true })

        get().addChange();
    },

    setSplineNodeAxisValue: (splineKey, nodeIndex, axis, newValue, reRender = true) => {
        set(produce((state: TimelineManagerAPIProps) => {
            const spline = state.splines[splineKey];
            switch (axis) {
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

        if (reRender)
            animationEngineInstance.reRender({ force: true })
    },

    //
    //      K E Y F R A M E
    //


    createKeyframe: ({ state, vxkey, propertyPath, value, handles, time, reRender = true, overlapKeyframeCheck = true }) => {
        time = time ?? animationEngineInstance.currentTime;
        // Check if the cursor is on an exsting keyframe
        // if so, return because we cannot create overlapped keyframes
        if (overlapKeyframeCheck) {
            let isCursorOnExistingKeyframe = false
            if (state)
                isCursorOnExistingKeyframe = checkIfOnKeyframe(state, vxkey, propertyPath, time)
            else
                isCursorOnExistingKeyframe = checkIfOnKeyframe(get(), vxkey, propertyPath, time)

            if (isCursorOnExistingKeyframe) return;
        }

        const keyframeKey = `keyframe-${uuidv4()}`;


        if (value === undefined || value == null) {
            const vxobject = useVXObjectStore.getState().objects[vxkey]
            value = getNestedProperty(vxobject.ref.current, propertyPath)
        }

        if (state)
            createKeyframeLogic(state, vxkey, propertyPath, keyframeKey, value, handles, time)
        else
            set(produce((state: TimelineManagerAPIProps) =>
                createKeyframeLogic(state, vxkey, propertyPath, keyframeKey, value, handles, time)))

        const rawHandles = handles
            ? [handles.in.x, handles.in.y, handles.out.x, handles.out.y]
            : [0.7, 0.7, 0.3, 0.3]

        animationEngineInstance.hydrationService.hydrateKeyframe({
            action: "create",
            vxkey,
            propertyPath,
            keyframeKey,
            value,
            time,
            handles: rawHandles as [number, number, number, number]
        })

        if (reRender)
            animationEngineInstance.reRender({ force: true })

        get().addChange()
    },

    removeKeyframe: ({ state, keyframeKey, vxkey, propertyPath, reRender = true }) => {
        const trackKey = `${vxkey}.${propertyPath}`
        if (state) {
            removeKeyframeLogic(state, vxkey, propertyPath, keyframeKey)
            if (state.tracks[trackKey].orderedKeyframeKeys.length === 0)
                state.removeTrack({ state, vxkey, propertyPath, reRender: false })
        }
        else {
            set(produce((state: TimelineManagerAPIProps) => {
                removeKeyframeLogic(state, vxkey, propertyPath, keyframeKey)
                if (state.tracks[trackKey].orderedKeyframeKeys.length === 0)
                    state.removeTrack({ state, vxkey, propertyPath, reRender: false })
            }))
        }

        animationEngineInstance.hydrationService.hydrateKeyframe({
            action: "remove",
            vxkey,
            propertyPath,
            keyframeKey
        })

        if (reRender)
            animationEngineInstance.reRender({ force: true })
        get().addChange()
    },

    // TODO: Find a way to batch and throttle the state updates 
    setKeyframeTime: (keyframeKey: string, trackKey: string, newTime: number, reRender = true, mutateUI = true) => {
        const { vxkey, propertyPath } = extractDataFromTrackKey(trackKey);
        newTime = truncateToDecimals(newTime)
        // Handle State Update
        set(produce((state: TimelineManagerAPIProps) => {
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
            handleKeyframeMutationByTime(keyframeKey, newTime, true);

        if (reRender)
            animationEngineInstance.reRender({ force: true })

        get().addChange()
    },

    setKeyframeValue: (keyframeKey, trackKey, newValue, reRender = true, updateStore = true) => {
        const { vxkey, propertyPath } = extractDataFromTrackKey(trackKey);
        newValue = truncateToDecimals(newValue);

        if (updateStore) {
            set(produce((state: TimelineManagerAPIProps) => {
                const track = state.tracks[trackKey];
                if (!track) return;

                track.keyframes[keyframeKey].value = newValue;
            }))
        }

        animationEngineInstance
            .hydrationService
            .hydrateKeyframe({
                action: "updateValue",
                vxkey,
                propertyPath,
                keyframeKey,
                newValue
            })

        if (reRender)
            animationEngineInstance.reRender({ force: true })

        get().addChange()
    },

    setKeyframeHandles: (keyframeKey, trackKey, inHandle, outHandle, reRender = true) => {
        const { vxkey, propertyPath } = extractDataFromTrackKey(trackKey);
        set(produce((state: TimelineManagerAPIProps) => {
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

        if (reRender)
            animationEngineInstance.reRender({ force: true })
        get().addChange()
    },


    //
    //      S T A T I C     P R O P 
    //

    createStaticProp: ({ state, vxkey, propertyPath, value, reRender }) => {
        value = truncateToDecimals(value);

        if (state)
            createStaticPropLogic(state, vxkey, propertyPath, value)
        else
            set(produce((state: TimelineManagerAPIProps) =>
                createStaticPropLogic(state, vxkey, propertyPath, value)))

        animationEngineInstance.hydrationService.hydrateStaticProp({
            action: "create",
            vxkey,
            propertyPath,
            value
        })

        if (reRender)
            animationEngineInstance.reRender({ force: true })
        get().addChange()
    },

    removeStaticProp: ({ state, vxkey, propertyPath, reRender }) => {
        if (state)
            removeStaticPropLogic(state, `${vxkey}.${propertyPath}`)
        else
            set(produce((state: TimelineManagerAPIProps) =>
                removeStaticPropLogic(state, `${vxkey}.${propertyPath}`)))

        animationEngineInstance.hydrationService.hydrateStaticProp({
            action: "remove",
            vxkey,
            propertyPath
        })

        if (reRender)
            animationEngineInstance.reRender({ force: true })
        get().addChange()
    },

    setStaticPropValue: (staticPropKey: string, newValue: number, reRender = true) => {
        newValue = truncateToDecimals(newValue)
        set(produce((state: TimelineManagerAPIProps) => {
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
        if (reRender)
            animationEngineInstance.reRender({ force: true });
        get().addChange()
    },

    removeProperty: (vxkey, propertyPath, reRender) => {
        set(produce((state: TimelineManagerAPIProps) => {
            removePropertyLogic(state, vxkey, propertyPath);
        }))

        if (reRender)
            animationEngineInstance.reRender({ force: true });

        get().addChange()
    },
}))





function checkIfOnKeyframe(state: TimelineManagerAPIProps, vxkey: string, propertPath: string, time: number) {
    const trackKey = `${vxkey}.${propertPath}`
    const track = state.tracks[trackKey]
    if (!track) {
        console.warn(`Could not check if over keyframe becuase the track with trackKey ${trackKey} does not exist`)
        return true
    }

    const orderedKeyframeKeys = track.orderedKeyframeKeys;
    let leftIndex = 0;
    let rightIndex = orderedKeyframeKeys.length - 1
    let foundIndex = -1;

    while (leftIndex <= rightIndex) {
        const mid = Math.floor((leftIndex + rightIndex) / 2)
        const midKey = orderedKeyframeKeys[mid];
        const midTime = track.keyframes[midKey].time;

        if (midTime === time) {
            foundIndex = mid;
            break
        } else if (midTime < time) {
            leftIndex = mid + 1;
        } else {
            rightIndex = mid - 1;
        }
    }

    if (foundIndex !== -1 ? orderedKeyframeKeys[foundIndex] : null) {
        return true
    } else {
        return false
    }
}


function createKeyframeLogic(
    state: TimelineManagerAPIProps,
    vxkey: string,
    propertyPath: string,
    keyframeKey: string,
    value?: number,
    handles?: EditorKeyframeHandles,
    time?: number,
) {
    const trackKey = `${vxkey}.${propertyPath}`
    const track = state.tracks[trackKey]
    if (!track) return;

    const newKeyframe: EditorKeyframe = {
        id: keyframeKey,
        time,
        value,
        vxkey,
        propertyPath: propertyPath,
        handles: handles ?? {
            in: { x: 0.7, y: 0.7 },
            out: { x: 0.3, y: 0.3 }
        },
    };

    track.keyframes[keyframeKey] = newKeyframe;

    updatedOrderedKeyframeIdsLogic(state, trackKey)
    state.addChange();
}

function removePropertyLogic(state: TimelineManagerAPIProps, vxkey: string, propertyPath: string) {
    const generalKey = `${vxkey}.${propertyPath}`;
    const doesTrackExist = state.tracks[generalKey];
    const doesStaticPropExist = state.staticProps[generalKey];

    if (!!doesStaticPropExist) {
        state.removeStaticProp({ state, vxkey, propertyPath, reRender: false });

    }
    if (!!doesTrackExist)
        state.removeTrack({ state, vxkey, propertyPath, reRender: false })
}

function removeStaticPropLogic(state: TimelineManagerAPIProps, staticPropKey: string) {
    const { vxkey, propertyPath } = extractDataFromTrackKey(staticPropKey)
    delete state.staticProps[staticPropKey] // Delete from record

    // Delete from editorObjects vxobject
    const edObject = state.editorObjects[vxkey];
    edObject.staticPropKeys = edObject.staticPropKeys.filter((propKey) => propKey !== staticPropKey);
}

function removeKeyframeLogic(state: TimelineManagerAPIProps, vxkey: string, propertyPath: string, keyframeKey: string) {
    const trackKey = `${vxkey}.${propertyPath}`
    const track = state.tracks[trackKey]
    if (!track) return;

    delete track.keyframes[keyframeKey];
    updatedOrderedKeyframeIdsLogic(state, trackKey)
}

function removeTrackLogic(state: TimelineManagerAPIProps, vxkey: string, propertyPath: string) {
    const trackKey = `${vxkey}.${propertyPath}`;
    const track = state.tracks[trackKey]

    if (!track) return;

    delete state.tracks[trackKey]

    // Remove the track key from the editor object
    const trackKeys = state.editorObjects[vxkey].trackKeys.filter(key => key !== trackKey)
    state.editorObjects[vxkey].trackKeys = trackKeys;
}


function createStaticPropLogic(state: TimelineManagerAPIProps, vxkey: string, propertyPath: string, value: number) {
    const staticPropKey = `${vxkey}.${propertyPath}`
    const newStaticProp: EditorStaticProp = {
        vxkey: vxkey,
        propertyPath: propertyPath,
        value: value
    }
    state.staticProps[staticPropKey] = newStaticProp;              // Add to Record
    state.editorObjects[vxkey].staticPropKeys.push(staticPropKey)  // Add to editorObjects
}


function createTrackLogic(state: TimelineManagerAPIProps, vxkey: string, propertyPath: string) {
    const trackKey = `${vxkey}.${propertyPath}`

    state.editorObjects[vxkey].trackKeys.push(trackKey);

    const newTrack: EditorTrack = {
        vxkey,
        propertyPath,
        keyframes: {},
        orderedKeyframeKeys: []
    }
    state.tracks[trackKey] = newTrack;
}

export function updatedOrderedKeyframeIdsLogic(state: TimelineManagerAPIProps, trackKey: string) {
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