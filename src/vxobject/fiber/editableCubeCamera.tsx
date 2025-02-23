import { CubeCamera } from '@react-three/drei';
import * as THREE from "three"
import React, { forwardRef, memo } from 'react'
import { VXElementPropsWithoutRef } from '../types';
import VXVirtualEntityWrapper from '../virtualEntityWrapper';
import VXThreeElementWrapper from '../VXThreeElementWrapper';
import { ThreeElements } from '@react-three/fiber';

export type VXElementCubeCameraProps = VXElementPropsWithoutRef<ThreeElements["cubeCamera"]> & {
    ref?: React.RefObject<THREE.CubeCamera>;
    args?: (number | THREE.WebGLCubeRenderTarget)[]
    overrideNodeTreeParentKey?: string
};


export const EditableCubeCamera: React.FC<VXElementCubeCameraProps> = memo((props) => {
    const { vxkey, ...rest } = props;

    return (
        <VXThreeElementWrapper
            vxkey={vxkey}
            {...rest}
        >
            <cubeCamera />
        </VXThreeElementWrapper>
    )
})
