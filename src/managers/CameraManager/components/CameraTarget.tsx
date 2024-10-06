import React, { useMemo, useRef } from 'react'
import { useVXObjectStore, vx } from '../../../vxobject'
import { useFrame, useLoader } from '@react-three/fiber'
import { TextureLoader } from 'three/src/loaders/TextureLoader'
import * as THREE from "three"

const base64Image = "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPCEtLSBHZW5lcmF0ZWQgYnkgUGl4ZWxtYXRvciBQcm8gMy41LjcgLS0+Cjxzdmcgd2lkdGg9IjIxMDAiIGhlaWdodD0iMjEwMCIgdmlld0JveD0iMCAwIDIxMDAgMjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICAgIDxnIGlkPSJHcm91cCI+CiAgICAgICAgPHBhdGggaWQ9Ik92YWwiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzY0NjQ2NCIgc3Ryb2tlLXdpZHRoPSIyMi41OTU4MjMiIGQ9Ik0gMTYzMC44ODY3MTkgMTA0OC4wNDc0ODUgQyAxNjMwLjg4NjcxOSA3MjYuODg4MzA2IDEzNzAuNTM1NzY3IDQ2Ni41MzczNTQgMTA0OS4zNzY1ODcgNDY2LjUzNzM1NCBDIDcyOC4yMTc0MDcgNDY2LjUzNzM1NCA0NjcuODY2NDU1IDcyNi44ODgzMDYgNDY3Ljg2NjQ1NSAxMDQ4LjA0NzQ4NSBDIDQ2Ny44NjY0NTUgMTM2OS4yMDY1NDMgNzI4LjIxNzQwNyAxNjI5LjU1NzYxNyAxMDQ5LjM3NjU4NyAxNjI5LjU1NzYxNyBDIDEzNzAuNTM1NzY3IDE2MjkuNTU3NjE3IDE2MzAuODg2NzE5IDEzNjkuMjA2NTQzIDE2MzAuODg2NzE5IDEwNDguMDQ3NDg1IFoiLz4KICAgICAgICA8cGF0aCBpZD0iTGluZSIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjNjQ2NDY0IiBzdHJva2Utd2lkdGg9IjMuNDYwNTU1IiBzdHJva2UtZGFzaGFycmF5PSIxMy44NDIyMTggNi45MjExMDkiIHN0cm9rZS1kYXNob2Zmc2V0PSIwIiBkPSJNIDk5NC4yMTYxODcgMTA1MC4wNDExMzggTCAxMTA0LjUzNjk4NyAxMDUwLjA0MTEzOCIvPgogICAgICAgIDxwYXRoIGlkPSJMaW5lLWNvcHkiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzY0NjQ2NCIgc3Ryb2tlLXdpZHRoPSIzLjQ2MDU1NSIgc3Ryb2tlLWRhc2hhcnJheT0iMTMuODQyMjE4IDYuOTIxMTA5IiBzdHJva2UtZGFzaG9mZnNldD0iMCIgZD0iTSAxMDUwLjA0MTEzOCAxMTA1Ljg2NjIxMSBMIDEwNTAuMDQxMTM4IDk5NS41NDU0MSIvPgogICAgICAgIDxwYXRoIGlkPSJPdmFsLWNvcHkiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzY0NjQ2NCIgc3Ryb2tlLXdpZHRoPSI3Ljk3NDk5NiIgZD0iTSAxNTk0Ljk5OTI2OCAxMDUwLjcwNTY4OCBDIDE1OTQuOTk5MjY4IDc0OS4zNjY2OTkgMTM1MC43MTU2OTggNTA1LjA4MzAwOCAxMDQ5LjM3NjU4NyA1MDUuMDgzMDA4IEMgNzQ4LjAzNzUzNyA1MDUuMDgzMDA4IDUwMy43NTM5MzcgNzQ5LjM2NjY5OSA1MDMuNzUzOTM3IDEwNTAuNzA1Njg4IEMgNTAzLjc1MzkzNyAxMzUyLjA0NDkyMiA3NDguMDM3NTM3IDE1OTYuMzI4MzY5IDEwNDkuMzc2NTg3IDE1OTYuMzI4MzY5IEMgMTM1MC43MTU2OTggMTU5Ni4zMjgzNjkgMTU5NC45OTkyNjggMTM1Mi4wNDQ5MjIgMTU5NC45OTkyNjggMTA1MC43MDU2ODggWiIvPgogICAgICAgIDxwYXRoIGlkPSJBcnJvdy1jb3B5LTMiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzY0NjQ2NCIgc3Ryb2tlLXdpZHRoPSIxMy4yOTE2NiIgZD0iTSAxMDQ5LjM3NjU4NyA0NDIuNjEyMzA1IEwgMTE5OC45MDc4MzcgMTQzLjU0OTkyNyBMIDExMjEuMTUxNjExIDE0My41NDk5MjcgTCAxMTIxLjE1MTYxMSAwIEwgOTc3LjYwMTYyNCAwIEwgOTc3LjYwMTYyNCAxNDMuNTQ5OTI3IEwgODk5Ljg0NTQ1OSAxNDMuNTQ5OTI3IFoiLz4KICAgICAgICA8cGF0aCBpZD0iQXJyb3ctY29weS00IiBmaWxsPSJub25lIiBzdHJva2U9IiM2NDY0NjQiIHN0cm9rZS13aWR0aD0iMTMuMjkxNjYiIGQ9Ik0gMTA0NS41MTQyODIgMTY1NC44NDU0NTkgTCA5MDEuMjI1MjIgMTk1Ni40NzE5MjQgTCA5NzguOTY5NjA0IDE5NTUuMTE0ODY4IEwgOTgxLjQ3NDg1NCAyMDk4LjY0MzA2NiBMIDExMjUuMDAyOTMgMjA5Ni4xMzc2OTUgTCAxMTIyLjQ5NzY4MSAxOTUyLjYwOTYxOSBMIDEyMDAuMjQyMDY1IDE5NTEuMjUyNTYzIFoiLz4KICAgICAgICA8cGF0aCBpZD0iQXJyb3ctY29weS01IiBmaWxsPSJub25lIiBzdHJva2U9IiM2NDY0NjQiIHN0cm9rZS13aWR0aD0iMTMuMjkxNjYiIGQ9Ik0gMTY1Ni4xNDA4NjkgMTA0OC4wNDc0ODUgTCAxOTU1LjIwMzI0NyAxMTk3LjU3ODYxMyBMIDE5NTUuMjAzMjQ3IDExMTkuODIyMzg4IEwgMjA5OC43NTMxNzQgMTExOS44MjIzODggTCAyMDk4Ljc1MzE3NCA5NzYuMjcyNDYxIEwgMTk1NS4yMDMyNDcgOTc2LjI3MjQ2MSBMIDE5NTUuMjAzMjQ3IDg5OC41MTYyMzUgWiIvPgogICAgICAgIDxwYXRoIGlkPSJBcnJvdy1jb3B5LTIiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzY0NjQ2NCIgc3Ryb2tlLXdpZHRoPSIxMy4yOTE2NiIgZD0iTSA0NDIuNjEyMzA1IDEwNDguMDQ3MzYzIEwgMTQzLjU0OTkyNyA4OTguNTE2MjM1IEwgMTQzLjU0OTkyNyA5NzYuMjcyNDYxIEwgLTAgOTc2LjI3MjQ2MSBMIC0wIDExMTkuODIyMzg4IEwgMTQzLjU0OTkyNyAxMTE5LjgyMjM4OCBMIDE0My41NDk5MjcgMTE5Ny41Nzg2MTMgWiIvPgogICAgPC9nPgo8L3N2Zz4K"

const CameraTarget = () => {
    const texture = useMemo(() => {
        const tx = new TextureLoader().load(base64Image)
        return tx
    }, [])

    const camera = useVXObjectStore(state => state.objects["perspectiveCamera"])
    const verticalPlaneRef = useRef(null);
    const horizontalPLaneRef = useRef(null)

    // Declare reusable objects outside the useFrame loop
    const eulerRotation = new THREE.Euler();
    const initialRotation = new THREE.Quaternion();
    const yawRotation = new THREE.Quaternion();
    const combinedQuat = new THREE.Quaternion();
    const axisX = new THREE.Vector3(1, 0, 0);
    const axisY = new THREE.Vector3(0, 1, 0);

    useFrame(() => {
        if (verticalPlaneRef.current && horizontalPLaneRef.current && camera?.ref.current) {
            const cameraPosition = camera.ref.current.position;
            verticalPlaneRef.current.lookAt(cameraPosition);

            const currentQuaternion = verticalPlaneRef.current.quaternion;

            // Update the existing eulerRotation object
            eulerRotation.setFromQuaternion(currentQuaternion, 'YXZ');
            const yaw = eulerRotation.y;  // Extract the Y rotation (yaw)

            // Reuse the initialRotation and yawRotation quaternions
            initialRotation.setFromAxisAngle(axisX, Math.PI / 2);
            yawRotation.setFromAxisAngle(axisY, yaw);

            // Combine the rotations efficiently
            combinedQuat.copy(yawRotation).multiply(initialRotation);

            // Apply the combined quaternion to the horizontal plane
            horizontalPLaneRef.current.quaternion.copy(combinedQuat);
        }
    });

    return (
        <>
            <vx.group vxkey='cameraTarget' name="Camera Target">
                {/* YZ Plane */}
                <mesh ref={verticalPlaneRef}>
                    <planeGeometry args={[20, 20]} />
                    <meshBasicMaterial
                        map={texture}
                        transparent={true}
                        alphaTest={0.5}
                        depthWrite={false}
                        side={THREE.DoubleSide}
                    />
                </mesh>
                {/* XZ Plane */}
                <mesh ref={horizontalPLaneRef} rotation={[Math.PI / 2, 0, 0]}>
                    <planeGeometry args={[20, 20]} />
                    <meshBasicMaterial
                        map={texture}
                        transparent={true}
                        alphaTest={0.5}
                        depthWrite={false}
                        side={THREE.DoubleSide}
                    />
                </mesh>
            </vx.group>

        </>
    )
}

export default CameraTarget
