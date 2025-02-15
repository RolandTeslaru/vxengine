import React, { memo, forwardRef, useRef, useImperativeHandle, useLayoutEffect } from "react";
import { EditableObjectProps, VXObjectParams } from "../types"
import VXEntityWrapper from "../entityWrapper";
import { ColorProps } from "@react-three/fiber";

export type EditableColorProps = EditableObjectProps<ColorProps> & {
    ref?: React.Ref<ColorProps>;
}

const colorParams: VXObjectParams = {
    color: {
        type: "color",  
        overwritePropertyPath: "_"
    }
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
}))