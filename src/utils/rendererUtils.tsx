// VXEngine - VEXR Labs' proprietary toolset for React Three Fiber
// (c) 2024 VEXR Labs. All Rights Reserved.
// See the LICENSE file in the root directory of this source tree for licensing information.

import React from 'react'
import { Ground, VXFrameLimiter } from '@vxengine/components/renderer'
import { GizmoHelper } from '@vxengine/components/renderer/gizmoHelper'
import { GizmoViewport } from '@vxengine/components/renderer/gizmoViewport'
// import { Stats } from '@react-three/drei'

const VXRendererUtils = () => {
  return (
    <>
      {/* <VXFrameLimiter maxFps={120} /> */}
      {/* <Stats/> */}
      <GizmoHelper renderPriority={2} alignment="top-right" margin={[350, 100]}>
        <GizmoViewport labelColor="white" axisHeadScale={1} />
      </GizmoHelper>
    </>
  )
}
export default VXRendererUtils