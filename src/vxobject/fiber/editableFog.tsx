import React, { forwardRef, useEffect } from "react";
import { EditableObjectProps } from "../types"

import { Fog } from "three";
import { ThreeElement, ThreeElements } from "@react-three/fiber";
export type EditableFogProps = EditableObjectProps<ThreeElements["fog"]> & {
    ref?: React.Ref<Fog>;
};

export const EditableFog = forwardRef<Fog, EditableFogProps>((props, ref) => (
    <fog ref={ref} {...props} />
))