import React, { useMemo, useRef } from 'react'
import { useVXObjectStore, useObjectSettingsAPI } from '@vxengine/managers/ObjectManager'
import { vx } from '@vxengine/vxobject'
import { useFrame } from '@react-three/fiber'
import { TextureLoader } from 'three'
import * as THREE from "three"
import { useVXEngine } from '@vxengine/engine'
import { useObjectSetting } from '@vxengine/managers/ObjectManager/stores/settingsStore'
import { VXObjectSettings } from '@vxengine/vxobject/types'

const base64Pointer = "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPCEtLSBHZW5lcmF0ZWQgYnkgUGl4ZWxtYXRvciBQcm8gMy42LjE0IC0tPgo8c3ZnIHdpZHRoPSIyMTAwIiBoZWlnaHQ9IjIxMDAiIHZpZXdCb3g9IjAgMCAyMTAwIDIxMDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CiAgICA8ZyBpZD0iR3JvdXAiPgogICAgICAgIDxwYXRoIGlkPSJPdmFsIiBmaWxsPSJub25lIiBzdHJva2U9IiNmZmZmZmYiIHN0cm9rZS13aWR0aD0iMTMiIGQ9Ik0gMTU3NC40MjQwNzIgMTA1MC4wNDc0ODUgQyAxNTc0LjQyNDA3MiA3NjAuMDcxNzc3IDEzMzkuMzUyMjk1IDUyNSAxMDQ5LjM3NjU4NyA1MjUgQyA3NTkuNDAwOTQgNTI1IDUyNC4zMjkxNjMgNzYwLjA3MTc3NyA1MjQuMzI5MTYzIDEwNTAuMDQ3NDg1IEMgNTI0LjMyOTE2MyAxMzQwLjAyMzE5MyA3NTkuNDAwOTQgMTU3NS4wOTQ4NDkgMTA0OS4zNzY1ODcgMTU3NS4wOTQ4NDkgQyAxMzM5LjM1MjI5NSAxNTc1LjA5NDg0OSAxNTc0LjQyNDA3MiAxMzQwLjAyMzE5MyAxNTc0LjQyNDA3MiAxMDUwLjA0NzQ4NSBaIi8+CiAgICAgICAgPHBhdGggaWQ9IkxpbmUiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI2ZmZmZmZiIgc3Ryb2tlLXdpZHRoPSI4IiBzdHJva2UtZGFzaGFycmF5PSIzMS45OTk5OTUgMTUuOTk5OTk3IiBzdHJva2UtZGFzaG9mZnNldD0iMCIgZD0iTSA4NzMuOTk3MjUzIDEwNTEuOTk5MTQ2IEwgMTI0Mi4wMDI2ODYgMTA1MS45OTkxNDYiLz4KICAgICAgICA8cGF0aCBpZD0iTGluZS1jb3B5IiBmaWxsPSJub25lIiBzdHJva2U9IiNmZmZmZmYiIHN0cm9rZS13aWR0aD0iOCIgc3Ryb2tlLWRhc2hhcnJheT0iMzEuOTk5OTk1IDE1Ljk5OTk5NyIgc3Ryb2tlLWRhc2hvZmZzZXQ9IjAiIGQ9Ik0gMTA1Ny45OTkxNDYgMTIzNS4wMDI2ODYgTCAxMDU3Ljk5OTE0NiA4NjYuOTk3MzE0Ii8+CiAgICAgICAgPHBhdGggaWQ9IkFycm93LWNvcHktMyIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjZmZmZmZmIiBzdHJva2Utd2lkdGg9IjEzIiBkPSJNIDEwNDkuMzc2NTg3IDQ0OS42MTIzMDUgTCAxMTk4LjkwNzgzNyAxNTAuNTQ5OTI3IEwgMTEyMS4xNTE2MTEgMTUwLjU0OTkyNyBMIDExMjEuMTUxNjExIDcgTCA5NzcuNjAxNjI0IDcgTCA5NzcuNjAxNjI0IDE1MC41NDk5MjcgTCA4OTkuODQ1NDU5IDE1MC41NDk5MjcgWiIvPgogICAgICAgIDxwYXRoIGlkPSJBcnJvdy1jb3B5LTQiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI2ZmZmZmZiIgc3Ryb2tlLXdpZHRoPSIxMy4yOTE2NiIgZD0iTSAxMDQ5LjM3NDUxMiAxNjUwLjgxODIzNyBMIDg5OS44NDMzMjMgMTk0OS44ODA2MTUgTCA5NzcuNTk5NDg3IDE5NDkuODgwNjE1IEwgOTc3LjU5OTQ4NyAyMDkzLjQzMDY2NCBMIDExMjEuMTQ5NDE0IDIwOTMuNDMwNjY0IEwgMTEyMS4xNDk0MTQgMTk0OS44ODA2MTUgTCAxMTk4LjkwNTY0IDE5NDkuODgwNjE1IFoiLz4KICAgICAgICA8cGF0aCBpZD0iQXJyb3ctY29weS01IiBmaWxsPSJub25lIiBzdHJva2U9IiNmZmZmZmYiIHN0cm9rZS13aWR0aD0iMTMuMjkxNjYiIGQ9Ik0gMTY1MC4xNDA4NjkgMTA1MC4wNDc0ODUgTCAxOTQ5LjIwMzI0NyAxMTk5LjU3ODYxMyBMIDE5NDkuMjAzMjQ3IDExMjEuODIyMzg4IEwgMjA5Mi43NTMxNzQgMTEyMS44MjIzODggTCAyMDkyLjc1MzE3NCA5NzguMjcyNDYxIEwgMTk0OS4yMDMyNDcgOTc4LjI3MjQ2MSBMIDE5NDkuMjAzMjQ3IDkwMC41MTYyMzUgWiIvPgogICAgICAgIDxwYXRoIGlkPSJBcnJvdy1jb3B5LTIiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI2ZmZmZmZiIgc3Ryb2tlLXdpZHRoPSIxMy4yOTE2NiIgZD0iTSA0NDguNjEyMzA1IDEwNTAuMDQ3MzYzIEwgMTQ5LjU0OTkyNyA5MDAuNTE2MjM1IEwgMTQ5LjU0OTkyNyA5NzguMjcyNDYxIEwgNiA5NzguMjcyNDYxIEwgNiAxMTIxLjgyMjM4OCBMIDE0OS41NDk5MjcgMTEyMS44MjIzODggTCAxNDkuNTQ5OTI3IDExOTkuNTc4NjEzIFoiLz4KICAgIDwvZz4KPC9zdmc+Cg=="

const base64FloorProjection = "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPCEtLSBHZW5lcmF0ZWQgYnkgUGl4ZWxtYXRvciBQcm8gMy41LjcgLS0+Cjxzdmcgd2lkdGg9IjIxMDAiIGhlaWdodD0iMjEwMCIgdmlld0JveD0iMCAwIDIxMDAgMjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICAgIDxnIGlkPSJHcm91cCI+CiAgICAgICAgPHBhdGggaWQ9Ik92YWwiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI2ZmZmZmZiIgc3Ryb2tlLXdpZHRoPSIxMyIgZD0iTSAxNTc0LjQyNDA3MiAxMDUwLjA0NzQ4NSBDIDE1NzQuNDI0MDcyIDc2MC4wNzE3NzcgMTMzOS4zNTIyOTUgNTI1IDEwNDkuMzc2NTg3IDUyNSBDIDc1OS40MDA5NCA1MjUgNTI0LjMyOTE2MyA3NjAuMDcxNzc3IDUyNC4zMjkxNjMgMTA1MC4wNDc0ODUgQyA1MjQuMzI5MTYzIDEzNDAuMDIzMTkzIDc1OS40MDA5NCAxNTc1LjA5NDg0OSAxMDQ5LjM3NjU4NyAxNTc1LjA5NDg0OSBDIDEzMzkuMzUyMjk1IDE1NzUuMDk0ODQ5IDE1NzQuNDI0MDcyIDEzNDAuMDIzMTkzIDE1NzQuNDI0MDcyIDEwNTAuMDQ3NDg1IFoiLz4KICAgICAgICA8cGF0aCBpZD0iTGluZSIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjZmZmZmZmIiBzdHJva2Utd2lkdGg9IjMuNDYwNTU1IiBzdHJva2UtZGFzaGFycmF5PSIxMy44NDIyMTggNi45MjExMDkiIHN0cm9rZS1kYXNob2Zmc2V0PSIwIiBkPSJNIDk5NC4yMTYxODcgMTA1MC4wNDExMzggTCAxMTA0LjUzNjk4NyAxMDUwLjA0MTEzOCIvPgogICAgICAgIDxwYXRoIGlkPSJMaW5lLWNvcHkiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI2ZmZmZmZiIgc3Ryb2tlLXdpZHRoPSIzLjQ2MDU1NSIgc3Ryb2tlLWRhc2hhcnJheT0iMTMuODQyMjE4IDYuOTIxMTA5IiBzdHJva2UtZGFzaG9mZnNldD0iMCIgZD0iTSAxMDUwLjA0MTEzOCAxMTA1Ljg2NjIxMSBMIDEwNTAuMDQxMTM4IDk5NS41NDU0MSIvPgogICAgICAgIDxwYXRoIGlkPSJBcnJvdy1jb3B5LTMiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI2ZmZmZmZiIgc3Ryb2tlLXdpZHRoPSIxMyIgZD0iTSAxMDQ5LjYyMzQxMyAxNS4zODc2OTUgTCA5MDAuMDkyMjI0IDMxNC40NTAwNzMgTCA5NzcuODQ4NDUgMzE0LjQ1MDA3MyBMIDk3Ny44NDg0NSA0NTggTCAxMTIxLjM5ODMxNSA0NTggTCAxMTIxLjM5ODMxNSAzMTQuNDUwMDczIEwgMTE5OS4xNTQ1NDEgMzE0LjQ1MDA3MyBaIi8+CiAgICAgICAgPHBhdGggaWQ9IkFycm93LWNvcHktNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjZmZmZmZmIiBzdHJva2Utd2lkdGg9IjEzLjI5MTY2IiBkPSJNIDEwNDkuNjI1NDg4IDIwODQuMTgxNjQxIEwgMTE5OS4xNTY3MzggMTc4NS4xMTkzODUgTCAxMTIxLjQwMDUxMyAxNzg1LjExOTM4NSBMIDExMjEuNDAwNTEzIDE2NDEuNTY5NDU4IEwgOTc3Ljg1MDUyNSAxNjQxLjU2OTQ1OCBMIDk3Ny44NTA1MjUgMTc4NS4xMTkzODUgTCA5MDAuMDk0MzYgMTc4NS4xMTkzODUgWiIvPgogICAgICAgIDxwYXRoIGlkPSJBcnJvdy1jb3B5LTUiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI2ZmZmZmZiIgc3Ryb2tlLXdpZHRoPSIxMy4yOTE2NiIgZD0iTSAyMDg0Ljg1OTEzMSAxMDUwLjk1MjUxNSBMIDE3ODUuNzk2NzUzIDkwMS40MjEzODcgTCAxNzg1Ljc5Njc1MyA5NzkuMTc3NjEyIEwgMTY0Mi4yNDY4MjYgOTc5LjE3NzYxMiBMIDE2NDIuMjQ2ODI2IDExMjIuNzI3NTM5IEwgMTc4NS43OTY3NTMgMTEyMi43Mjc1MzkgTCAxNzg1Ljc5Njc1MyAxMjAwLjQ4Mzc2NSBaIi8+CiAgICAgICAgPHBhdGggaWQ9IkFycm93LWNvcHktMiIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjZmZmZmZmIiBzdHJva2Utd2lkdGg9IjEzLjI5MTY2IiBkPSJNIDE1LjM4NzY5NSAxMDUwLjk1MjYzNyBMIDMxNC40NTAwNzMgMTIwMC40ODM3NjUgTCAzMTQuNDUwMDczIDExMjIuNzI3NTM5IEwgNDU4IDExMjIuNzI3NTM5IEwgNDU4IDk3OS4xNzc2MTIgTCAzMTQuNDUwMDczIDk3OS4xNzc2MTIgTCAzMTQuNDUwMDczIDkwMS40MjEzODcgWiIvPgogICAgPC9nPgo8L3N2Zz4K"

const settings: VXObjectSettings = {
    showHelpers: { title: "show helpers", storage:"localStorage", value: false }
}

const CameraTarget = () => {
    const vxkey = "cameraTarget"
    const { IS_DEVELOPMENT } = useVXEngine();

    const pointerTexture = useMemo(() => new TextureLoader().load(base64Pointer), [])
    const floorProjectionTexture = useMemo(() => new TextureLoader().load(base64FloorProjection), [])

    

    const camera = useVXObjectStore(state => state.objects["perspectiveCamera"])
    const showHelpers = useObjectSetting(vxkey, "showHelpers");

    const isVisible = showHelpers && IS_DEVELOPMENT

    const verticalPlaneRef = useRef<THREE.Mesh>(null);
    const FloorProjectionRef = useRef<THREE.Mesh>(null)
    const cameraPointerRef = useRef<THREE.Mesh>(null);

    // Declare reusable objects outside the useFrame loop
    const {
        eulerRotation,
        initialRotation,
        yawRotation,
        combinedQuat,
        axisX,
        axisY
    } = useMemo(() => ({
        eulerRotation: new THREE.Euler(),
        initialRotation: new THREE.Quaternion(),
        yawRotation: new THREE.Quaternion(),
        combinedQuat: new THREE.Quaternion(),
        axisX: new THREE.Vector3(1, 0, 0),
        axisY: new THREE.Vector3(0, 1, 0),
    }), []);

    useFrame(() => {
        if (isVisible)
            if (verticalPlaneRef.current && FloorProjectionRef.current && camera?.ref.current) {
                const cameraPosition = camera.ref.current.position;
                const currentQuaternion = verticalPlaneRef.current.quaternion;
                verticalPlaneRef.current.lookAt(cameraPosition)

                // Update the existing eulerRotation object
                eulerRotation.setFromQuaternion(currentQuaternion, 'YXZ');
                const yaw = eulerRotation.y;  // Extract the Y rotation (yaw)

                // Reuse the initialRotation and yawRotation quaternions
                initialRotation.setFromAxisAngle(axisX, Math.PI / 2);
                yawRotation.setFromAxisAngle(axisY, yaw);

                // Combine the rotations efficiently
                combinedQuat.copy(yawRotation).multiply(initialRotation);

                // Apply the combined quaternion to the horizontal plane
                FloorProjectionRef.current.quaternion.copy(combinedQuat);
                // Project the position
                verticalPlaneRef.current.getWorldPosition(FloorProjectionRef.current.position);
                FloorProjectionRef.current.position.setY(0)

                // Handle camera Represenation
                cameraPointerRef.current.position.set(
                    cameraPosition.x,
                    cameraPosition.y,
                    cameraPosition.z
                )
                cameraPointerRef.current.rotation.set(
                    verticalPlaneRef.current.rotation.x,
                    verticalPlaneRef.current.rotation.y,
                    verticalPlaneRef.current.rotation.z
                )
            }
    });

    return (
        <>        
            {/* Camera Target  */}
            <vx.group vxkey={vxkey} name="Camera Target" settings={settings} visible={isVisible} icon="CameraTarget">
                {/* YZ Plane */}
                <mesh ref={verticalPlaneRef}>
                    <planeGeometry args={[10, 10]} />
                    <meshBasicMaterial
                        map={pointerTexture}
                        transparent={true}
                        alphaTest={0.5}
                        depthWrite={false}
                        side={THREE.DoubleSide}
                    />
                </mesh>
            </vx.group>

            {/* Floor Projection */}
            <mesh ref={FloorProjectionRef} visible={isVisible}>
                <planeGeometry args={[10, 10]} />
                <meshBasicMaterial
                    map={floorProjectionTexture}
                    transparent={true}
                    alphaTest={0.5}
                    depthWrite={false}
                    side={THREE.DoubleSide}
                />
            </mesh>

            {/* Camera Representation */}
            <mesh ref={cameraPointerRef} visible={isVisible}>
                <planeGeometry args={[10, 10]} />
                <meshBasicMaterial
                    map={floorProjectionTexture}
                    transparent={true}
                    alphaTest={0.5}
                    depthWrite={false}
                    side={THREE.DoubleSide}
                />
            </mesh>
        </>
    )
}

export default CameraTarget
