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
            {mode === "free" && (
                <OrbitControls/>
            )}
            <CameraTarget />
            <vx.perspectiveCamera makeDefault={mode === "attached"} vxkey='perspectiveCamera' name="Camera" />
        </>
    )
})

export default CameraManagerDriver
