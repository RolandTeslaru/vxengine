import React, { memo, forwardRef, useEffect, useImperativeHandle, useMemo, useRef } from "react";
import { LightProps } from "@react-three/drei";
import { invalidate, useFrame } from "@react-three/fiber";
import { VXElementProps, VXElementPropsWithoutRef, VXObjectSettings } from "../types";
import * as THREE from "three"
import { useVXObjectStore } from "../../managers/ObjectManager/stores/objectStore";
import { Lightformer } from "./lightFormerImpl";
import { useObjectSetting, useObjectSettingsAPI } from "@vxengine/managers/ObjectManager/stores/settingsStore";
import { withVX } from "../withVX";
import { useVXEngine } from "@vxengine/engine";

export type EditableLightformerProps = VXElementProps<LightProps> & {
    ref?: React.RefObject<THREE.Mesh<THREE.BufferGeometry, THREE.MeshBasicMaterial>>;
    settings?: VXObjectSettings;
    defaultScene?: THREE.Scene
};

const defaultSettings: VXObjectSettings = {
    showPositionPath: { title: "show position path", storage: "localStorage", value: false },
    useSplinePath: { title: "use spline path", storage: "disk", value: false, },
    useRotationDegrees: { title: "use rotation degrees", storage: "disk", value: false },
    showInScene: { title: "show in scene", storage: "localStorage", value: false }
}

const outlineMaterial = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    side: THREE.DoubleSide,
    fog: false,
    wireframe: true
})

const BaseLightFormer = ({ref, ...props}) => {
    const vxkey = props.vxkey;

    const {setting_isShown, setting_isShowingAll} = useObjectSettingsAPI(state => { return {
        setting_isShown: state.settings[vxkey]?.show ?? false,
        setting_isShowingAll: state.settings[vxkey]?.showAll ?? false
    }})

    const { IS_DEVELOPMENT } = useVXEngine();

    const isVisibleInScene = ( setting_isShown || setting_isShowingAll ) && IS_DEVELOPMENT;

    const vxSceneEntity = useVXObjectStore(state => state.objects["scene"]);

    const meshRepresentationRef = useRef<THREE.Mesh>(null);
    const tempPos = useRef(new THREE.Vector3());
    const tempQuat = useRef(new THREE.Quaternion());
    const tempScale = useRef(new THREE.Vector3());

    useEffect(() => {
        if(vxSceneEntity && isVisibleInScene) {
            const refScene = vxSceneEntity.ref.current as THREE.Scene;

            if(!meshRepresentationRef.current && ref.current) {
                meshRepresentationRef.current = (ref.current as THREE.Mesh).clone();
                meshRepresentationRef.current.material = outlineMaterial;
                meshRepresentationRef.current.material.side = THREE.FrontSide;
                meshRepresentationRef.current.scale.multiplyScalar(1.05)
                refScene.add(meshRepresentationRef.current);
            }
            if(meshRepresentationRef.current) {
                meshRepresentationRef.current.visible = isVisibleInScene;
            }

            invalidate();
        }
        return () => {
            if (vxSceneEntity) {
                const refScene = vxSceneEntity.ref.current as THREE.Scene;
                refScene.remove(meshRepresentationRef.current);
                invalidate();
            }
        }
    }, [vxSceneEntity, isVisibleInScene])

    useFrame(() => {
        if(isVisibleInScene && ref.current && meshRepresentationRef.current) {
            ref.current.updateWorldMatrix(true, false);

            (ref.current as THREE.Object3D).matrixWorld.decompose(
                tempPos.current,
                tempQuat.current,
                tempScale.current
            )

            meshRepresentationRef.current.position.copy(tempPos.current);
            meshRepresentationRef.current.quaternion.copy(tempQuat.current);
            meshRepresentationRef.current.scale.copy(tempScale.current);
        }
    })

    return <Lightformer ref={ref} {...props} />
}

export const EditableLightFormer = withVX<LightProps & { ref?: React.RefObject<THREE.Mesh<THREE.BufferGeometry, THREE.MeshBasicMaterial>> }>(BaseLightFormer, {
    type: "virtualEntity",
    settings: defaultSettings
})
