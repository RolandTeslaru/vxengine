import React, { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import { VXElementPropsWithoutRef, VXElementParams, VXObjectSettings } from "../types"

import { AmbientLight } from "three";
import { ThreeElements } from "@react-three/fiber";
import { withVX } from "../withVX";

export type VXElementAmbientLightProps = VXElementPropsWithoutRef<ThreeElements["ambientLight"]> & {
    ref?: React.RefObject<AmbientLight>;
};

export const defaultSettings: VXObjectSettings = {
    showPositionPath: { title:"show position path", storage: "localStorage", value: false},
    useSplinePath: { title:"use spline path", storage: "disk", value: false },
}

const ambientLightParams: VXElementParams = [
    {propertyPath: 'intensity', type: "number"},
    {propertyPath: "color", type: "color"}
];

const BaseAmbientLight = (props) => {
  return <ambientLight {...props} />;
}

export const EditableAmbientLight = withVX<ThreeElements["ambientLight"]>(BaseAmbientLight, {
    type: "entity",
    params: ambientLightParams,
    icon: "AmbientLight",
});