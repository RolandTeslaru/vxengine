'use client'

import React, { forwardRef, useEffect } from "react";
import { useObjectSettingsAPI } from "../ObjectSettingsStore";
import { useAnimationEngineAPI } from "../../AnimationEngine"
import { EditableObjectProps } from "../types"
import VXObjectWrapper from "../wrapper";

import { Points } from "three";
import { PointsProps } from "@react-three/fiber";

export type EditablePointsProps = EditableObjectProps<PointsProps> & {
    ref?: React.Ref<Points>;
};

export const EditablePoints = forwardRef<Points, EditablePointsProps>((props, ref) => {
    const setAdditionalSetting = useObjectSettingsAPI(state => state.setAdditionalSetting);

    const { ...rest } = props;
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
        <VXObjectWrapper type="object" ref={ref} {...props}>
            <points ref={ref} />
        </VXObjectWrapper>
    );
})

