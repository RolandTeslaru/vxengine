import React, {memo, forwardRef } from "react";
import { VXElementPropsWithoutRef } from "../types"
import VXThreeElementWrapper from "../VXThreeElementWrapper";

import { LineLoop } from "three";
import { ThreeElement, ThreeElements } from "@react-three/fiber";

export type VXElementLineLoopProps = VXElementPropsWithoutRef<ThreeElements["lineLoop"]> & {
    ref?: React.RefObject<LineLoop>;
};

export const EditableLineLoop: React.FC<VXElementLineLoopProps> = (props) => {

    return (
        <VXThreeElementWrapper 
            {...props}
        >
            <lineLoop/>
        </VXThreeElementWrapper>
    );
}