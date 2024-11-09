'use client'

import React, { memo, forwardRef, useEffect, useImperativeHandle, useMemo, useRef } from "react";
import { Lightformer, LightProps, useHelper } from "@react-three/drei";
import { createPortal as createR3FPortal } from "@react-three/fiber";
import { EditableObjectProps } from "../types";
import VXEntityWrapper from "../entityWrapper";
import { useObjectSettingsAPI } from "@vxengine/managers/ObjectManager";
import { BoxHelper } from "three";
import * as THREE from "three"
import VXVirtualEntityWrapper from "../virtualEntityWrapper";
import { useThree } from "@react-three/fiber";
import { useVXObjectStore } from "../../managers/ObjectManager/stores/objectStore";

export type EditableLightformerProps = EditableObjectProps<LightProps> & {
    ref?: React.Ref<LightProps>;
    settings?: {};
    defaultScene?: THREE.Scene
};

export const EditableLightFormer = memo(
    forwardRef<typeof Lightformer, EditableLightformerProps>(
        (props, ref) => {
            const { settings = {}, ...rest } = props;
            const vxkey = rest.vxkey;
            const internalRef = useRef<any>(null);
            useImperativeHandle(ref, () => internalRef.current);

            // INITIALIZE Settings
            const defaultSettingsForObject = {
                useSplinePath: false,
                ...settings
            }

            // INITIALIZE Additional Settings
            const defaultAdditionalSettings = {
                showPositionPath: false,
                "Show In Scene": false,
            }

            return (
                <>
                    <VXEntityWrapper
                        ref={internalRef}
                        defaultSettingsForObject={defaultSettingsForObject}
                        defaultAdditionalSettings={defaultAdditionalSettings}
                        isVirtual={true}
                        {...props}
                    >
                        <Lightformer />
                    </VXEntityWrapper>
                </>
            )
        }))

