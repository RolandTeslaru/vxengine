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
    }: VXThreeElementWrapperProps<T> ) => {
        if (vxkey === undefined)
            throw new Error(`ObjectStore: Error initializing vxobject! No vxkey was passed to: ${children}`);

        const vxObject = useVXObjectStore(state => state.objects[vxkey])
        const addObjectToEditorData = useTimelineManagerAPI(state => state.addObjectToEditorData)
        const removeObjectFromEditorData = useTimelineManagerAPI(state => state.removeObjectFromEditorData)
        const { IS_DEVELOPMENT } = useVXEngine();

        // Initialize settings
        const currentTimelineID = useAnimationEngineAPI(state => state.currentTimelineID)

        // Refresh settings when the current timeline changes
        useLayoutEffect(() => {
            if (currentTimelineID === undefined) 
                return

            const mergedSettingsForObject = cloneDeep(initialSettings);
            const rawObject = useAnimationEngineAPI.getState().currentTimeline.objects.find(obj => obj.vxkey === vxkey);

            if (rawObject) {
                const rawSettings = rawObject.settings;
                if (rawSettings) {
                    Object.entries(rawSettings).forEach(([settingKey, rawSetting]) => {
                        mergedSettingsForObject[settingKey].value = rawSetting;
                    })
                }
            }

            useObjectSettingsAPI.getState().initSettingsForObject(vxkey, mergedSettingsForObject, initialSettings)
        }, [currentTimelineID])


        const internalRef = useRef<THREE.Object3D | null>(null);
        useImperativeHandle(ref, () => internalRef.current, [])

        // Initializations
        useLayoutEffect(() => {
            const addObject = useVXObjectStore.getState().addObject;
            const removeObject = useVXObjectStore.getState().removeObject;

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

            // Add the Store
            addObject(newVXEntity, IS_DEVELOPMENT, { icon });
            // Add to Editor
            if (IS_DEVELOPMENT)
                addObjectToEditorData(newVXEntity);
            // Add to animationEngine
            animationEngineInstance.initObjectOnMount(newVXEntity);

            return () => {
                animationEngineInstance.handleObjectUnMount(vxkey);
                removeObject(vxkey, IS_DEVELOPMENT)
                if (IS_DEVELOPMENT)
                    removeObjectFromEditorData(vxkey);
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

            {vxObject && IS_DEVELOPMENT && (
                <ObjectUtils vxkey={vxkey}>
                    {children}
                </ObjectUtils>
            )}
        </>;
    }


export default VXThreeElementWrapper