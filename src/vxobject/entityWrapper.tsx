// VXEngine - VEXR Labs' proprietary toolset for React Three Fiber
// (c) 2024 VEXR Labs. All Rights Reserved.
// See the LICENSE file in the root directory of this source tree for licensing information.

'use client'

import * as THREE from "three"
import React, { forwardRef, useCallback, useEffect, useRef, useImperativeHandle, useLayoutEffect } from 'react';
import { useVXObjectStore } from '@vxengine/managers/ObjectManager';
import { useObjectManagerAPI } from "@vxengine/managers/ObjectManager/stores/managerStore";
import { getVXEngineState, useVXEngine } from "@vxengine/engine";
import { ReactThreeFiber, ThreeEvent, useFrame } from '@react-three/fiber';
import { vxObjectProps, vxObjectTypes } from "@vxengine/managers/ObjectManager/types/objectStore";
import ObjectUtils from "./utils/ObjectUtils";
import { useAnimationEngineAPI } from "@vxengine/AnimationEngine";
import { useObjectSettingsAPI } from "@vxengine/managers/ObjectManager";

export interface VXEntityWrapperProps<T extends THREE.Object3D> {
    vxkey: string;
    name?: string;
    children: React.ReactElement<ReactThreeFiber.Object3DNode<T, any>>;
    params?: string[]
    disabledParams?: string[]
    disableClickSelect?: boolean
    isVirtual?: boolean

    defaultSettings?: {},
    defaultAdditionalSettings?: {}
}

const VXEntityWrapper = React.memo(forwardRef<THREE.Object3D, VXEntityWrapperProps<THREE.Object3D>>(
    ({
        children,
        vxkey,
        params,
        disabledParams,
        disableClickSelect = false,
        isVirtual = false,
        defaultSettings = {},
        defaultAdditionalSettings = {},
        ...props
    }, ref) => {
        if (vxkey === undefined) 
            throw new Error(`ObjectStore: Error intializing vxobject! No vxkey was passed to: ${children}`);

        const animationEngine = useVXEngine(state => state.animationEngine)
        const IS_DEVELOPMENT = useVXEngine(state => state.IS_DEVELOPMENT);

        const addObject = useVXObjectStore(state => state.addObject)
        const removeObject = useVXObjectStore(state => state.removeObject)
        const vxObject = useVXObjectStore(state => state.objects[vxkey])

        const selectObjects = useObjectManagerAPI(state => state.selectObjects)
        const setHoveredObject = useObjectManagerAPI(state => state.setHoveredObject)

        // Initialize settings
        const currentTimelineID = useAnimationEngineAPI(state => state.currentTimelineID)
        const currentSettingsForObject = useAnimationEngineAPI(state => state.timelines[currentTimelineID]?.settings[vxkey])

        useLayoutEffect(() => {
            useObjectSettingsAPI.getState().initAdditionalSettingsForObject(vxkey, defaultAdditionalSettings)
        }, [])


        // Refresh settings when the current timeline changes
        useLayoutEffect(() => {
            if (currentTimelineID === undefined) return
            const mergedSettingsForObject = {
                ...defaultSettings,
                ...currentSettingsForObject
            }
            useObjectSettingsAPI.getState().initSettingsForObject(vxkey, mergedSettingsForObject, defaultSettings)
        }, [currentTimelineID])


        const internalRef = useRef<THREE.Object3D | null>(null);
        useImperativeHandle(ref, () => internalRef.current, [])

        const memoizedAddObject = useCallback(addObject, []);
        const memoizedRemoveObject = useCallback(removeObject, []);
        const memoizedSelectObjects = useCallback(selectObjects, []);

        useLayoutEffect(() => {
            const newVXEntity: vxObjectProps = {
                type: isVirtual ? "virtualEntity" : "entity",
                ref: internalRef,
                vxkey: vxkey,
                name: props.name || vxkey,
                params: params || [],
                disabledParams: disabledParams || [],
            };

            memoizedAddObject(newVXEntity);
            animationEngine.initObjectOnMount(newVXEntity);

            return () => memoizedRemoveObject(vxkey);
        }, [memoizedAddObject, memoizedRemoveObject]);

        const handlePointerOver = () => setHoveredObject(vxObject);
        const handlePointerOut = () => setHoveredObject(null);

        const onClick = useCallback(() => {
            if (disableClickSelect === false && IS_DEVELOPMENT)
                memoizedSelectObjects([vxkey], "entity", true)
        }, [])
        
        const onPointerDown = useCallback((e: ThreeEvent<PointerEvent>) => {
            e.stopPropagation()
        }, [])

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