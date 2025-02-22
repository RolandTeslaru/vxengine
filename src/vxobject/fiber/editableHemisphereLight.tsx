import React, { memo, forwardRef, useEffect } from "react";
import { useObjectSettingsAPI } from "@vxengine/managers/ObjectManager";
import { useAnimationEngineAPI } from "../../AnimationEngine"
import { EditableObjectProps } from "../types"

import { HemisphereLight } from "three";
import { ThreeElement, ThreeElements } from "@react-three/fiber";

export type EditableHemisphereLightProps = EditableObjectProps<ThreeElements["hemisphereLight"]> & {
    ref?: React.Ref<HemisphereLight>;
    settings?: {}
};

export const EditableHemisphereLight = memo(forwardRef<HemisphereLight, EditableHemisphereLightProps>((props, ref) => {
    const {settings = {}, ...rest} = props;

    return (
        <hemisphereLight ref={ref} {...props} />
    )
}))