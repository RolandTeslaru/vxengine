// VXEngine - VEXR Labs' proprietary toolset for React Three Fiber
// (c) 2024 VEXR Labs. All Rights Reserved.
// See the LICENSE file in the root directory of this source tree for licensing information.

import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { CatmullRomLine, Html } from '@react-three/drei';
import SplineNode from './components/SplineNode';
import { useTimelineManagerAPI } from '../TimelineManager/store';
import { useAnimationEngineAPI } from '@vxengine/AnimationEngine';
import { useVXObjectStore } from '../ObjectManager';
import { vxSplineProps } from '../ObjectManager/types/objectStore';
import { useObjectPropertyAPI } from '../ObjectManager/stores/managerStore';
import { SplineCurve } from 'three';
import { extend } from '@react-three/fiber';
import { debounce } from 'lodash';
import { useVXEngine } from '@vxengine/engine';

interface SplineProps {
    splineKey: string;
    vxkey: string
    visible: boolean
}

// a "Spline" is an
// -> editableObject (reactive edSpline),
// -> vxObject (r3f vxSpline but only when its being shown, so not in Production) 
// -> WASM object (cached in the animationEngine)

// This handles only the vxObject part

const Spline: React.FC<SplineProps> = React.memo(({ vxkey, visible }) => {
    const { IS_DEVELOPMENT } = useVXEngine();
    const splineKey = `${vxkey}.spline`
    const edSpline = useTimelineManagerAPI(state => state.splines[splineKey]);
    if (!edSpline)
        return
    const nodes = edSpline.nodes;

    const segmentMultiplier = 10;
    const segments = Math.max(nodes?.length * segmentMultiplier, 10);

    const tensionTrack = `${vxkey}.splineTension`

    const [tension, setTension] = useState(0.5);
    const debouncedSetTension = useMemo(
        () => debounce((newTension) => {
            setTension(newTension)
        }, 200),
        [] 
    );

    useEffect(() => {
        const unsubscribe = useObjectPropertyAPI.subscribe((state, prevState) => {
            const newTension = state.properties[tensionTrack];
            newTension && debouncedSetTension(newTension);
        });
        return () => {
            unsubscribe();
            debouncedSetTension.cancel();
        };
    }, [debouncedSetTension, tensionTrack]);

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

        addObject(vxSpline, IS_DEVELOPMENT);
        return () => removeObject(splineKey, IS_DEVELOPMENT);
    }, [])

    if (!nodes) return

    if (!visible) return

    return (
        <group>
            {nodes.map((nodePosition, index) => (
                <SplineNode splineKey={splineKey} position={nodePosition} index={index} key={index} />
            ))}            
            <CatmullRomLine
                points={nodes}
                curveType="catmullrom"
                color="rgb(237, 53, 87)"
                frustumCulled={true}
                tension={tension}
                // @ts-expect-error
                segments={segments}
            />
            <CatmullRomLine
                points={nodes}
                curveType="centripetal"
                color="rgb(81,217, 121)"
                frustumCulled={true}
                tension={tension}
                // @ts-expect-error
                segments={segments}
            />
            <CatmullRomLine
                points={nodes}
                curveType="chordal"
                color="rgb(55, 108, 250)"
                frustumCulled={true}
                tension={tension}
                // @ts-expect-error
                segments={segments}
            />
        </group>
    );
});

export default Spline

