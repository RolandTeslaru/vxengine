import React, { forwardRef, useEffect } from "react";
import { VXElementPropsWithoutRef } from "../types"

import { Fog } from "three";
import { ThreeElement, ThreeElements } from "@react-three/fiber";

export type VXElementFogProps = VXElementPropsWithoutRef<ThreeElements["fog"]> & {
    ref?: React.Ref<Fog>;
};

export const EditableFog = forwardRef<Fog, VXElementFogProps>((props, ref) => (
    <fog ref={ref} {...props} />
))