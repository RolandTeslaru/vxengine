// VXEngine - VEXR Labs' proprietary toolset for React Three Fiber
// (c) 2024 VEXR Labs. All Rights Reserved.
// See the LICENSE file in the root directory of this source tree for licensing information.

'use client'

import * as THREE from "three"
import React, { forwardRef, useCallback, useEffect, useRef, useImperativeHandle} from 'react';
import { useVXObjectStore } from "@vxengine/vxobject";
import { useObjectManagerAPI } from "@vxengine/managers/ObjectManager/store";
import { getVXEngineState, useVXEngine } from "@vxengine/engine";
import { ReactThreeFiber, useFrame } from '@react-three/fiber';
import { vxObjectProps } from "@vxengine/types/objectStore";
import { useTimelineEditorAPI } from "@vxengine/managers/TimelineManager/store";
import ObjectUtils from "./utils/ObjectUtils";

export interface VXObjectWrapperProps<T extends THREE.Object3D> {
    type: string;
    vxkey: string;
    name?: string;
    children: React.ReactElement<ReactThreeFiber.Object3DNode<T, any>>;
    params?: string[]
    disabledParams?: string[]
}

const VXObjectWrapper = forwardRef<THREE.Object3D, VXObjectWrapperProps<THREE.Object3D>>(
    ({ type, children, vxkey, params, disabledParams, ...props }, ref) => {
        if (vxkey === undefined) throw new Error(`No vxkey was passed to: ${type}`);

        const addObject = useVXObjectStore(state => state.addObject)
        const removeObject = useVXObjectStore(state => state.removeObject)
        const vxObject = useVXObjectStore(state => state.objects[vxkey])

        const selectObjects = useObjectManagerAPI(state => state.selectObjects)
        const setHoveredObject = useObjectManagerAPI(state => state.setHoveredObject)

        const animationEngine = useVXEngine(state => state.animationEngine)

        const internalRef = useRef<THREE.Object3D | null>(null);
        useImperativeHandle(ref, () => internalRef.current, [])

        const memoizedAddObject = useCallback(addObject, []);
        const memoizedRemoveObject = useCallback(removeObject, []);
        const memoizedSelectObjects = useCallback(selectObjects, []);

        useEffect(() => {
            const newVXObject: vxObjectProps = {
                type: "entity",
                ref: internalRef,
                vxkey: vxkey,
                name: props.name || vxkey,
                params: params || [],
                disabledParams: disabledParams || [],
            };

            memoizedAddObject(newVXObject);
            animationEngine.initObjectOnMount(newVXObject);
            
            return () => {
                memoizedRemoveObject(vxkey);
            };
        }, [memoizedAddObject, memoizedRemoveObject]);

        const handlePointerOver = () => setHoveredObject(vxObject);
        const handlePointerOut = () => setHoveredObject(null);

        const modifiedChildren = React.cloneElement(children, {
            ref: internalRef as React.MutableRefObject<THREE.Object3D>, // Allow ref to be a generic Object3D type
            // onPointerOver: handlePointerOver,
            // onPointerOut: handlePointerOut,
            onClick: () => memoizedSelectObjects([vxkey]),
            onPointerDown: (e) => e.stopPropagation(),
            ...props,
        },
            <>
                {children.props.children}
            </>
        );

        return <>
            {modifiedChildren}
            {vxObject && (
                <ObjectUtils vxkey={vxkey}>
                    {children}
                </ObjectUtils>
            )}
        </>;
    }
);

export default VXObjectWrapper