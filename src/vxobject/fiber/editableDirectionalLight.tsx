import React, { memo, forwardRef, useEffect, useRef, useImperativeHandle } from "react";
import { useAnimationEngineAPI } from "../../AnimationEngine"
import { EditableObjectProps, VXObjectParams, VXObjectSettings } from "../types"
import { DirectionalLight } from "three";
import { DirectionalLightProps } from "@react-three/fiber";
import VXEntityWrapper from "../entityWrapper";

export type EditableDirectionalLightProps = EditableObjectProps<DirectionalLightProps> & {
    ref?: React.Ref<DirectionalLight>;
    settings?: {}
};

const defaultSettings: VXObjectSettings = {
    showPositionPath: { title:"show position path", storage: "localStorage", value: false},
    useSplinePath: { title:"use spline path", storage: "disk", value: false },
}

const directionalLightParams: VXObjectParams = {}


export const EditableDirectionalLight = memo(forwardRef<DirectionalLight, EditableDirectionalLightProps>((props, ref) => {
    const { settings = {}, ...rest } = props;
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
)
