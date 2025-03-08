// VXEngine - VEXR Labs' proprietary toolset for React Three Fiber
// (c) 2024 VEXR Labs. All Rights Reserved.
// See the LICENSE file in the root directory of this source tree for licensing information.

import * as THREE from "three"
import React, { forwardRef, useCallback, useEffect, useRef, useImperativeHandle, useLayoutEffect } from 'react';
import { useVXObjectStore } from '@vxengine/managers/ObjectManager';
import { useVXEngine } from "@vxengine/engine";
import { ReactThreeFiber, ThreeElements } from '@react-three/fiber';
import { vxObjectProps } from "@vxengine/managers/ObjectManager/types/objectStore";
import ObjectUtils from "./utils/ObjectUtils";
import { useAnimationEngineAPI } from "@vxengine/AnimationEngine";
import { useObjectSettingsAPI } from "@vxengine/managers/ObjectManager";
import { VXElementParams, VXObjectSettings, VXPrimitiveProps } from "./types";
import animationEngineInstance from "@vxengine/singleton";
import { cloneDeep } from "lodash";
import { useTimelineManagerAPI } from "@vxengine/managers/TimelineManager";
import { useTimelineEditorAPI } from "@vxengine/managers/TimelineManager/TimelineEditor/store";
import { EditorTrack, EditorKeyframe, EditorStaticProp, EditorObject } from "@vxengine/types/data/editorData";
import { v4 as uuidv4 } from 'uuid';
import { TimelineMangerAPIProps } from "@vxengine/managers/TimelineManager/types/store";
import { produce } from "immer";

export type VXThreeElementWrapperProps<T extends keyof ThreeElements> =
    Omit<ThreeElements[T], "ref"> & VXPrimitiveProps &
    {
        ref?: React.RefObject<any>; // Ref has the " | Readonly<>" which breaks typing idk
        children: React.ReactElement<ReactThreeFiber.ThreeElement<any>>;
        disabledParams?: string[];
        disableClickSelect?: boolean;
        isVirtual?: boolean;
        overrideNodeType?: string;
    };

declare module 'three' {
    interface Object3D {
        vxkey: string;
        rotationDegrees: THREE.Vector3
    }
}

const initializeDegreeRotations = (obj: THREE.Object3D) => {
    obj.rotationDegrees = new THREE.Vector3(0, 0, 0);
}

const threeDefaultParams: VXElementParams = [
    { type: "number", propertyPath: "position.x" },
    { type: "number", propertyPath: "position.y" },
    { type: "number", propertyPath: "position.z" },
    { type: "number", propertyPath: "scale.x" },
    { type: "number", propertyPath: "scale.y" },
    { type: "number", propertyPath: "scale.z" },
    { type: "number", propertyPath: "rotation.x" },
    { type: "number", propertyPath: "rotation.y" },
    { type: "number", propertyPath: "rotation.z" },
    { type: "number", propertyPath: "rotationDegrees.x" },
    { type: "number", propertyPath: "rotationDegrees.y" },
    { type: "number", propertyPath: "rotationDegrees.z" },
]

const VXThreeElementWrapper = <T extends keyof ThreeElements>({
    ref,
    children,
    vxkey,
    params,
    disabledParams,
    disableClickSelect = false,
    isVirtual = false,
    addToNodeTree = true,
    settings: initialSettings = {},
    overrideNodeTreeParentKey,
    icon,
    ...threeElementProps
}: VXThreeElementWrapperProps<T>) => {
    if (vxkey === undefined)
        throw new Error(`ObjectStore: Error initializing vxobject! No vxkey was passed to: ${children}`);

    const internalRef = useRef<THREE.Object3D | null>(null);
    useImperativeHandle(ref, () => internalRef.current, [])


    const { IS_DEVELOPMENT } = useVXEngine();
    const currentTimelineID = useAnimationEngineAPI(state => state.currentTimelineID)

    useLayoutEffect(() => {
        if (currentTimelineID === undefined || IS_DEVELOPMENT === false)
            return

        const animationEngineAPI = useAnimationEngineAPI.getState();
        const timelineEditorAPI = useTimelineEditorAPI.getState();
        const timelineMangerAPI = useTimelineManagerAPI.getState();
        const objectSettingsAPI = useObjectSettingsAPI.getState();

        const rawObject = animationEngineAPI.currentTimeline.objects.find(obj => obj.vxkey === vxkey);
        // Create editor Tracks for object
        const tracks: Record<string, EditorTrack> = {}
        const trackKeys: string[] = []

        const staticProps: Record<string, EditorStaticProp> = {}
        const staticPropKeys: string[] = []

        if (rawObject) {
            // Handle settings
            const mergedSettingsForObject = cloneDeep(initialSettings);

            const rawSettings = rawObject.settings;
            if (rawSettings) {
                Object.entries(rawSettings).forEach(([settingKey, rawSetting]) => {
                    mergedSettingsForObject[settingKey].value = rawSetting;
                })
            }

            objectSettingsAPI.initSettingsForObject(vxkey, mergedSettingsForObject, initialSettings)

            // Handle Track
            rawObject.tracks.forEach(rawTrack => {
                const trackKey = `${vxkey}.${rawTrack.propertyPath}`
                trackKeys.push(trackKey)

                const editorTrack: EditorTrack = {
                    keyframes: {} as Record<string, EditorKeyframe>,
                    propertyPath: rawTrack.propertyPath,
                    vxkey,
                    orderedKeyframeKeys: []
                }

                rawTrack.keyframes.forEach(rawKeyframe => {
                    const keyframeKey = rawKeyframe.keyframeKey || `keyframe-${uuidv4()}`;
                    if (!rawKeyframe.keyframeKey)
                        rawKeyframe.keyframeKey = keyframeKey;

                    const editorKeyframe: EditorKeyframe = {
                        id: keyframeKey,
                        vxkey,
                        propertyPath: rawTrack.propertyPath,
                        time: rawKeyframe.time,
                        value: rawKeyframe.value,
                        handles: {
                            in: {
                                x: rawKeyframe.handles[0],
                                y: rawKeyframe.handles[1]
                            },
                            out: {
                                x: rawKeyframe.handles[2],
                                y: rawKeyframe.handles[3]
                            }
                        }
                    }
                    editorTrack.keyframes[keyframeKey] = editorKeyframe;
                    editorTrack.orderedKeyframeKeys.push(keyframeKey);

                    tracks[trackKey] = editorTrack
                })
            })

            // Handle Static prop
            rawObject.staticProps.forEach(staticProp => {
                const staticPropKey = `${vxkey}.${staticProp.propertyPath}`;
                staticPropKeys.push(staticPropKey);

                const newStaticProp: EditorStaticProp = {
                    vxkey,
                    value: staticProp.value,
                    propertyPath: staticProp.propertyPath
                };
                staticProps[staticPropKey] = newStaticProp;
            })

        }

        const editorObject: EditorObject = {
            vxkey,
            trackKeys,
            staticPropKeys
        }

        useTimelineManagerAPI.setState(produce((state: TimelineMangerAPIProps) => {
            state.tracks = { ...state.tracks, ...tracks }
            state.staticProps = { ...state.staticProps, ...staticProps }
            state.editorObjects[vxkey] = editorObject;
        }))

        timelineEditorAPI.addObjectToTrackTree(vxkey, tracks);

        return () => {
            useTimelineManagerAPI.setState(produce((state: TimelineMangerAPIProps) => {
                Object.entries(state.tracks).forEach(([trackKey, _track]) => {
                    if (_track.vxkey === vxkey)
                        delete state.tracks[trackKey]
                })

                Object.entries(state.staticProps).forEach(([staticPropKey, _staticProp]) => {
                    if (_staticProp.vxkey === vxkey)
                        delete state.staticProps[staticPropKey];
                })

                delete state.editorObjects[vxkey]
            }))

            timelineEditorAPI.removeObjectFromTrackTree(vxkey)
        }
    }, [currentTimelineID])

    useLayoutEffect(() => {
        const vxObjectStoreAPI = useVXObjectStore.getState();

        const name = threeElementProps.name || vxkey
        const parentKey = overrideNodeTreeParentKey || internalRef.current?.parent?.vxkey || null

        if (internalRef.current)
            initializeDegreeRotations(internalRef.current)

        const newVXEntity: vxObjectProps = {
            type: isVirtual ? "virtualEntity" : "entity",
            ref: internalRef,
            vxkey,
            name,
            params: params ? [...threeDefaultParams, ...params] : threeDefaultParams,
            disabledParams: disabledParams || [],
            parentKey,
        };

        vxObjectStoreAPI.addObject(newVXEntity, IS_DEVELOPMENT, { icon });

        animationEngineInstance.registerObject(newVXEntity);

        return () => {
            animationEngineInstance.unregisterObject(vxkey);
            vxObjectStoreAPI.removeObject(vxkey, IS_DEVELOPMENT)
        }
    }, []);


    const modifiedChildren = React.cloneElement(children, {
        ref: internalRef,
        vxkey,
        ...threeElementProps,
    },
        <>
            {children.props.children}
        </>
    );

    return <>
        {modifiedChildren}

        {IS_DEVELOPMENT && (
            <ObjectUtils vxkey={vxkey}>
                {children}
            </ObjectUtils>
        )}
    </>;
}


export default VXThreeElementWrapper