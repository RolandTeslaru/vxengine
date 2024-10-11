import React, { forwardRef, useEffect } from "react";
import { useObjectSettingsAPI } from "../ObjectSettingsStore";
import { useVXAnimationStore } from "../../AnimationEngine"
import { EditableObjectProps } from "../types"
import VXObjectWrapper from "../wrapper";

import { HemisphereLight } from "three";
import { HemisphereLightProps } from "@react-three/fiber";

export type EditableHemisphereLightProps = EditableObjectProps<HemisphereLightProps> & {
    ref?: React.Ref<HemisphereLight>;
    settings?: {}
};

export const EditableHemisphereLight = forwardRef<HemisphereLight, EditableHemisphereLightProps>((props, ref) => {
    const {settings = {}, ...rest} = props;
    const vxkey = rest.vxkey;
    const setAdditionalSetting = useObjectSettingsAPI(state => state.setAdditionalSetting);
    const currentTimelieId = useVXAnimationStore(state => state.currentTimeline?.id)
    const currentSettingsForObject = useVXAnimationStore(state => state.currentTimeline?.settings[vxkey])
    

    // INITIALIZE Settings
    const defaultSettingsForObject = {
        useSplinePath: false,
        ...settings
    }
    useEffect(() => {
        if(currentTimelieId === undefined) return 
        const mergedSettingsForObject = {
            ...defaultSettingsForObject,
            ...currentSettingsForObject
        }
        Object.entries(mergedSettingsForObject).forEach(([settingKey, value]) => {
            useObjectSettingsAPI.getState().setSetting(vxkey, settingKey, value)
        })
    }, [currentTimelieId])

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
        <hemisphereLight ref={ref} {...props} />
    )
})