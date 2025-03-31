import React from "react";
import { VXElementPropsWithoutRef, VXObjectSettings } from "../types"

import { Mesh } from "three";
import { ThreeElements } from "@react-three/fiber";
import { withVX } from "../withVX";

export type VXElementMeshProps = VXElementPropsWithoutRef<ThreeElements["mesh"]> & {
    ref?: React.RefObject<Mesh>;
};

export const defaultSettings: VXObjectSettings = {
    showPositionPath: { title: "show position path", storage: "localStorage", value: false },
    useSplinePath: { title: "use spline path", storage: "disk", value: false },
    useRotationDegrees: { title: "use rotation degrees", storage: "disk", value: false },
}

const BaseMesh = (props) => {
    const { children, ...restProps } = props;
    return <mesh {...restProps}>{children}</mesh>;
}


export const EditableMesh = withVX<ThreeElements["mesh"]>(BaseMesh, {
    type: "entity",
    settings: defaultSettings,
});