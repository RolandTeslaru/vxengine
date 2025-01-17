'use client'

import React, { memo, forwardRef, useEffect, useImperativeHandle, useMemo, useRef } from "react";
import { LightProps, useHelper } from "@react-three/drei";
import { createPortal as createR3FPortal, invalidate, useFrame } from "@react-three/fiber";
import { EditableObjectProps } from "../types";
import VXEntityWrapper from "../entityWrapper";
import { useObjectSettingsAPI } from "@vxengine/managers/ObjectManager";
import { BoxHelper } from "three";
import * as THREE from "three"
import VXVirtualEntityWrapper from "../virtualEntityWrapper";
import { useThree } from "@react-three/fiber";
import { useVXObjectStore } from "../../managers/ObjectManager/stores/objectStore";
import { Lightformer } from "./lightFormerImpl";

export type EditableLightformerProps = EditableObjectProps<LightProps> & {
    ref?: React.Ref<LightProps>;
    settings?: {};
    defaultScene?: THREE.Scene
};

const outlineMaterial = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    side: THREE.DoubleSide,
    fog: false,
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

            const vxSceneEntity = useVXObjectStore(state => state.objects["scene"]);
            const isShowingAll = useObjectSettingsAPI(state => state.additionalSettings["environment"]?.["Show All"])
            const viz = useObjectSettingsAPI(state => state.additionalSettings[vxkey]?.["Show In Scene"]) 
            const isVisibleInScene = viz || isShowingAll

            const realMeshRef = useRef<THREE.Mesh>(null);

            const tempPos = useRef(new THREE.Vector3());
            const tempQuat = useRef(new THREE.Quaternion());
            const tempScale = useRef(new THREE.Vector3());


            useEffect(() => {
                if (vxSceneEntity && isVisibleInScene) {
                    const refScene = vxSceneEntity.ref.current as THREE.Scene;

                    if (!realMeshRef.current) {
                        realMeshRef.current = (internalRef.current as THREE.Mesh).clone();
                        realMeshRef.current.material = outlineMaterial;
                        realMeshRef.current.material.side = THREE.FrontSide;
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
                    internalRef.current.updateWorldMatrix(true, false);

                    (internalRef.current as THREE.Object3D).matrixWorld.decompose(
                        tempPos.current,
                        tempQuat.current,
                        tempScale.current
                    );
                    
                    realMeshRef.current.position.copy(tempPos.current);
                    realMeshRef.current.quaternion.copy(tempQuat.current);
                    realMeshRef.current.scale.copy(tempScale.current);
                }
            });

            return (
                <>
                    <VXEntityWrapper
                        ref={internalRef}
                        defaultSettings={defaultSettings}
                        isVirtual={true}
                        defaultAdditionalSettings={defaultAdditionalSettings}
                        {...props}
                    >
                        <Lightformer/>
                    </VXEntityWrapper>
                </>
            )
        }))

