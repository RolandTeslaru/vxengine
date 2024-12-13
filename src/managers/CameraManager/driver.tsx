// VXEngine - VEXR Labs' proprietary toolset for React Three Fiber
// (c) 2024 VEXR Labs. All Rights Reserved.
// See the LICENSE file in the root directory of this source tree for licensing information.

'use client'

import { vx } from '@vxengine/vxobject'
import React from 'react'
import CameraTarget from './components/CameraTarget'
import { useCameraManagerAPI } from './store'
import { OrbitControls } from '@react-three/drei'
import { useVXObjectStore } from '../ObjectManager'

const CameraManagerDriver = React.memo(() => {
    const mode = useCameraManagerAPI(state => state.mode)

    return (
        <>
            {mode === "free" && (
                <OrbitControls makeDefault/>
            )}
            <CameraTarget />
            
            <vx.perspectiveCamera 
                vxkey='perspectiveCamera' 
                // @ts-expect-error
                makeDefault={mode === "attached"} 
                name="Camera" 
            />
        </>
    )
})

const VXOrbitControls = () => {
    const cameraVxObject = useVXObjectStore(state => state.objects["perspectiveCamera"]);
    
    return (
        <OrbitControls makeDefault/>
    )
}

export default CameraManagerDriver
