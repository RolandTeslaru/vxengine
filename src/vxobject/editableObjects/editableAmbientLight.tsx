'use client'

import React, { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import { useObjectSettingsAPI } from "../ObjectSettingsStore";
import { useAnimationEngineAPI } from "../../AnimationEngine"
import { EditableObjectProps } from "../types"
import VXObjectWrapper from "../wrapper";

import { AmbientLight } from "three";
import { AmbientLightProps } from "@react-three/fiber";

export type EditableAmbientLightProps = EditableObjectProps<AmbientLightProps> & {
    ref?: React.Ref<AmbientLight>;
    settings?: {}
};

export const EditableAmbientLight = forwardRef<AmbientLight, EditableAmbientLightProps>((props, ref) => {
    const {settings = {}, ...rest} = props;
    const vxkey = rest.vxkey;

    const setAdditionalSetting = useObjectSettingsAPI(state => state.setAdditionalSetting);
    
    const currentTimelineID = useAnimationEngineAPI(state => state.currentTimelineID)
    const currentSettingsForObject = useAnimationEngineAPI(state => state.timelines[currentTimelineID]?.settings[vxkey])
    
    const internalRef = useRef<any>(null); 
    useImperativeHandle(ref, () => internalRef.current);

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

    const params = [
        'intensity'
    ]

    return (
        <VXObjectWrapper 
            type="object" 
            ref={internalRef} 
            params={params}
            {...props}
        >
            <ambientLight {...props} />

        </VXObjectWrapper>
    )
})
