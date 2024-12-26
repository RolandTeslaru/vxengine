// VXEngine - VEXR Labs' proprietary toolset for React Three Fiber
// (c) 2024 VEXR Labs. All Rights Reserved.
// See the LICENSE file in the root directory of this source tree for licensing information.

"use client"

import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { CatmullRomLine, Html } from '@react-three/drei';
import SplineNode from './components/SplineNode';
import { useTimelineEditorAPI } from '../TimelineManager/store';
import SplineKeyframeNode from './components/SplineKeyframeNode';
import { useAnimationEngineAPI } from '@vxengine/AnimationEngine';
import { useVXObjectStore } from '../ObjectManager';
import { vxSplineProps } from '../ObjectManager/types/objectStore';

interface SplineProps {
    splineKey: string;
    vxkey: string
    visible: boolean
}

// a "Spline" is an editableObject (reactive), an vxObject (r3f), 
// This handles only the vxObject part

const Spline: React.FC<SplineProps> = React.memo(({ vxkey, visible }) => {
    const splineKey = `${vxkey}.spline`
    const nodes = useTimelineEditorAPI(state => state.splines[splineKey].nodes)
    const trackKey = `${vxkey}.splineProgress`

    const segmentMultiplier = 10;
    const segments = Math.max(nodes?.length * segmentMultiplier, 10);

    // This handles only the VXOBjectStore aspect of the spline identity
    useLayoutEffect(() => {
        const currentTimeline = useAnimationEngineAPI.getState().currentTimeline;
        const rawSpline = currentTimeline.splines?.[splineKey]

        const addObject = useVXObjectStore.getState().addObject;
        const removeObject = useVXObjectStore.getState().removeObject;

        const vxSpline: vxSplineProps = {
            objectVxKey: vxkey,
            vxkey: splineKey,
            ref: {
                current: {
                    nodes: rawSpline.nodes,
                    type: "Spline"
                }
            },
            type: "spline",
            name: `${vxkey} spline`,
            parentKey: "splines"
        }

        addObject(vxSpline);
        return () => removeObject(splineKey);
    }, [])

    if (!nodes) return

    if(!visible) return

    return (
        <group>
            {nodes.map((nodePosition, index) => (
                <SplineNode splineKey={splineKey} position={nodePosition} index={index} key={index} />
            ))}
            {/* {Object.entries(keyframeNodes).map(([key, keyframe]) => (
                <SplineKeyframeNode
                    splineKey={splineKey}
                    keyframeKey={keyframe.id}
                />
            ))} */}
            <CatmullRomLine
                points={nodes}
                curveType="catmullrom"
                color="rgb(237, 53, 87)"
                frustumCulled={true}
                // @ts-expect-error
                segments={segments}
            />
            <CatmullRomLine
                points={nodes}
                curveType="centripetal"
                color="rgb(81,217, 121)"
                frustumCulled={true}
                // @ts-expect-error
                segments={segments}
            />
            <CatmullRomLine
                points={nodes}
                curveType="chordal"
                color="rgb(55, 108, 250)"
                frustumCulled={true}
                // @ts-expect-error
                segments={segments}
            />
        </group>
    );
});

export default Spline

