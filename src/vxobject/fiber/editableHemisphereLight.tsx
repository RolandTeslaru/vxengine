import React, { memo, forwardRef, useEffect } from "react";
import { useObjectSettingsAPI } from "@vxengine/managers/ObjectManager";
import { useAnimationEngineAPI } from "../../AnimationEngine"
import { VXElementPropsWithoutRef } from "../types"

import { HemisphereLight } from "three";
import { ThreeElement, ThreeElements } from "@react-three/fiber";

export type VXElementHemisphereLightProps = VXElementPropsWithoutRef<ThreeElements["hemisphereLight"]> & {
    ref?: React.RefObject<HemisphereLight>;
};

export const EditableHemisphereLight = memo(forwardRef<HemisphereLight, VXElementHemisphereLightProps>((props, ref) => {
    const {settings = {}, ...rest} = props;

    return (
        <hemisphereLight ref={ref} {...props} />
    )
}))