import React, { forwardRef, useEffect } from "react";
import { EditableObjectProps } from "../types"
import VXEntityWrapper from "../entityWrapper";

import { Points } from "three";
import { ThreeElement, ThreeElements } from "@react-three/fiber";

export type EditablePointsProps = EditableObjectProps<ThreeElements["points"]> & {
    ref?: React.Ref<Points>;
};

export const EditablePoints: React.FC<EditablePointsProps> = ({ref, ...rest}) => {
    return (
        <VXEntityWrapper 
            {...rest}
        >
            <points ref={ref} />
        </VXEntityWrapper>
    );
}

