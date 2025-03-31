import { CubeCamera } from '@react-three/drei';
import * as THREE from "three"
import React, { forwardRef, memo } from 'react'
import { VXElementPropsWithoutRef } from '../types';
import { ThreeElements } from '@react-three/fiber';
import { withVX } from '../withVX';

export type VXElementCubeCameraProps = VXElementPropsWithoutRef<ThreeElements["cubeCamera"]> & {
    ref?: React.RefObject<THREE.CubeCamera>;
    overrideNodeTreeParentKey?: string
};

const BaseCubeCamera = (props) => {
    return <cubeCamera {...props} />
}

export const EditableCubeCamera = withVX<ThreeElements["cubeCamera"]>(BaseCubeCamera, {
    type: "entity",
    vxkey: "cubeCamera",
    name: "Cube Camera",
    icon: "CubeCamera",
})
