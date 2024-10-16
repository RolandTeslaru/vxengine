'use client'

import React, { forwardRef, useEffect } from "react";
import { useObjectSettingsAPI } from "../ObjectSettingsStore";
import { EditableObjectProps } from "../types"
import VXObjectWrapper from "../wrapper";

import { LineLoop } from "three";
import { LineLoopProps } from "@react-three/fiber";

export type EditableLineLoopProps = EditableObjectProps<LineLoopProps> & {
    ref?: React.Ref<LineLoop>;
};

export const EditableLineLoop = forwardRef<LineLoop, EditableLineLoopProps>((props, ref) => {
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
            <lineLoop ref={ref} />
        </VXObjectWrapper>
    );
})