import React, { memo, forwardRef, useEffect } from "react";
import { useObjectSettingsAPI } from "@vxengine/managers/ObjectManager";
import { useAnimationEngineAPI } from "../../AnimationEngine"
import { VXElementParams, VXElementPropsWithoutRef } from "../types"

import { HemisphereLight } from "three";
import { ThreeElement, ThreeElements } from "@react-three/fiber";
import { withVX } from "../withVX";

export type VXElementHemisphereLightProps = VXElementPropsWithoutRef<ThreeElements["hemisphereLight"]> & {
    ref?: React.RefObject<HemisphereLight>;
};

const BaseHemisphereLight = (props) => <hemisphereLight {...props} />

const params: VXElementParams = [
    { type: "color", propertyPath: "color" },
    { type: "number", propertyPath: "intensity" },
]

export const EditableHemisphereLight = withVX<ThreeElements["hemisphereLight"]>(BaseHemisphereLight, {
    type: "virtualEntity",
    params,
    icon: "HemisphereLight",
    settings: {},
})