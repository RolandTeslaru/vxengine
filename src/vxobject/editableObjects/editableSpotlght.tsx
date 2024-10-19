'use client'

import React, { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import { useObjectSettingsAPI } from "../ObjectSettingsStore";
import { useAnimationEngineAPI } from "../../AnimationEngine"
import { EditableObjectProps } from "../types"

import { SpotLightHelper } from "three";

import VXObjectWrapper from "../wrapper";

import { SpotLight } from "three";
import { SpotLightProps } from "@react-three/fiber";
import { useHelper } from "@react-three/drei";

export type EditableSpotLightProps = EditableObjectProps<SpotLightProps> & {
    ref?: React.Ref<SpotLight>;
    settings?: {}
};

export const EditableSpotLight = forwardRef<SpotLight, EditableSpotLightProps>((props, ref) => {
    const {settings = {}, ...rest} = props;
    const vxkey = rest.vxkey;

    const setAdditionalSetting = useObjectSettingsAPI(state => state.setAdditionalSetting);
    const currentTimelineID = useAnimationEngineAPI(state => state.currentTimelineID)
    const currentSettingsForObject = useAnimationEngineAPI(state => state.timelines[currentTimelineID]?.settings[vxkey])
    
    const internalRef = useRef<any>(null); 
    useImperativeHandle(ref, () => internalRef.current);

    //
    // Additional Settings
    //
    const additionalSettings = {
        showHelper: false,
    }
    
    useEffect(() => {
        Object.entries(additionalSettings).forEach(([settingKey, value]) => {
            setAdditionalSetting(vxkey, settingKey, value)
        })
    }, [])

    //
    // Settings
    //
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
        console.log("REF SpotLight ", internalRef)
        Object.entries(defaultAdditionalSettings).forEach(([settingKey, value]) => {
            setAdditionalSetting(vxkey, settingKey, value)
        })
    }, [])

    const isHelperEnabled = useObjectSettingsAPI(state => state.additionalSettings[vxkey]?.showHelper)
    useHelper(internalRef, isHelperEnabled && SpotLightHelper)


    const params = [
        'intensity',
        'distance',
        'penumbra',
        'decay',
    ]

    return (
        <VXObjectWrapper 
            type="object" 
            ref={internalRef} 
            params={params}
            {...props}
        >
            <spotLight/>
        </VXObjectWrapper>
    );
})
