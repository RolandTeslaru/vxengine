'use client'

import React, { forwardRef } from "react";
import { Lightformer, LightProps } from "@react-three/drei";
import { EditableObjectProps } from "../types";
import VXObjectWrapper from "../wrapper";

export type EditableLightformerProps = EditableObjectProps<LightProps> & {
    ref?: React.Ref<LightProps>;
    settings?: {}
};

export const EditableLightFormer = forwardRef<typeof Lightformer, EditableLightformerProps>((props, ref) => {
    return (
        <VXObjectWrapper type="object" ref={ref} {...props} >
            <Lightformer />
        </VXObjectWrapper>
    )
})