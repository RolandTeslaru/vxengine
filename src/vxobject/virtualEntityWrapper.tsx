// VXEngine - VEXR Labs' proprietary toolset for React Three Fiber
// (c) 2024 VEXR Labs. All Rights Reserved.
// See the LICENSE file in the root directory of this source tree for licensing information.

'use client'

import * as THREE from "three"
import React, { forwardRef, useCallback, useEffect, useRef, useImperativeHandle, useLayoutEffect } from 'react';
import { ReactThreeFiber, useFrame, createPortal, useThree } from '@react-three/fiber';
import VXEntityWrapper from "./entityWrapper";

export interface VXVirtualEntityWrapperProps<T extends THREE.Object3D> {
    vxkey: string;
    name?: string;
    children: React.ReactElement<ReactThreeFiber.Object3DNode<T, any>>;
    params?: string[]
    disabledParams?: string[]
    disableClickSelect?: boolean

    defaultSettings?: {},
    defaultAdditionalSettings?: {}
}

const VXVirtualEntityWrapper = forwardRef<THREE.Object3D, VXVirtualEntityWrapperProps<THREE.Object3D>>(
    (props, ref) => {
        const { children, ...rest } = props

        const originalScene = useThree(state => state.gl);

        const internalRef = useRef<THREE.Object3D | null>(null);
        useImperativeHandle(ref, () => internalRef.current, [])

        // useEffect(() => {
        //     console.log("SCENE vx virtual entity ", originalScene)
        // }, [])

        return (
            <>
                {/* {createPortal(
                    <>
                        <primitive object={internalRef.current}/>
                    </>, 
                    scene 
                )} */}
                <VXEntityWrapper ref={internalRef} {...rest} isVirtual={true}>
                    {children}
                </VXEntityWrapper>
            </>
        );
    }
);

export default VXVirtualEntityWrapper