// VXEngine - VEXR Labs' proprietary toolset for React Three Fiber
// (c) 2024 VEXR Labs. All Rights Reserved.
// See the LICENSE file in the root directory of this source tree for licensing information.

import * as THREE from "three"
import React, { forwardRef, useCallback, useEffect, useRef, isValidElement, useMemo, useState } from 'react';
import { useVXObjectStore } from "@vxengine/vxobject";
import { useObjectManagerStore } from "@vxengine/managers/ObjectManager/store";
import { shallow } from "zustand/shallow";
import { useVXEngine } from "@vxengine/engine";
import { ReactThreeFiber, useFrame } from '@react-three/fiber';
import { vxObjectProps } from "@vxengine/types/objectStore";
import { Edges } from "@react-three/drei";
import PositionPath from "./utils/positionPath";
import { computeMorphedAttributes } from "three-stdlib";
import { useTimelineEditorAPI } from "@vxengine/managers/TimelineManager/store";

export interface VXEditableWrapperProps<T extends THREE.Object3D> {
    type: string;
    vxkey: string;
    name?: string;
    children: React.ReactElement<ReactThreeFiber.Object3DNode<T, any>>;
}
const supportedGeometries = ["boxGeometry", "sphereGeometry", "planeGeometry"]


const VXEditableWrapper = forwardRef<THREE.Object3D, VXEditableWrapperProps<THREE.Object3D>>(
    ({ type, children, vxkey, ...props }, forwardedRef) => {
        if (vxkey === undefined) {
            throw new Error(`No vxkey was passed to: ${type}`);
        }

        const addObject = useVXObjectStore(state => state.addObject)
        const removeObject = useVXObjectStore(state => state.removeObject)

        const selectObjects = useObjectManagerStore(state => state.selectObjects)
        const setHoveredObject = useObjectManagerStore(state => state.setHoveredObject)

        const { animationEngine } = useVXEngine();

        const internalRef = useRef<THREE.Object3D | null>(null);

        useEffect(() => {
            if (typeof forwardedRef === 'function') {
                forwardedRef(internalRef.current);
            } else if (forwardedRef) {
                forwardedRef.current = internalRef.current;
            }
        }, [forwardedRef]);

        const ref = internalRef;

        const vxObject = useVXObjectStore(state => state.objects[vxkey])

        const memoizedAddObject = useCallback(addObject, []);
        const memoizedRemoveObject = useCallback(removeObject, []);
        const memoizedSelectObjects = useCallback(selectObjects, []);

        useEffect(() => {
            const newVXObject = {
                type: type,
                ref: ref,
                vxkey: vxkey,
                name: props.name || type,
                settings: { showPositionPath: false }, // Default settings
            };

            memoizedAddObject(newVXObject);
            animationEngine.initObjectOnMount(newVXObject);
            useTimelineEditorAPI.getState().addObjectToEditorData(newVXObject)

            return () => {
                memoizedRemoveObject(vxkey);
            };
        }, [memoizedAddObject, memoizedRemoveObject]);

        const handlePointerOver = () => {
            setHoveredObject(vxObject);
        };
        const handlePointerOut = () => {
            setHoveredObject(null);
        };

        const modifiedChildren = React.cloneElement(children, {
            ref: ref as React.MutableRefObject<THREE.Object3D>, // Allow ref to be a generic Object3D type
            onPointerOver: handlePointerOver,
            onPointerOut: handlePointerOut,
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
            <VxObjectEditorUtils vxObject={vxObject} children={children} />
        </>;
    }
);

export default VXEditableWrapper

interface ObjectEditorUtils {
    vxObject: vxObjectProps
    children: React.ReactElement<ReactThreeFiber.Object3DNode<THREE.Object3D<THREE.Object3DEventMap>, any>, string | React.JSXElementConstructor<any>>
}

const VxObjectEditorUtils: React.FC<ObjectEditorUtils> = React.memo(({ vxObject, children }) => {
    if (!vxObject) return

    const vxkey = vxObject.vxkey;
    const { hoveredObject, selectedObjectKeys } = useObjectManagerStore(state => ({
        hoveredObject: state.hoveredObject,
        selectedObjectKeys: state.selectedObjectKeys
    }), shallow);

    const object3DInnerChildren = children.props.children;

    const containsSupportedGeometries = useMemo(() => {
        if (Array.isArray(object3DInnerChildren)) {
            return object3DInnerChildren.some((element) =>
                isValidElement(element) && supportedGeometries.includes(element.type as string)
            );
        } else if (isValidElement(object3DInnerChildren)) {
            return supportedGeometries.includes(object3DInnerChildren.type as string);
        }
        return false;
    }, [object3DInnerChildren]);

    console.log("Rerendering object editor utils ")

    return (
        <>
            <Edges lineWidth={1.5} scale={1.1} visible={hoveredObject?.vxkey === vxkey && !selectedObjectKeys.includes(vxkey)} renderOrder={1000}>
                <meshBasicMaterial transparent color="#2563eb" depthTest={false} />
            </Edges>
            <Edges lineWidth={1.5} scale={1.1} visible={containsSupportedGeometries && selectedObjectKeys.includes(vxkey)} renderOrder={1000} color="#949494">
            </Edges>

            {vxObject.settings["showPositionPath"] &&
                <PositionPath vxkey={vxkey}/>
            }
        </>
    )
})


const RerenderTest = () => {
    
    return (
        <>
        
        </>
    )
}