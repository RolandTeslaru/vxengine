import React, { memo, useRef, useImperativeHandle } from "react";
import { VXElementPropsWithoutRef, VXElementParams } from "../types"
import { ThreeElements } from "@react-three/fiber";
import { Color } from "three";
import { withVX } from "../withVX";

type ColorRepresentation =
    | string
    | number
    | { r: number; g: number; b: number; a?: number }
    | [number, number, number]
    | [number, number, number, number];

export type VXElementColorProps = VXElementPropsWithoutRef<ThreeElements["color"]> & {
    ref?: React.RefObject<Color>;
}

const colorParams: VXElementParams = [
    { type: "color", propertyPath: "", title: "color"}
]

const colorDisabledParams = [
    "position",
    "rotation",
    "scale"
]

const BaseColor = (props) => {
    return <color {...props} />;
}

export const EditableColor = withVX<ThreeElements["color"]>(BaseColor, {
    type: "entity",
    params: colorParams,
    icon: "Color",
    disabledParams: colorDisabledParams,
})