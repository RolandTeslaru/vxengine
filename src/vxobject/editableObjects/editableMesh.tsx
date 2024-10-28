'use client'

import React, { forwardRef, useEffect, useLayoutEffect } from "react";
import { EditableObjectProps } from "../types"
import VXObjectWrapper from "../wrapper";

import { Mesh } from "three";
import { MeshProps } from "@react-three/fiber";

export type EditableMeshProps = EditableObjectProps<MeshProps> & {
    ref?: React.Ref<Mesh>;
    settings?: {}
};

export const EditableMesh = forwardRef<Mesh, EditableMeshProps>((props, ref) => {
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
        <VXObjectWrapper 
            type="object" 
            ref={ref} 
            defaultSettingsForObject={defaultSettingsForObject}
            defaultAdditionalSettings={defaultAdditionalSettings}
            {...rest}
        >
            <mesh>
                {meshChildren}
            </mesh>
        </VXObjectWrapper>
    );
});