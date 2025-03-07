import React, { memo, useRef, useImperativeHandle } from "react";
import { VXElementPropsWithoutRef, VXElementParams } from "../types"
import VXThreeElementWrapper from "../VXThreeElementWrapper";
import { ThreeElements } from "@react-three/fiber";
import { Color } from "three";

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

export const EditableColor: React.FC<VXElementColorProps> = (props) => {
    const { ...rest } = props

    return (
        <VXThreeElementWrapper
            params={colorParams}
            disabledParams={colorDisabledParams}
            icon="Color"
            {...rest}
        >
            <color />
        </VXThreeElementWrapper>
    )
}