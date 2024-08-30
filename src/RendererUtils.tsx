// VXEngine - VEXR Labs' proprietary toolset for React Three Fiber
// (c) 2024 VEXR Labs. All Rights Reserved.
// See the LICENSE file in the root directory of this source tree for licensing information.

import React from 'react'
import VXSplineEditor from './components/renderer/VXSplineEditor'
import { Ground, VXFrameLimiter } from './components/renderer'
import { GizmoHelper } from './components/renderer/gizmoHelper'
import { GizmoViewport } from './components/renderer/gizmoViewport'
import { CameraControls } from '@react-three/drei/core/CameraControls'
import { OrbitControls } from '@react-three/drei'

const VXEngineUtils = () => {
  return (
    <>
      <VXFrameLimiter maxFps={30} />
      <Ground />
      <GizmoHelper renderPriority={2} alignment="top-right" margin={[350, 100]}>
        <GizmoViewport labelColor="white" axisHeadScale={1} />
      </GizmoHelper>
      <OrbitControls makeDefault />
    </>
  )
}

export default VXEngineUtils
