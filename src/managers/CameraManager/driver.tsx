// VXEngine - VEXR Labs' proprietary toolset for React Three Fiber
// (c) 2024 VEXR Labs. All Rights Reserved.
// See the LICENSE file in the root directory of this source tree for licensing information.

import { vx } from '@vxengine/vxobject'
import React from 'react'
import CameraTarget from './components/CameraTarget'
import { useCameraManagerAPI } from './store'
import { OrbitControls } from '@react-three/drei'

const CameraManagerDriver = React.memo(() => {
    const mode = useCameraManagerAPI(state => state.mode)

    return (
        <>
            <vx.perspectiveCamera
                vxkey='perspectiveCamera'
                makeDefault={mode === "attached"}
                name="Camera"
            />
            <CameraTarget />
            {mode === "free" && (
                <OrbitControls makeDefault />
            )}

        </>
    )
})

export default CameraManagerDriver
