import React, { memo, forwardRef, useRef, useImperativeHandle, useLayoutEffect } from "react";
import { VXElementPropsWithoutRef, VXElementParams } from "../types"
import VXThreeElementWrapper from "../VXThreeElementWrapper";
import { ThreeElement, ThreeElements } from "@react-three/fiber";
import { Color } from "three";

export type VXElementColorProps = VXElementPropsWithoutRef<ThreeElements["color"]> & {
    ref?: React.RefObject<ThreeElement<typeof Color>>;
}

const colorParams: VXElementParams = [
    {
        type: "color",  
        propertyPath: "",
        title: "color"
    }
]
const colorDisabledParams = [
    "position",
    "rotation",
    "scale"
]

export const EditableColor: React.FC<VXElementColorProps> = memo((props) => {
    const { settings = {}, ref, ...rest } = props
    const internalRef = useRef<any>(null);
    useImperativeHandle(ref, () => internalRef.current);

    const colorSettings = {}

    return (
        <VXThreeElementWrapper
            ref={internalRef}
            params={colorParams}
            settings={colorSettings}
            disabledParams={colorDisabledParams}
            icon="Color"
            {...props}
        >
            <color />
        </VXThreeElementWrapper>
    )
})