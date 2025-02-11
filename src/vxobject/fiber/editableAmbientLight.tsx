import React, { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import { useObjectSettingsAPI } from "@vxengine/managers/ObjectManager";
import { useAnimationEngineAPI } from "../../AnimationEngine"
import { EditableObjectProps, VXObjectParams } from "../types"
import VXEntityWrapper from "../entityWrapper";

import { AmbientLight } from "three";
import { AmbientLightProps } from "@react-three/fiber";

export type EditableAmbientLightProps = EditableObjectProps<AmbientLightProps> & {
    ref?: React.Ref<AmbientLight>;
    settings?: {}
};

export const defaultSettings_AmbientLight = {
    useSplinePath: false,
}

const ambientLightProps: VXObjectParams = {
    'intensity': {type: "number"},
    "color": {type: "color"}
}

export const EditableAmbientLight = forwardRef<AmbientLight, EditableAmbientLightProps>((props, ref) => {
    const {settings = {}, ...rest} = props;
    
    
    const internalRef = useRef<any>(null); 
    useImperativeHandle(ref, () => internalRef.current);

    // INITIALIZE Settings
    const mergeddefaultSettings = {
        ...defaultSettings_AmbientLight,
        ...settings
    }
    // INITIALIZE Additional Settings
    const defaultAdditionalSettings = {
        showPositionPath: false,
    }

    

    return (
        <VXEntityWrapper 
            ref={internalRef} 
            params={ambientLightProps}
            defaultSettings={mergeddefaultSettings}
            defaultAdditionalSettings={defaultAdditionalSettings}
            {...rest}
        >
            <ambientLight {...rest} />

        </VXEntityWrapper>
    )
})
