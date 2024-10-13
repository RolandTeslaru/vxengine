import React, { forwardRef, useEffect } from "react";
import { useObjectSettingsAPI } from "../ObjectSettingsStore";
import { useAnimationEngineAPI } from "../../AnimationEngine"
import { EditableObjectProps } from "../types"
import VXObjectWrapper from "../wrapper";

import { SpotLight } from "three";
import { SpotLightProps } from "@react-three/fiber";

export type EditableSpotLightProps = EditableObjectProps<SpotLightProps> & {
    ref?: React.Ref<SpotLight>;
    settings?: {}
};

export const EditableSpotLight = forwardRef<SpotLight, EditableSpotLightProps>((props, ref) => {
    const {settings = {}, ...rest} = props;
    const setAdditionalSetting = useObjectSettingsAPI(state => state.setAdditionalSetting);
    const currentTimelineID = useAnimationEngineAPI(state => state.currentTimelineID)
    const currentSettingsForObject = useAnimationEngineAPI(state => state.timelines[currentTimelineID]?.settings[vxkey])
    
    const vxkey = rest.vxkey;

    // INITIALIZE Settings
    const defaultSettingsForObject = {
        useSplinePath: false,
        ...settings
    }
    useEffect(() => {
        if(currentTimelineID === undefined) return 
        const mergedSettingsForObject = {
            ...defaultSettingsForObject,
            ...currentSettingsForObject
        }
        Object.entries(mergedSettingsForObject).forEach(([settingKey, value]: [string, any]) => {
            useObjectSettingsAPI.getState().setSetting(vxkey, settingKey, value)
        })
    }, [currentTimelineID])

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
        <VXObjectWrapper type="object" ref={ref} {...props}>
            <spotLight/>
        </VXObjectWrapper>
    );
})