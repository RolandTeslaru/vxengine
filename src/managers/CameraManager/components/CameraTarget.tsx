import React, { useMemo, useRef } from 'react'
import { useVXObjectStore, vx } from '../../../vxobject'
import { useFrame, useLoader } from '@react-three/fiber'
import { TextureLoader } from 'three/src/loaders/TextureLoader'
import * as THREE from "three"
import { useObjectSettingsAPI } from '@vxengine/vxobject/ObjectSettingsStore'

const base64Pointer = "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPCEtLSBHZW5lcmF0ZWQgYnkgUGl4ZWxtYXRvciBQcm8gMy41LjcgLS0+Cjxzdmcgd2lkdGg9IjIxMDAiIGhlaWdodD0iMjEwMCIgdmlld0JveD0iMCAwIDIxMDAgMjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICAgIDxnIGlkPSJHcm91cCI+CiAgICAgICAgPHBhdGggaWQ9Ik92YWwiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI2ZmZmZmZiIgc3Ryb2tlLXdpZHRoPSIxMyIgZD0iTSAxNTc0LjQyNDA3MiAxMDUwLjA0NzQ4NSBDIDE1NzQuNDI0MDcyIDc2MC4wNzE3NzcgMTMzOS4zNTIyOTUgNTI1IDEwNDkuMzc2NTg3IDUyNSBDIDc1OS40MDA5NCA1MjUgNTI0LjMyOTE2MyA3NjAuMDcxNzc3IDUyNC4zMjkxNjMgMTA1MC4wNDc0ODUgQyA1MjQuMzI5MTYzIDEzNDAuMDIzMTkzIDc1OS40MDA5NCAxNTc1LjA5NDg0OSAxMDQ5LjM3NjU4NyAxNTc1LjA5NDg0OSBDIDEzMzkuMzUyMjk1IDE1NzUuMDk0ODQ5IDE1NzQuNDI0MDcyIDEzNDAuMDIzMTkzIDE1NzQuNDI0MDcyIDEwNTAuMDQ3NDg1IFoiLz4KICAgICAgICA8cGF0aCBpZD0iTGluZSIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjZmZmZmZmIiBzdHJva2Utd2lkdGg9IjMuNDYwNTU1IiBzdHJva2UtZGFzaGFycmF5PSIxMy44NDIyMTggNi45MjExMDkiIHN0cm9rZS1kYXNob2Zmc2V0PSIwIiBkPSJNIDk5NC4yMTYxODcgMTA1MC4wNDExMzggTCAxMTA0LjUzNjk4NyAxMDUwLjA0MTEzOCIvPgogICAgICAgIDxwYXRoIGlkPSJMaW5lLWNvcHkiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI2ZmZmZmZiIgc3Ryb2tlLXdpZHRoPSIzLjQ2MDU1NSIgc3Ryb2tlLWRhc2hhcnJheT0iMTMuODQyMjE4IDYuOTIxMTA5IiBzdHJva2UtZGFzaG9mZnNldD0iMCIgZD0iTSAxMDUwLjA0MTEzOCAxMTA1Ljg2NjIxMSBMIDEwNTAuMDQxMTM4IDk5NS41NDU0MSIvPgogICAgICAgIDxwYXRoIGlkPSJBcnJvdy1jb3B5LTMiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI2ZmZmZmZiIgc3Ryb2tlLXdpZHRoPSIxMyIgZD0iTSAxMDUwLjM3NjU4NyA0NDIuNjEyMzA1IEwgMTE5OS45MDc4MzcgMTQzLjU0OTkyNyBMIDExMjIuMTUxNjExIDE0My41NDk5MjcgTCAxMTIyLjE1MTYxMSAwIEwgOTc4LjYwMTYyNCAwIEwgOTc4LjYwMTYyNCAxNDMuNTQ5OTI3IEwgOTAwLjg0NTQ1OSAxNDMuNTQ5OTI3IFoiLz4KICAgICAgICA8cGF0aCBpZD0iQXJyb3ctY29weS00IiBmaWxsPSJub25lIiBzdHJva2U9IiNmZmZmZmYiIHN0cm9rZS13aWR0aD0iMTMuMjkxNjYiIGQ9Ik0gMTA1MC4zNzQ1MTIgMTY1Ni44MTgyMzcgTCA5MDAuODQzMzIzIDE5NTUuODgwNjE1IEwgOTc4LjU5OTQ4NyAxOTU1Ljg4MDYxNSBMIDk3OC41OTk0ODcgMjA5OS40MzA2NjQgTCAxMTIyLjE0OTQxNCAyMDk5LjQzMDY2NCBMIDExMjIuMTQ5NDE0IDE5NTUuODgwNjE1IEwgMTE5OS45MDU2NCAxOTU1Ljg4MDYxNSBaIi8+CiAgICAgICAgPHBhdGggaWQ9IkFycm93LWNvcHktNSIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjZmZmZmZmIiBzdHJva2Utd2lkdGg9IjEzLjI5MTY2IiBkPSJNIDE2NTcuMTQwODY5IDEwNTAuMDQ3NDg1IEwgMTk1Ni4yMDMyNDcgMTE5OS41Nzg2MTMgTCAxOTU2LjIwMzI0NyAxMTIxLjgyMjM4OCBMIDIwOTkuNzUzMTc0IDExMjEuODIyMzg4IEwgMjA5OS43NTMxNzQgOTc4LjI3MjQ2MSBMIDE5NTYuMjAzMjQ3IDk3OC4yNzI0NjEgTCAxOTU2LjIwMzI0NyA5MDAuNTE2MjM1IFoiLz4KICAgICAgICA8cGF0aCBpZD0iQXJyb3ctY29weS0yIiBmaWxsPSJub25lIiBzdHJva2U9IiNmZmZmZmYiIHN0cm9rZS13aWR0aD0iMTMuMjkxNjYiIGQ9Ik0gNDQzLjYxMjMwNSAxMDUxLjA0NzM2MyBMIDE0NC41NDk5MjcgOTAxLjUxNjIzNSBMIDE0NC41NDk5MjcgOTc5LjI3MjQ2MSBMIDEgOTc5LjI3MjQ2MSBMIDEgMTEyMi44MjIzODggTCAxNDQuNTQ5OTI3IDExMjIuODIyMzg4IEwgMTQ0LjU0OTkyNyAxMjAwLjU3ODYxMyBaIi8+CiAgICA8L2c+Cjwvc3ZnPgo="

const base64FloorProjection = "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPCEtLSBHZW5lcmF0ZWQgYnkgUGl4ZWxtYXRvciBQcm8gMy41LjcgLS0+Cjxzdmcgd2lkdGg9IjIxMDAiIGhlaWdodD0iMjEwMCIgdmlld0JveD0iMCAwIDIxMDAgMjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICAgIDxnIGlkPSJHcm91cCI+CiAgICAgICAgPHBhdGggaWQ9Ik92YWwiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI2ZmZmZmZiIgc3Ryb2tlLXdpZHRoPSIxMyIgZD0iTSAxNTc0LjQyNDA3MiAxMDUwLjA0NzQ4NSBDIDE1NzQuNDI0MDcyIDc2MC4wNzE3NzcgMTMzOS4zNTIyOTUgNTI1IDEwNDkuMzc2NTg3IDUyNSBDIDc1OS40MDA5NCA1MjUgNTI0LjMyOTE2MyA3NjAuMDcxNzc3IDUyNC4zMjkxNjMgMTA1MC4wNDc0ODUgQyA1MjQuMzI5MTYzIDEzNDAuMDIzMTkzIDc1OS40MDA5NCAxNTc1LjA5NDg0OSAxMDQ5LjM3NjU4NyAxNTc1LjA5NDg0OSBDIDEzMzkuMzUyMjk1IDE1NzUuMDk0ODQ5IDE1NzQuNDI0MDcyIDEzNDAuMDIzMTkzIDE1NzQuNDI0MDcyIDEwNTAuMDQ3NDg1IFoiLz4KICAgICAgICA8cGF0aCBpZD0iTGluZSIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjZmZmZmZmIiBzdHJva2Utd2lkdGg9IjMuNDYwNTU1IiBzdHJva2UtZGFzaGFycmF5PSIxMy44NDIyMTggNi45MjExMDkiIHN0cm9rZS1kYXNob2Zmc2V0PSIwIiBkPSJNIDk5NC4yMTYxODcgMTA1MC4wNDExMzggTCAxMTA0LjUzNjk4NyAxMDUwLjA0MTEzOCIvPgogICAgICAgIDxwYXRoIGlkPSJMaW5lLWNvcHkiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI2ZmZmZmZiIgc3Ryb2tlLXdpZHRoPSIzLjQ2MDU1NSIgc3Ryb2tlLWRhc2hhcnJheT0iMTMuODQyMjE4IDYuOTIxMTA5IiBzdHJva2UtZGFzaG9mZnNldD0iMCIgZD0iTSAxMDUwLjA0MTEzOCAxMTA1Ljg2NjIxMSBMIDEwNTAuMDQxMTM4IDk5NS41NDU0MSIvPgogICAgICAgIDxwYXRoIGlkPSJBcnJvdy1jb3B5LTMiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI2ZmZmZmZiIgc3Ryb2tlLXdpZHRoPSIxMyIgZD0iTSAxMDQ5LjYyMzQxMyAxNS4zODc2OTUgTCA5MDAuMDkyMjI0IDMxNC40NTAwNzMgTCA5NzcuODQ4NDUgMzE0LjQ1MDA3MyBMIDk3Ny44NDg0NSA0NTggTCAxMTIxLjM5ODMxNSA0NTggTCAxMTIxLjM5ODMxNSAzMTQuNDUwMDczIEwgMTE5OS4xNTQ1NDEgMzE0LjQ1MDA3MyBaIi8+CiAgICAgICAgPHBhdGggaWQ9IkFycm93LWNvcHktNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjZmZmZmZmIiBzdHJva2Utd2lkdGg9IjEzLjI5MTY2IiBkPSJNIDEwNDkuNjI1NDg4IDIwODQuMTgxNjQxIEwgMTE5OS4xNTY3MzggMTc4NS4xMTkzODUgTCAxMTIxLjQwMDUxMyAxNzg1LjExOTM4NSBMIDExMjEuNDAwNTEzIDE2NDEuNTY5NDU4IEwgOTc3Ljg1MDUyNSAxNjQxLjU2OTQ1OCBMIDk3Ny44NTA1MjUgMTc4NS4xMTkzODUgTCA5MDAuMDk0MzYgMTc4NS4xMTkzODUgWiIvPgogICAgICAgIDxwYXRoIGlkPSJBcnJvdy1jb3B5LTUiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI2ZmZmZmZiIgc3Ryb2tlLXdpZHRoPSIxMy4yOTE2NiIgZD0iTSAyMDg0Ljg1OTEzMSAxMDUwLjk1MjUxNSBMIDE3ODUuNzk2NzUzIDkwMS40MjEzODcgTCAxNzg1Ljc5Njc1MyA5NzkuMTc3NjEyIEwgMTY0Mi4yNDY4MjYgOTc5LjE3NzYxMiBMIDE2NDIuMjQ2ODI2IDExMjIuNzI3NTM5IEwgMTc4NS43OTY3NTMgMTEyMi43Mjc1MzkgTCAxNzg1Ljc5Njc1MyAxMjAwLjQ4Mzc2NSBaIi8+CiAgICAgICAgPHBhdGggaWQ9IkFycm93LWNvcHktMiIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjZmZmZmZmIiBzdHJva2Utd2lkdGg9IjEzLjI5MTY2IiBkPSJNIDE1LjM4NzY5NSAxMDUwLjk1MjYzNyBMIDMxNC40NTAwNzMgMTIwMC40ODM3NjUgTCAzMTQuNDUwMDczIDExMjIuNzI3NTM5IEwgNDU4IDExMjIuNzI3NTM5IEwgNDU4IDk3OS4xNzc2MTIgTCAzMTQuNDUwMDczIDk3OS4xNzc2MTIgTCAzMTQuNDUwMDczIDkwMS40MjEzODcgWiIvPgogICAgPC9nPgo8L3N2Zz4K"

const IS_DEV = process.env.NODE_ENV === 'development'

const CameraTarget = () => {
    const vxkey = "cameraTarget"
    const pointerTexture = useMemo(() => {
        const tx = new TextureLoader().load(base64Pointer);
        return tx;
    }, [])

    const floorProjectionTexture = useMemo(() => {
        const tx = new TextureLoader().load(base64FloorProjection);
        return tx;
    }, [])

    const settings = {
        showHelpers: true
    }

    const camera = useVXObjectStore(state => state.objects["perspectiveCamera"])
    const showHelpers = useObjectSettingsAPI(state => state.settings[vxkey]?.["showHelpers"])

    const isVisible = IS_DEV && showHelpers

    const verticalPlaneRef = useRef<THREE.Mesh>(null);
    const FloorProjectionRef = useRef<THREE.Mesh>(null)
    const cameraPointerRef = useRef<THREE.Mesh>(null);

    // Declare reusable objects outside the useFrame loop
    const eulerRotation = new THREE.Euler();
    const initialRotation = new THREE.Quaternion();
    const yawRotation = new THREE.Quaternion();
    const combinedQuat = new THREE.Quaternion();
    const axisX = new THREE.Vector3(1, 0, 0);
    const axisY = new THREE.Vector3(0, 1, 0);

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

                // Handle camera Pointer
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
            <vx.group vxkey={vxkey} name="Camera Target" settings={settings} visible={isVisible}>
                {/* YZ Plane */}
                <mesh ref={verticalPlaneRef}>
                    <planeGeometry args={[20, 20]} />
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
                <planeGeometry args={[20, 20]} />
                <meshBasicMaterial
                    map={floorProjectionTexture}
                    transparent={true}
                    alphaTest={0.5}
                    depthWrite={false}
                    side={THREE.DoubleSide}
                />
            </mesh>

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
