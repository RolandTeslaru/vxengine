import { CubeCamera } from '@react-three/drei';
import * as THREE from "three"
import React, { forwardRef, memo } from 'react'
import { VXElementPropsWithoutRef } from '../types';
import VXVirtualEntityWrapper from '../virtualEntityWrapper';
import VXThreeElementWrapper from '../VXThreeElementWrapper';
import { ThreeElements } from '@react-three/fiber';

export type VXElementCubeCameraProps = VXElementPropsWithoutRef<ThreeElements["cubeCamera"]> & {
    ref?: React.RefObject<THREE.CubeCamera>;
    overrideNodeTreeParentKey?: string
};


export const EditableCubeCamera: React.FC<VXElementCubeCameraProps> = (props) => {
    return (
        <VXThreeElementWrapper {...props}>
            <cubeCamera />
        </VXThreeElementWrapper>
    )
}
