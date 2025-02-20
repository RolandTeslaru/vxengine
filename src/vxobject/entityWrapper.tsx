// VXEngine - VEXR Labs' proprietary toolset for React Three Fiber
// (c) 2024 VEXR Labs. All Rights Reserved.
// See the LICENSE file in the root directory of this source tree for licensing information.

import * as THREE from "three"
import React, { forwardRef, useCallback, useEffect, useRef, useImperativeHandle, useLayoutEffect } from 'react';
import { useVXObjectStore } from '@vxengine/managers/ObjectManager';
import { useObjectManagerAPI } from "@vxengine/managers/ObjectManager/stores/managerStore";
import { useVXEngine } from "@vxengine/engine";
import { ReactThreeFiber, ThreeEvent, useFrame } from '@react-three/fiber';
import { vxObjectProps, vxObjectTypes } from "@vxengine/managers/ObjectManager/types/objectStore";
import ObjectUtils from "./utils/ObjectUtils";
import { useAnimationEngineAPI } from "@vxengine/AnimationEngine";
import { useObjectSettingsAPI } from "@vxengine/managers/ObjectManager";
import { VXObjectParams, VXObjectSettings } from "./types";
import animationEngineInstance from "@vxengine/singleton";
import { cloneDeep } from "lodash";

export interface VXEntityWrapperProps<T extends THREE.Object3D> {
    vxkey: string;
    name?: string;
    children: React.ReactElement<ReactThreeFiber.ThreeElement<any>>;
    params?: VXObjectParams
    disabledParams?: string[]
    disableClickSelect?: boolean
    isVirtual?: boolean
    addToNodeTree?: boolean
    overrideNodeTreeParentKey?: string;
    overrideNodeType?: string

    settings?: VXObjectSettings,

    icon?: string
}

declare module 'three' {
    interface Object3D {
        vxkey: string;
        rotationDegrees: THREE.Vector3
    }
}

const initializeDegreeRotations = (obj: THREE.Object3D) => {
    obj.rotationDegrees = new THREE.Vector3(0,0,0);
}

const VXEntityWrapper = React.memo(forwardRef<THREE.Object3D, VXEntityWrapperProps<THREE.Object3D>>(
    ({
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
        ...props
    }, ref) => {
        if (vxkey === undefined)
            throw new Error(`ObjectStore: Error intializing vxobject! No vxkey was passed to: ${children}`);

        const vxObject = useVXObjectStore(state => state.objects[vxkey])
        const { IS_DEVELOPMENT } = useVXEngine();

        // Initialize settings
        const currentTimelineID = useAnimationEngineAPI(state => state.currentTimelineID)

        // Refresh settings when the current timeline changes
        useLayoutEffect(() => {
            if (currentTimelineID === undefined) return
            
            const mergedSettingsForObject = cloneDeep(initialSettings);
            const rawObject = useAnimationEngineAPI.getState().currentTimeline.objects.find(obj => obj.vxkey === vxkey);
            
            if(rawObject){
                const rawSettings = rawObject.settings;
                if(rawSettings){
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

            const name = props.name || vxkey
            const parentKey = overrideNodeTreeParentKey || internalRef.current?.parent?.vxkey || null

            if(internalRef.current)
                initializeDegreeRotations(internalRef.current)

            const newVXEntity: vxObjectProps = {
                type: isVirtual ? "virtualEntity" : "entity",
                ref: internalRef,
                vxkey,
                name,
                params: params || [],
                disabledParams: disabledParams || [],
                parentKey,
            };            
            
            addObject(newVXEntity, IS_DEVELOPMENT, {icon});
            animationEngineInstance.initObjectOnMount(newVXEntity);

            return () => {
                animationEngineInstance.handleObjectUnMount(vxkey);
                removeObject(vxkey, IS_DEVELOPMENT)
            }
        }, []);

        const modifiedChildren = React.cloneElement(children, {
            ref: internalRef as React.MutableRefObject<THREE.Object3D>, // Allow ref to be a generic Object3D type
            ...props,
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
));

export default VXEntityWrapper