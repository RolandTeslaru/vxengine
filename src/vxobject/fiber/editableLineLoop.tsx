import React, {memo, forwardRef } from "react";
import { EditableObjectProps } from "../types"
import VXEntityWrapper from "../entityWrapper";

import { LineLoop } from "three";
import { LineLoopProps } from "@react-three/fiber";

export type EditableLineLoopProps = EditableObjectProps<LineLoopProps> & {
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