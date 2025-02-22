import React, {memo, forwardRef } from "react";
import { EditableObjectProps } from "../types"
import VXEntityWrapper from "../entityWrapper";

import { LineLoop } from "three";
import { ThreeElement, ThreeElements } from "@react-three/fiber";

export type EditableLineLoopProps = EditableObjectProps<ThreeElements["lineLoop"]> & {
    ref?: React.Ref<LineLoop>;
};

export const EditableLineLoop = memo(forwardRef<LineLoop, EditableLineLoopProps>((props, ref) => {

    return (
        <VXEntityWrapper 
            ref={ref} 
            {...props}
        >
            <lineLoop ref={ref} />
        </VXEntityWrapper>
    );
}))