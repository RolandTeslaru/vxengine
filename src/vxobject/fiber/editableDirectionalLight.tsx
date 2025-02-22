import React, { memo, forwardRef, useEffect, useRef, useImperativeHandle } from "react";
import { useAnimationEngineAPI } from "../../AnimationEngine"
import { EditableObjectProps, VXObjectParams, VXObjectSettings } from "../types"
import { DirectionalLight } from "three";
import VXEntityWrapper from "../entityWrapper";
import { ThreeElement, ThreeElements } from "@react-three/fiber";

export type EditableDirectionalLightProps = EditableObjectProps<ThreeElements["directionalLight"]> & {
    ref?: React.Ref<DirectionalLight>;
    settings?: {}
};

const defaultSettings: VXObjectSettings = {
    showPositionPath: { title:"show position path", storage: "localStorage", value: false},
    useSplinePath: { title:"use spline path", storage: "disk", value: false },
}

const directionalLightParams: VXObjectParams = []

export const EditableDirectionalLight: React.FC<EditableDirectionalLightProps> = memo((props) => {
    const { settings = {}, ref, ...rest } = props;
    const internalRef = useRef<any>(null);
    useImperativeHandle(ref, () => internalRef.current);

    // INITIALIZE Settings
    const mergedSettings = {
        ...defaultSettings,
        ...settings
    }

    return (
        <VXEntityWrapper
            ref={internalRef}
            params={directionalLightParams}
            settings={mergedSettings}
            {...rest}
        >

            <directionalLight ref={ref} {...props} />
        </VXEntityWrapper>
    )
})
