import React, { memo, forwardRef, useRef, useImperativeHandle, useLayoutEffect } from "react";
import { EditableObjectProps, VXObjectParams } from "../types"
import VXEntityWrapper from "../entityWrapper";
import { ThreeElement, ThreeElements } from "@react-three/fiber";
import { Color } from "three";

export type EditableColorProps = EditableObjectProps<ThreeElements["color"]> & {
    ref?: React.Ref<ThreeElement<typeof Color>>;
}

const colorParams: VXObjectParams = [
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

export const EditableColor: React.FC<EditableColorProps> = memo((props) => {
    const { settings = {}, ref, ...rest } = props
    const internalRef = useRef<any>(null);
    useImperativeHandle(ref, () => internalRef.current);

    const colorSettings = {}

    return (
        <VXEntityWrapper
            ref={internalRef}
            params={colorParams}
            settings={colorSettings}
            disabledParams={colorDisabledParams}
            icon="Color"
            {...props}
        >
            <color />
        </VXEntityWrapper>
    )
})