import React, { forwardRef } from "react";
import { VXElementPropsWithoutRef } from "../types"

import { Fog } from "three";
import { ThreeElements } from "@react-three/fiber";

export type VXElementFogProps = VXElementPropsWithoutRef<ThreeElements["fog"]> & {
    ref?: React.RefObject<Fog>;
};

export const EditableFog = forwardRef<Fog, VXElementFogProps>((props, ref) => (
    <fog ref={ref} {...props} />
))