import React, { forwardRef, useEffect } from "react";
import { useObjectSettingsAPI } from "../ObjectSettingsStore";
import { useVXAnimationStore } from "../../AnimationEngine"
import { EditableObjectProps } from "../types"
import VXObjectWrapper from "../wrapper";

import { AmbientLight } from "three";
import { AmbientLightProps } from "@react-three/fiber";
export type EditableAmbientLightProps = EditableObjectProps<AmbientLightProps> & {
    ref?: React.Ref<AmbientLight>;
};

export const EditableAmbientLight = forwardRef<AmbientLight, EditableAmbientLightProps>((props, ref) => {
    const setAdditionalSetting = useObjectSettingsAPI(state => state.setAdditionalSetting);
    
    const {...rest} = props;
    const vxkey = rest.vxkey;


    // INITIALIZE Additional Settings
    const defaultAdditionalSettings = {
        showPositionPath: false,
    }

    useEffect(() => {
        Object.entries(defaultAdditionalSettings).forEach(([settingKey, value]) => {
            setAdditionalSetting(vxkey, settingKey, value)
        })
    }, [])

    return (
        <ambientLight ref={ref} {...props} />
    )
})
