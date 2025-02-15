import React, { forwardRef, useEffect } from "react";
import { EditableObjectProps } from "../types"
import VXEntityWrapper from "../entityWrapper";

import { Points } from "three";
import { PointsProps } from "@react-three/fiber";

export type EditablePointsProps = EditableObjectProps<PointsProps> & {
    ref?: React.Ref<Points>;
};

export const EditablePoints = forwardRef<Points, EditablePointsProps>((props, ref) => {
    return (
        <VXEntityWrapper 
            ref={ref} 
            {...props}
        >
            <points ref={ref} />
        </VXEntityWrapper>
    );
})

