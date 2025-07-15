import React, { useMemo } from "react";
import { memo, useRef, useImperativeHandle, useEffect, useLayoutEffect, useCallback } from "react";
import { VXElementParams, VXObjectSettings, VXPrimitiveProps } from "./types";
import { useAnimationEngineAPI } from "@vxengine/AnimationEngine";
import { initTimelineEditorObject } from "./utils/handleObjectEditorData";
import { cleanupEditorObject } from "./utils/handleObjectEditorData";
import { useVXObjectStore } from "@vxengine/managers/ObjectManager";
import * as THREE from "three";
import { vxObjectProps, vxObjectTypes } from "@vxengine/managers/ObjectManager/types/objectStore";
import animationEngineInstance from "@vxengine/singleton";
import ObjectUtils from "./utils/ObjectUtils";
import { merge } from "lodash";
import { vxengine } from "@vxengine/singleton";
import { ObjectManagerService } from "@vxengine/managers/ObjectManager/service";

declare module 'three' {
    interface Object3D {
        vxkey: string;
        rotationDegrees: THREE.Vector3
    }
}

type InterpolationParamType = {
    paramName: string
    partialPropertyPath: string
    type: "number" | "vector3"
}

// Make this type more generic - it takes the component's props type and extends it
export type WithVXProps<P, R = any> = P & VXPrimitiveProps & {
    ref?: React.RefObject<R>;
}

// this type is enforces the tpye to be passed
export type WithVXDefaultProps = Omit<VXPrimitiveProps, 'vxkey' | 'type' | 'ref'> & {
    type: vxObjectTypes
    vxkey?: string
    initialInterpolatedParams?: InterpolationParamType[]
}


export function withVX<P extends object>(
    WrappedComponent: React.ComponentType<P>,
    defaultProps: WithVXDefaultProps
) {
    const WithVX = memo(({ ref, ...props }: WithVXProps<P>) => {
        const finalProps = { ...defaultProps, ...props }
        const initialInterpolatedParams = finalProps.initialInterpolatedParams ?? [];

        if (finalProps.vxkey === undefined)
            throw new Error("withVX: vxkey was not passed to the component")

        const internalRef = useRef(null)

        useImperativeHandle(ref, () => internalRef.current, [])

        const currentTimelineID = useAnimationEngineAPI(state => state.currentTimelineID)

        // Initialize timeline editor object
        useLayoutEffect(() => {
            if (currentTimelineID === undefined || vxengine.isProduction) 
                return;

            const mergedSettings = { ...defaultProps.settings, ...finalProps.settings }

            initTimelineEditorObject(finalProps.vxkey, mergedSettings);

            return () => { cleanupEditorObject(finalProps.vxkey); };
        }, [currentTimelineID, props.settings, props.vxkey]);

        useEffect(() => {
            let parentKey: string;

            switch (finalProps.type) {
                case "entity":
                    parentKey = internalRef.current?.parent?.vxkey ?? "scene"
                    if (internalRef.current)
                        initializeDegreeRotations(internalRef.current)
                    break;
                case "effect":
                    parentKey = "effects"
                    break;
                case "htmlElement":
                    parentKey = internalRef.current?.parent?.vxkey ?? "scene"
                    break;
                case "virtualEntity":
                    parentKey = internalRef.current?.parent?.vxkey ?? "environment"
                    break;
                default:
                    parentKey = internalRef.current?.parent?.vxkey ?? "global"
            }

            const newVXEntity: vxObjectProps & { usingHOC: boolean } = {
                type: finalProps.type,
                vxkey: finalProps.vxkey,
                name: finalProps.name || finalProps.vxkey,
                params: finalProps.params ? [
                    ...DEFAULT_PARAMS[finalProps.type], 
                    ...finalProps.params] 
                    : DEFAULT_PARAMS[finalProps.type] ?? [],
                disabledParams: finalProps.disabledParams || [],
                parentKeys: new Set([finalProps.overrideNodeTreeParentKey ?? parentKey]),
                icon: finalProps.icon ?? "",
                ref: internalRef,
                usingHOC: true
            }


            ObjectManagerService.addObjectToStore(newVXEntity)

            animationEngineInstance.handleObjectMount(newVXEntity);

            return () => {
                animationEngineInstance.handleObjectUnMount(finalProps.vxkey);
                ObjectManagerService.removeObjectFromStore(finalProps.vxkey, finalProps.modifyObjectTree)
            }
        }, [internalRef.current, finalProps.type, finalProps.vxkey, finalProps.name, finalProps.params, finalProps.disabledParams, finalProps.overrideNodeTreeParentKey])

        // Mount props are passed to the underlyng instance
        const initialInterpolatedValues = useMemo(() => {
            const obj: Record<string, number | [number, number, number]> = {};
            [
                ...(DEFAULT_INITIAL_INTERPOLATED_PROPS[finalProps.type] as InterpolationParamType[]), 
                ...initialInterpolatedParams
            ].forEach(mountParam => {
                const value = animationEngineInstance
                                .getInterpolatedValue(finalProps.vxkey, mountParam.partialPropertyPath, mountParam.type);
                obj[mountParam.paramName] = value;
            })
            return obj;
        }, [])

        return (
            <>
                <WrappedComponent
                    {...props as P }
                    {...initialInterpolatedValues}
                    vxkey={finalProps.vxkey}
                    ref={internalRef}
                />
                
                {vxengine.isDevelopment && finalProps.type !== "htmlElement" && (
                    <ObjectUtils vxkey={finalProps.vxkey}/>
                )}
            </>
        )
    })

    WithVX.displayName = `withVX(${WrappedComponent.displayName || WrappedComponent.name || "Component"})`

    return WithVX as React.FC<P & VXPrimitiveProps>;
}


const initializeDegreeRotations = (obj: THREE.Object3D) => {
    obj.rotationDegrees = new THREE.Vector3(0, 0, 0);
}




const entityDefaultParams: VXElementParams = [
    { type: "number", propertyPath: "position.x" },
    { type: "number", propertyPath: "position.y" },
    { type: "number", propertyPath: "position.z" },
    { type: "number", propertyPath: "scale.x" },
    { type: "number", propertyPath: "scale.y" },
    { type: "number", propertyPath: "scale.z" },
    { type: "number", propertyPath: "rotation.x" },
    { type: "number", propertyPath: "rotation.y" },
    { type: "number", propertyPath: "rotation.z" },
    { type: "number", propertyPath: "rotationDegrees.x" },
    { type: "number", propertyPath: "rotationDegrees.y" },
    { type: "number", propertyPath: "rotationDegrees.z" },
]

const effectDefaultParams: VXElementParams = []

const htmlDefaultParams: VXElementParams = [
    { type: "number", propertyPath: "position.x" },
    { type: "number", propertyPath: "position.y" },
    { type: "number", propertyPath: "scale.x" },
    { type: "number", propertyPath: "scale.y" },
    { type: "number", propertyPath: "rotation.x" },
    { type: "number", propertyPath: "rotation.y" }
]

const ENTITY_INITIAL_INTERPOLATED_PROPS = [
    {paramName: "position", type: "vector3", partialPropertyPath: "position"},
    {paramName: "rotation", type: "vector3", partialPropertyPath: "rotation"},
    {paramName: "scale", type: "vector3", partialPropertyPath: "scale"},
]


const DEFAULT_PARAMS = {
    entity: entityDefaultParams,
    effect: effectDefaultParams,
    htmlElement: htmlDefaultParams,
    virtualEntity: entityDefaultParams,
    custom: []
}

const DEFAULT_INITIAL_INTERPOLATED_PROPS = {
    entity: ENTITY_INITIAL_INTERPOLATED_PROPS,
    effect: [],
    htmlElement: [],
    virtualEntity:ENTITY_INITIAL_INTERPOLATED_PROPS,
    custom: [],
}