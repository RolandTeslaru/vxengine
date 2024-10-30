'use client'

import React, { memo, forwardRef, useEffect, useLayoutEffect } from "react";
import { EditableObjectProps } from "../types"
import VXEntityWrapper from "../entityWrapper";

import { Mesh } from "three";
import { MeshProps } from "@react-three/fiber";

export type EditableMeshProps = EditableObjectProps<MeshProps> & {
    ref?: React.Ref<Mesh>;
    settings?: {}
};

export const EditableMesh = memo(forwardRef<Mesh, EditableMeshProps>((props, ref) => {
    const { children: meshChildren, settings = {}, ...rest } = props;

    // INITIALIZE settigngs on object mount
    const defaultAdditionalSettings = {
        showPositionPath: false,
    }
    const defaultSettingsForObject = {
        useSplinePath: false,
        setingMeshProp1: true,
        ...settings
    }

    return (
        <VXEntityWrapper 
            ref={ref} 
            defaultSettingsForObject={defaultSettingsForObject}
            defaultAdditionalSettings={defaultAdditionalSettings}
            {...rest}
        >
            <mesh>
                {meshChildren}
            </mesh>
        </VXEntityWrapper>
    );
}));