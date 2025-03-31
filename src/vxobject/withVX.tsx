import { useRef, useImperativeHandle, useEffect, useLayoutEffect } from "react";
import { VXElementParams, VXObjectSettings, VXPrimitiveProps } from "./types";
import { useVXEngine } from "@vxengine/engine";
import { useAnimationEngineAPI } from "@vxengine/AnimationEngine";
import { initTimelineEditorObject } from "./utils/handleObjectEditorData";
import { cleanupEditorObject } from "./utils/handleObjectEditorData";
import { useVXObjectStore } from "@vxengine/managers/ObjectManager";
import * as THREE from "three";
import { vxObjectProps, vxObjectTypes } from "@vxengine/managers/ObjectManager/types/objectStore";
import animationEngineInstance from "@vxengine/singleton";
import React from "react";
import ObjectUtils from "./utils/ObjectUtils";
import { merge } from "lodash";

declare module 'three' {
    interface Object3D {
        vxkey: string;
        rotationDegrees: THREE.Vector3
    }
}

// Make this type more generic - it takes the component's props type and extends it
export type WithVXProps<P, R = any> = P & VXPrimitiveProps & {
    ref?: React.RefObject<R>;
}

// this type is enforces the tpye to be passed
export type WithVXDefaultProps = Omit<VXPrimitiveProps, 'vxkey' | 'type' | 'ref'> & {
    type: vxObjectTypes
    vxkey?: string
}

export function withVX<P extends object>(
    WrappedComponent: React.ComponentType<P>,
    defaultProps: WithVXDefaultProps
) {
    const WithVX = ({ ref, ...props }: WithVXProps<P>) => {
        const finalProps = { ...defaultProps, ...props }

        if (finalProps.vxkey === undefined)
            throw new Error("withVX: vxkey was not passed to the component")

        const internalRef = useRef(null)
        useImperativeHandle(ref, () => internalRef.current, [])

        const { IS_DEVELOPMENT } = useVXEngine()
        const currentTimelineID = useAnimationEngineAPI(state => state.currentTimelineID)
        const addObjectToStore = useVXObjectStore(state => state.addObject);
        const removeObjectFromStore = useVXObjectStore(state => state.removeObject);

        // Initialize timeline editor object
        useLayoutEffect(() => {
            if (currentTimelineID === undefined || IS_DEVELOPMENT === false) 
                return;

            const mergedSettings = { ...defaultProps.settings, ...finalProps.settings }

            initTimelineEditorObject(finalProps.vxkey, mergedSettings);

            return () => { cleanupEditorObject(finalProps.vxkey); };
        }, [currentTimelineID, props.settings, props.vxkey, IS_DEVELOPMENT]);

        useLayoutEffect(() => {
            let parentKey;

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
                params: finalProps.params ? [...DEFAULT_PARAMS[finalProps.type], ...finalProps.params] : DEFAULT_PARAMS[finalProps.type] ?? [],
                disabledParams: finalProps.disabledParams || [],
                parentKey: finalProps.overrideNodeTreeParentKey ?? parentKey,
                ref: internalRef,
                usingHOC: true
            }

            addObjectToStore(newVXEntity, IS_DEVELOPMENT, { icon: finalProps.icon })

            animationEngineInstance.handleObjectMount(newVXEntity);

            return () => {
                animationEngineInstance.handleObjectUnMount(finalProps.vxkey);
                removeObjectFromStore(finalProps.vxkey, IS_DEVELOPMENT)
            }
        }, [internalRef.current, finalProps.type, finalProps.vxkey, finalProps.name, finalProps.params, finalProps.disabledParams, finalProps.overrideNodeTreeParentKey, IS_DEVELOPMENT])


        return (
            <>
                <WrappedComponent
                    {...props as P}
                    vxkey={finalProps.vxkey}
                    ref={internalRef}
                />
                
                {IS_DEVELOPMENT && finalProps.type !== "htmlElement" && (
                    <ObjectUtils vxkey={finalProps.vxkey}/>
                )}
            </>
        )
    }

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

const DEFAULT_PARAMS = {
    entity: entityDefaultParams,
    effect: effectDefaultParams,
    htmlElement: htmlDefaultParams,
    virtualEntity: entityDefaultParams,
    custom: []
}