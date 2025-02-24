// VXEngine - VEXR Labs' proprietary toolset for React Three Fiber
// (c) 2024 VEXR Labs. All Rights Reserved.
// See the LICENSE file in the root directory of this source tree for licensing information.

import * as THREE from "three"
import React, { forwardRef, useCallback, useEffect, useRef, useImperativeHandle, useLayoutEffect } from 'react';
import { useVXObjectStore } from '@vxengine/managers/ObjectManager';
import { useObjectManagerAPI } from "@vxengine/managers/ObjectManager/stores/managerStore";
import { useVXEngine } from "@vxengine/engine";
import { ReactThreeFiber, ThreeEvent, useFrame } from '@react-three/fiber';
import { vxObjectProps, vxObjectTypes } from "@vxengine/managers/ObjectManager/types/objectStore";
import ObjectUtils from "./utils/ObjectUtils";
import { useAnimationEngineAPI } from "@vxengine/AnimationEngine";
import { useObjectSettingsAPI } from "@vxengine/managers/ObjectManager";
import { VXElementParams, VXObjectSettings } from "./types";
import animationEngineInstance from "@vxengine/singleton";
import { cloneDeep } from "lodash";

export type VXHtmlElementWrapperProps<T extends HTMLElement = HTMLDivElement> =
    Omit<JSX.IntrinsicElements["div"], "ref"> & {
        ref?: React.RefObject<T>;
        vxkey: string;
        name?: string;
        children: React.ReactElement<any>;
        register?: boolean
        params?: VXElementParams
        disabledParams?: string[]
        disableClickSelect?: boolean
        isVirtual?: boolean
        addToNodeTree?: boolean
        overrideNodeTreeParentKey?: string;
        overrideNodeType?: string
        declarative?: boolean

        settings?: VXObjectSettings,

        icon?: string
    }

const htmlDefaultParams:VXElementParams = [
    {type:"number", propertyPath:"position.x"},
    {type:"number", propertyPath:"position.y"},
    {type:"number", propertyPath:"scale.x"},
    {type:"number", propertyPath:"scale.y"},
    {type:"number", propertyPath:"rotation.x"},
    {type:"number", propertyPath:"rotation.y"}
]

const VXHtmlElementWrapper: React.FC<VXHtmlElementWrapperProps> =
    ({
        ref,
        children,
        vxkey,
        params,
        disabledParams,
        register = true,
        disableClickSelect = false,
        isVirtual = false,
        addToNodeTree = true,
        declarative = true,
        settings: initialSettings = {},
        overrideNodeTreeParentKey,
        icon,
        ...props
    }) => {
        if (vxkey === undefined)
            throw new Error(`ObjectStore: Error intializing vxobject! No vxkey was passed to: ${children}`);

        const vxObject = useVXObjectStore(state => state.objects[vxkey])
        const { IS_DEVELOPMENT } = useVXEngine();

        // Initialize settings
        const currentTimelineID = useAnimationEngineAPI(state => state.currentTimelineID)

        // Refresh settings when the current timeline changes
        useLayoutEffect(() => {
            if(declarative) return

            if (currentTimelineID === undefined) 
                return
            const currentTimeline = useAnimationEngineAPI.getState().currentTimeline

            const mergedSettingsForObject = cloneDeep(initialSettings);
            const rawObject = currentTimeline.objects?.find(obj => obj.vxkey === vxkey);

            if (rawObject) {
                const rawSettings = rawObject.settings;
                if (rawSettings) {
                    Object.entries(rawSettings).forEach(([settingKey, rawSetting]) => {
                        mergedSettingsForObject[settingKey].value = rawSetting;
                    })
                }
            }

            useObjectSettingsAPI.getState().initSettingsForObject(vxkey, mergedSettingsForObject, initialSettings)
        }, [currentTimelineID])


        const internalRef = useRef<HTMLDivElement | null>(null);
        useImperativeHandle(ref, () => internalRef.current, [])

        console.log("Internal Ref ", internalRef?.current?.style?.left)

        // Initializations
        useLayoutEffect(() => {
            const addObject = useVXObjectStore.getState().addObject;
            const removeObject = useVXObjectStore.getState().removeObject;

            const name = props.name || vxkey
            // const parentKey = overrideNodeTreeParentKey || internalRef.current?.parent?.vxkey || null

            const newVXElement: vxObjectProps = {
                type: "htmlElement",
                ref: internalRef,
                vxkey,
                name,
                params: params ? [...htmlDefaultParams, ...params] : htmlDefaultParams,
                disabledParams: disabledParams || [],
                parentKey: null,
            };

            addObject(newVXElement, IS_DEVELOPMENT, { icon });
            if(!declarative)
                animationEngineInstance.initObjectOnMount(newVXElement);

            return () => {
                if(!declarative)
                    animationEngineInstance.handleObjectUnMount(vxkey);
                removeObject(vxkey, IS_DEVELOPMENT)
            }
        }, []);

        const modifiedChildren = React.cloneElement(children, {
            ref: internalRef, 
            ...props,
        },
            <>
                {children.props.children}
            </>
        );

        return <>
            {modifiedChildren}

            {vxObject && IS_DEVELOPMENT &&
                children
            }
        </>;
    }


export default VXHtmlElementWrapper