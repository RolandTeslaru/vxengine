import React, { memo, forwardRef, useEffect, useLayoutEffect } from "react";
import { EditableObjectProps, VXObjectSettings } from "../types"
import VXEntityWrapper from "../entityWrapper";

import { Mesh } from "three";
import { ThreeElement, ThreeElements } from "@react-three/fiber";

export type EditableMeshProps = EditableObjectProps<ThreeElements["mesh"]> & {
    ref?: React.Ref<Mesh>;
    settings?: {}
};

export const defaultSettings: VXObjectSettings = {
    showPositionPath: { title:"show position path", storage: "localStorage", value: false},
    useSplinePath: { title:"use spline path", storage: "disk", value: false },
    useRotationDegrees: { title:"use rotation degrees", storage: "disk", value: false },
}


export const EditableMesh = memo(forwardRef<Mesh, EditableMeshProps>((props, ref) => {
    const { children: meshChildren, settings = {}, ...rest } = props;

    const mergedSettings = {
        ...defaultSettings,
        ...settings
    }

    return (
        <VXEntityWrapper 
            ref={ref} 
            settings={mergedSettings}
            {...rest}
        >
            <mesh>
                {meshChildren}
            </mesh>
        </VXEntityWrapper>
    );
}));