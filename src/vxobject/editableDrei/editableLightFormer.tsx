'use client'

import React, { memo, forwardRef, useEffect, useImperativeHandle, useMemo, useRef } from "react";
import { Lightformer, LightProps, useHelper } from "@react-three/drei";
import { createPortal as createR3FPortal, invalidate, useFrame } from "@react-three/fiber";
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

const outlineMaterial = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    side: THREE.DoubleSide,
})

export const EditableLightFormer = memo(
    forwardRef<typeof Lightformer, EditableLightformerProps>(
        (props, ref) => {
            const { settings = {}, ...rest } = props;
            const vxkey = rest.vxkey;
            const internalRef = useRef<any>(null);
            useImperativeHandle(ref, () => internalRef.current);

            // INITIALIZE Settings
            const defaultSettings = {
                useSplinePath: false,
                ...settings
            }

            // INITIALIZE Additional Settings
            const defaultAdditionalSettings = {
                showPositionPath: false,
                "Show In Scene": false,
            }

            const params = [
            ]

            const vxSceneEntity = useVXObjectStore(state => state.objects["scene"]);
            const isVisibleInScene = useObjectSettingsAPI(state => state.additionalSettings[vxkey]?.["Show In Scene"]);

            const realMeshRef = useRef<THREE.Mesh>(null);

            useEffect(() => {
                if (vxSceneEntity && isVisibleInScene) {
                    const refScene = vxSceneEntity.ref.current as THREE.Scene;

                    if (!realMeshRef.current) {
                        realMeshRef.current = (internalRef.current as THREE.Mesh).clone();
                        realMeshRef.current.material = outlineMaterial;
                        realMeshRef.current.scale.multiplyScalar(1.05)
                        refScene.add(realMeshRef.current);
                    }
                    realMeshRef.current.visible = isVisibleInScene;
                    
                    refScene.add(realMeshRef.current);

                    invalidate();
                }

                return () => {
                    if (vxSceneEntity) {
                        const refScene = vxSceneEntity.ref.current as THREE.Scene;
                        refScene.remove(realMeshRef.current);
                        // realMeshRef.current = null;

                        invalidate();
                    }
                }
            }, [vxSceneEntity, isVisibleInScene])

            useFrame(() => {
                if (isVisibleInScene && internalRef.current && realMeshRef.current) {
                  realMeshRef.current.position.copy(internalRef.current.position);
                  realMeshRef.current.rotation.copy(internalRef.current.rotation);
                  realMeshRef.current.scale.copy(internalRef.current.scale);
                }
              });

            return (
                <>
                    <VXEntityWrapper
                        ref={internalRef}
                        params={params}
                        defaultSettings={defaultSettings}
                        isVirtual={true}
                        defaultAdditionalSettings={defaultAdditionalSettings}
                        {...props}
                    >
                        <Lightformer />
                    </VXEntityWrapper>
                </>
            )
        }))

