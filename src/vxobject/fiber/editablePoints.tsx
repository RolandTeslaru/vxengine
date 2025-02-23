import React, { forwardRef, useEffect } from "react";
import { VXElementPropsWithoutRef } from "../types"
import VXThreeElementWrapper from "../VXThreeElementWrapper";

import { Points } from "three";
import { ThreeElement, ThreeElements } from "@react-three/fiber";

export type VXElementPointsProps = VXElementPropsWithoutRef<ThreeElements["points"]> & {
    ref?: React.RefObject<Points>;
};

export const EditablePoints: React.FC<VXElementPointsProps> = ({ref, ...rest}) => {
    return (
        <VXThreeElementWrapper 
            {...rest}
        >
            <points/>
        </VXThreeElementWrapper>
    );
}

