import React from "react";
import { VXElementPropsWithoutRef } from "../types"
import { LineLoop } from "three";
import { ThreeElements } from "@react-three/fiber";
import { withVX } from "../withVX";

export type VXElementLineLoopProps = VXElementPropsWithoutRef<ThreeElements["lineLoop"]> & {
    ref?: React.RefObject<LineLoop>;
};

const BaseLineLoop = (props) => <lineLoop {...props} />

export const EditableLineLoop = withVX<ThreeElements["lineLoop"]>(BaseLineLoop, {
    type: "entity",
    params: [],
    settings: {},
})