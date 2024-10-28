'use client'

import React, { forwardRef } from "react";
import { EditableObjectProps } from "../types"
import VXObjectWrapper from "../wrapper";

import { LineLoop } from "three";
import { LineLoopProps } from "@react-three/fiber";

export type EditableLineLoopProps = EditableObjectProps<LineLoopProps> & {
    ref?: React.Ref<LineLoop>;
};

export const EditableLineLoop = forwardRef<LineLoop, EditableLineLoopProps>((props, ref) => {
    // INITIALIZE Additional Settings
    const defaultAdditionalSettings = {
        showPositionPath: false,
    }

    return (
        <VXObjectWrapper 
            type="object" 
            ref={ref} 
            defaultAdditionalSettings={defaultAdditionalSettings}
            {...props}
        >
            <lineLoop ref={ref} />
        </VXObjectWrapper>
    );
})