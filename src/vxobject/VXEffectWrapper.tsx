// VXEngine - VEXR Labs' proprietary toolset for React Three Fiber
// (c) 2024 VEXR Labs. All Rights Reserved.
// See the LICENSE file in the root directory of this source tree for licensing information.

import * as THREE from "three"
import React, { useRef, useImperativeHandle, useLayoutEffect } from 'react';
import { useVXObjectStore } from '@vxengine/managers/ObjectManager';
import { useVXEngine } from "@vxengine/engine";
import { ReactThreeFiber, ThreeElements } from '@react-three/fiber';
import { vxObjectProps } from "@vxengine/managers/ObjectManager/types/objectStore";
import { useAnimationEngineAPI } from "@vxengine/AnimationEngine";
import { VXElementParams, VXPrimitiveProps } from "./types";
import animationEngineInstance from "@vxengine/singleton";
import { cleanupEditorObject, initTimelineEditorObject } from "./utils/handleObjectEditorData";

export type VXEffectWrapper<T extends keyof ThreeElements> =
    Omit<ThreeElements[T], "ref"> & VXPrimitiveProps &
    {
        ref?: React.RefObject<any>; // Ref has the " | Readonly<>" which breaks typing idk
        children: React.ReactElement<ReactThreeFiber.ThreeElement<any>>;
        disabledParams?: string[];
        disableClickSelect?: boolean;
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

const VXEffectWrapper = <T extends keyof ThreeElements>({
    ref,
    children,
    vxkey,
    params,
    disabledParams,
    disableClickSelect = false,
    addToNodeTree = true,
    settings: initialSettings = {},
    overrideNodeTreeParentKey,
    icon,
    ...threeElementProps
}: VXEffectWrapper<T>) => {
    if (vxkey === undefined)
        throw new Error(`ObjectStore: Error initializing vxobject! No vxkey was passed to: ${children}`);

    const internalRef = useRef<THREE.Object3D | null>(null);
    useImperativeHandle(ref, () => internalRef.current, [])


    const { IS_DEVELOPMENT } = useVXEngine();
    const currentTimelineID = useAnimationEngineAPI(state => state.currentTimelineID)

    useLayoutEffect(() => {
        if (currentTimelineID === undefined || IS_DEVELOPMENT === false)
            return

        initTimelineEditorObject(vxkey, initialSettings)

        return () => { cleanupEditorObject(vxkey) }
    }, [currentTimelineID])

    useLayoutEffect(() => {
        const vxObjectStoreAPI = useVXObjectStore.getState();

        const name = threeElementProps.name || vxkey

        if (internalRef.current)
            initializeDegreeRotations(internalRef.current)

        const newVXEntity: vxObjectProps = {
            type: "effect",
            ref: internalRef,
            vxkey,
            name,
            params: params ? [...threeDefaultParams, ...params] : threeDefaultParams,
            disabledParams: disabledParams || [],
            parentKey: "effects",
        };

        vxObjectStoreAPI.addObject(newVXEntity, IS_DEVELOPMENT, { icon });

        animationEngineInstance.handleObjectMount(newVXEntity);

        return () => {
            animationEngineInstance.handleObjectUnMount(vxkey);
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
    </>;
}


export default VXEffectWrapper