import React from "react";
import { VXElementPropsWithoutRef } from "../types"
import { Points } from "three";
import { ThreeElements } from "@react-three/fiber";
import { withVX } from "../withVX";

export type VXElementPointsProps = VXElementPropsWithoutRef<ThreeElements["points"]> & {
    ref?: React.RefObject<Points>;
};

const BasePoints = ({ref, ...props}) => {
    return <points ref={ref} {...props} />
}

export const EditablePoints = withVX(BasePoints, {
    type: "entity",
})
