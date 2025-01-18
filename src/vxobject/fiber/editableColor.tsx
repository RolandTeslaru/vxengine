'use client'

import React, { memo, forwardRef, useRef, useImperativeHandle } from "react";
import { EditableObjectProps, VXObjectParams } from "../types"
import VXEntityWrapper from "../entityWrapper";
import { ColorProps } from "@react-three/fiber";

export type EditableColorProps = EditableObjectProps<ColorProps> & {
    ref?: React.Ref<ColorProps>;
}

const colorParams: VXObjectParams = {
    color: { type: "color" }
}
const colorDisabledParams = [
    "position",
    "rotation",
    "scale"
]

export const EditableColor = memo(forwardRef<ColorProps, EditableColorProps>((props, ref) => {
    const { settings = {}, ...rest } = props
    const internalRef = useRef<any>(null);
    useImperativeHandle(ref, () => internalRef.current);

    const colorDefaultSettings = {}
    const colorDefaultAdditionalSettings = {}

    // console.log("COLOR REF ", internalRef)

    return (
        <VXEntityWrapper
            ref={internalRef}
            params={colorParams}
            defaultSettings={colorDefaultSettings}
            defaultAdditionalSettings={colorDefaultAdditionalSettings}
            disabledParams={colorDisabledParams}
            {...props}
        >
            <color />
        </VXEntityWrapper>
    )
}))