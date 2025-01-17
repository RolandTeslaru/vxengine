import { CubeCamera } from '@react-three/drei';
import * as THREE from "three"
import { CubeCameraProps } from '@react-three/fiber';
import React, { forwardRef, memo } from 'react'
import { EditableObjectProps } from '../types';
import VXVirtualEntityWrapper from '../virtualEntityWrapper';
import VXEntityWrapper from '../entityWrapper';



export type EditableCubeCameraProps = EditableObjectProps<CubeCameraProps> & {
    ref?: React.Ref<THREE.CubeCamera>;
    settings?: {};
    overrideNodeTreeParentKey?: string
};


export const EditableCubeCamera = memo(
    forwardRef<THREE.CubeCamera, EditableCubeCameraProps>((props, ref) => {
        const { vxkey, ...rest } = props;

        return (
            <VXEntityWrapper
                vxkey={vxkey}
                ref={ref}
                {...rest}
            >
                <cubeCamera />
            </VXEntityWrapper>
        )
    }))
