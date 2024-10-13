import { ThreeEvent } from '@react-three/fiber';
import React, { useEffect, useMemo, useRef } from 'react'
import { useObjectManagerAPI } from '../../ObjectManager';
import { useSplineManagerAPI } from '../store';
import { IKeyframe } from '@vxengine/AnimationEngine/types/track';
import { UtilityNodeProps } from '@vxengine/types/utilityNode';
import { useTimelineEditorAPI } from '../../TimelineManager/store';
import { useVXEngine } from '@vxengine/engine';

import * as THREE from "three"

export interface SplineKeyframeNode {
    splineKey: string,
    keyframeKey: string,
    color?: string
}

const SplineKeyframeNode = ({ splineKey, keyframeKey, color = "blue" }) => {
    const ref = useRef<THREE.Mesh>(null);

    const addUtilityNode = useObjectManagerAPI(state => state.addUtilityNode)
    const removeUtilityNode = useObjectManagerAPI(state => state.removeUtilityNode)
    const setSelectedUtilityNode = useObjectManagerAPI(state => state.setSelectedUtilityNode);
    const setUtilityTransformAxis = useObjectManagerAPI(state => state.setUtilityTransformAxis);
    const selectedUtilityNode = useObjectManagerAPI(state => state.selectedUtilityNode)
    
    const spline = useSplineManagerAPI(state => state.splines[splineKey])
    const setSelectedSpline = useSplineManagerAPI(state => state.setSelectedSpline)

    const keyframeProgress = useTimelineEditorAPI(state => state.keyframes[keyframeKey]?.value)
    const animationEngine = useVXEngine(state => state.animationEngine)

    const nodeKey = useMemo(() => `${splineKey}.keyframeNode.${keyframeKey}`,[])

    useEffect(() => {
        if(ref.current){
            const node: UtilityNodeProps = {
                type: "splineKeyframe",
                ref: ref.current,
                nodeKey: nodeKey,
                data: {
                    keyframeKeys: keyframeKey
                }
            }
            addUtilityNode(node, nodeKey);
        }

        return () => removeUtilityNode(nodeKey);
    }, [keyframeKey])

    const handleOnClick = (e: ThreeEvent<MouseEvent>) => {
        if (!ref.current) return;
        setUtilityTransformAxis(['X', 'Y', 'Z']);
        setSelectedUtilityNode(nodeKey);
        setSelectedSpline(splineKey)
    };


    const position: [number, number, number] = useMemo(() => {
        if (spline && keyframeProgress !== undefined) {
            const point = animationEngine.getSplinePointAt(splineKey, keyframeProgress);
            
            if (point && typeof point.x === 'number' && typeof point.y === 'number' && typeof point.z === 'number') {
                return [point.x, point.y, point.z];
            }
        }
        return [0, 0, 0]; // Fallback to a default position
    }, [spline, keyframeProgress]);

    return (
        <>
            <mesh ref={ref} position={position} onClick={handleOnClick}>
                <sphereGeometry args={[0.15, 24, 24]} />
                <meshBasicMaterial color={selectedUtilityNode?.nodeKey === nodeKey ? "yellow" : color} />
            </mesh>
        </>
    )
}

export default SplineKeyframeNode
