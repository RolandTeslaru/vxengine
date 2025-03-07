import React, { memo, forwardRef, useEffect, useImperativeHandle, useMemo, useRef } from "react";
import { LightProps } from "@react-three/drei";
import { invalidate, useFrame } from "@react-three/fiber";
import { VXElementPropsWithoutRef, VXObjectSettings } from "../types";
import VXThreeElementWrapper from "../VXThreeElementWrapper";
import * as THREE from "three"
import { useVXObjectStore } from "../../managers/ObjectManager/stores/objectStore";
import { Lightformer } from "./lightFormerImpl";
import { useObjectSetting } from "@vxengine/managers/ObjectManager/stores/settingsStore";

export type EditableLightformerProps = VXElementPropsWithoutRef<LightProps> & {
    ref?: React.Ref<LightProps>;
    settings?: VXObjectSettings;
    defaultScene?: THREE.Scene
};

const outlineMaterial = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    side: THREE.DoubleSide,
    fog: false,
    wireframe: true
})

const defaultSettings: VXObjectSettings = {
    showPositionPath: { title:"show position path", storage: "localStorage", value: false},
    useSplinePath: { title:"use spline path", storage: "disk", value: false,},
    useRotationDegrees: { title:"use rotation degrees", storage: "disk", value: false },
    showInScene: { title:"show in scene",  storage: "localStorage", value: false}
}

export const EditableLightFormer = memo(
    forwardRef<typeof Lightformer, EditableLightformerProps>(
        (props, ref) => {
            const { settings = {}, ...rest } = props;
            const vxkey = rest.vxkey;
            const internalRef = useRef<any>(null);
            useImperativeHandle(ref, () => internalRef.current);

            const vxSceneEntity = useVXObjectStore(state => state.objects["scene"]);
            const isShowingAll = useObjectSetting("environment", "showAll");
            const viz = useObjectSetting(vxkey, "showInScene");
            const isVisibleInScene = viz || isShowingAll

            const realMeshRef = useRef<THREE.Mesh>(null);

            const tempPos = useRef(new THREE.Vector3());
            const tempQuat = useRef(new THREE.Quaternion());
            const tempScale = useRef(new THREE.Vector3());

            const mergedSettings = {
                ...defaultSettings,
                ...settings
            }


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
                    <VXThreeElementWrapper
                        ref={internalRef}
                        settings={mergedSettings}
                        isVirtual={true}
                        {...props}
                    >
                        <Lightformer/>
                    </VXThreeElementWrapper>
                </>
            )
        }))

