import { CubeCamera } from '@react-three/drei';
import * as THREE from "three"
import React, { forwardRef, memo } from 'react'
import { EditableObjectProps } from '../types';
import VXVirtualEntityWrapper from '../virtualEntityWrapper';
import VXEntityWrapper from '../entityWrapper';
import { ThreeElements } from '@react-three/fiber';



export type EditableCubeCameraProps = EditableObjectProps<ThreeElements["cubeCamera"]> & {
    ref?: React.Ref<THREE.CubeCamera>;
    settings?: {};
    overrideNodeTreeParentKey?: string
};


export const EditableCubeCamera: React.FC<EditableCubeCameraProps> = memo((props) => {
    const { vxkey, ...rest } = props;

    return (
        <VXEntityWrapper
            vxkey={vxkey}
            {...rest}
        >
            <cubeCamera />
        </VXEntityWrapper>
    )
})
