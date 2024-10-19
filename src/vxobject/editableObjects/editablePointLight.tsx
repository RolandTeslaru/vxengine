'use client'

import React, { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import { useObjectSettingsAPI } from "../ObjectSettingsStore";
import { useAnimationEngineAPI } from "../../AnimationEngine"
import { EditableObjectProps } from "../types"

import { PointLightHelper } from "three";

import VXObjectWrapper from "../wrapper";

import { PointLight } from "three";
import { PointLightProps } from "@react-three/fiber";
import { useHelper } from "@react-three/drei";

export type EditablePointLightProps = EditableObjectProps<PointLightProps> & {
    ref?: React.Ref<PointLight>;
    settings?: {}
};

export const EditablePointLight = forwardRef<PointLight, EditablePointLightProps>((props, ref) => {
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

    const isHelperEnabled = useObjectSettingsAPI(state => state.additionalSettings[vxkey]?.showHelper)
    useHelper(internalRef, isHelperEnabled && PointLightHelper)

    const params = [
        'distance',
        'intensity',
        'decay',
    ]

    return (
        <VXObjectWrapper 
            type="object" 
            ref={internalRef} 
            {...props}
            params={params}
        >
            <pointLight ref={internalRef} {...props} />
        </VXObjectWrapper>
    )
})