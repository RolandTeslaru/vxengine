import React, { memo, forwardRef, useEffect } from "react";
import { useObjectSettingsAPI } from "@vxengine/managers/ObjectManager";
import { useAnimationEngineAPI } from "../../AnimationEngine"
import { EditableObjectProps } from "../types"

import { HemisphereLight } from "three";
import { HemisphereLightProps } from "@react-three/fiber";

export type EditableHemisphereLightProps = EditableObjectProps<HemisphereLightProps> & {
    ref?: React.Ref<HemisphereLight>;
    settings?: {}
};

export const EditableHemisphereLight = memo(forwardRef<HemisphereLight, EditableHemisphereLightProps>((props, ref) => {
    const {settings = {}, ...rest} = props;

    return (
        <hemisphereLight ref={ref} {...props} />
    )
}))