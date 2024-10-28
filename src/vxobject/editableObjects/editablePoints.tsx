'use client'

import React, { forwardRef, useEffect } from "react";
import { EditableObjectProps } from "../types"
import VXObjectWrapper from "../wrapper";

import { Points } from "three";
import { PointsProps } from "@react-three/fiber";

export type EditablePointsProps = EditableObjectProps<PointsProps> & {
    ref?: React.Ref<Points>;
};

export const EditablePoints = forwardRef<Points, EditablePointsProps>((props, ref) => {
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
            <points ref={ref} />
        </VXObjectWrapper>
    );
})

