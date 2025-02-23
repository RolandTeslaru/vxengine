import React, { memo, forwardRef, useEffect, useLayoutEffect, ComponentProps } from "react";
import { VXElementPropsWithoutRef, VXObjectSettings } from "../types"
import VXThreeElementWrapper from "../VXThreeElementWrapper";

import { Mesh } from "three";
import { ThreeElements } from "@react-three/fiber";

export type VXElementMeshProps = VXElementPropsWithoutRef<ThreeElements["mesh"]> & {
    ref?: React.RefObject<Mesh>;
};

export const defaultSettings: VXObjectSettings = {
    showPositionPath: { title:"show position path", storage: "localStorage", value: false},
    useSplinePath: { title:"use spline path", storage: "disk", value: false },
    useRotationDegrees: { title:"use rotation degrees", storage: "disk", value: false },
}


export const EditableMesh: React.FC<VXElementMeshProps> = (props) => {
    const { children: meshChildren, settings = {}, ref, ...rest } = props;

    const mergedSettings = {
        ...defaultSettings,
        ...settings
    }

    return (
        <VXThreeElementWrapper 
            ref={ref}
            settings={mergedSettings}
            {...rest}
        >
            <mesh>
                {meshChildren}
            </mesh>
        </VXThreeElementWrapper>
    );
}