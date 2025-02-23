import React, { memo, forwardRef, useEffect, useRef, useImperativeHandle } from "react";
import { useAnimationEngineAPI } from "../../AnimationEngine"
import { VXElementPropsWithoutRef, VXElementParams, VXObjectSettings } from "../types"
import { DirectionalLight } from "three";
import VXThreeElementWrapper from "../VXThreeElementWrapper";
import { ThreeElement, ThreeElements } from "@react-three/fiber";

export type VXElementDirectionalLightProps = VXElementPropsWithoutRef<ThreeElements["directionalLight"]> & {
    ref?: React.RefObject<DirectionalLight>;
};

const defaultSettings: VXObjectSettings = {
    showPositionPath: { title:"show position path", storage: "localStorage", value: false},
    useSplinePath: { title:"use spline path", storage: "disk", value: false },
}

const directionalLightParams: VXElementParams = []

export const EditableDirectionalLight: React.FC<VXElementDirectionalLightProps> = (props) => {
    const { settings = {}, ref, ...rest } = props;

    // INITIALIZE Settings
    const mergedSettings = {
        ...defaultSettings,
        ...settings
    }

    return (
        <VXThreeElementWrapper
            params={directionalLightParams}
            settings={mergedSettings}
            {...rest}
        >
            <directionalLight ref={ref} {...props} />
        </VXThreeElementWrapper>
    )
}
