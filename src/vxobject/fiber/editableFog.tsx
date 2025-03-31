import React, { forwardRef } from "react";
import { VXElementPropsWithoutRef, VXElementParams } from "../types"

import { Fog } from "three";
import { ThreeElements } from "@react-three/fiber";
import { withVX } from "../withVX";
export type VXElementFogProps = VXElementPropsWithoutRef<ThreeElements["fog"]> & {
    ref?: React.RefObject<Fog>;
};

const BaseFog = (props) => <fog {...props} />

const params: VXElementParams = [
    { type: "color", propertyPath: "color" },
    { type: "number", propertyPath: "near" },
    { type: "number", propertyPath: "far" },
]

export const EditableFog = withVX<ThreeElements["fog"]>(BaseFog, {
    type: "custom",
    overrideNodeTreeParentKey: "scene",
    params,
    icon: "Fog",
    settings: {},
})