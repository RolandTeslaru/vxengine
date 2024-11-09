'use client'

import { ThreeEvent } from '@react-three/fiber';
import React, { useCallback, useEffect, useMemo, useRef } from 'react'
import { useObjectManagerAPI, useVXObjectStore } from '../../ObjectManager';
import { useSplineManagerAPI } from '../store';
import { IKeyframe } from '@vxengine/AnimationEngine/types/track';
import { useTimelineEditorAPI } from '../../TimelineManager/store';
import { useVXEngine } from '@vxengine/engine';

import * as THREE from "three"
import { useObjectSettingsAPI } from "@vxengine/managers/ObjectManager";
import { vxObjectProps } from '@vxengine/managers/ObjectManager/types/objectStore';

export interface SplineKeyframeNode {
    splineKey: string,
    keyframeKey: string,
    color?: string
}

const SplineKeyframeNode = ({ splineKey, keyframeKey, color = "blue" }) => {
    const ref = useRef<THREE.Mesh>(null);

    const firstObjectSelectedVxkey = useObjectManagerAPI(state => state.selectedObjects[0]?.vxkey);

    const addObject = useVXObjectStore(state => state.addObject);
    const removeObject = useVXObjectStore(state => state.removeObject);
    const memoizedAddObject = useCallback(addObject, []);
    const memoizedRemoveObject = useCallback(removeObject, []);
    
    const spline = useSplineManagerAPI(state => state.splines[splineKey])
    const setSelectedSpline = useSplineManagerAPI(state => state.setSelectedSpline)

    const keyframeProgress = useTimelineEditorAPI(state => state.keyframes[keyframeKey]?.value)
    const animationEngine = useVXEngine(state => state.animationEngine)

    const nodeKey = useMemo(() => `${splineKey}.keyframeNode.${keyframeKey}`,[])

    useEffect(() => {
        const newVXObject: vxObjectProps = {
            type: "keyframeNode",
            ref: ref,
            vxkey: nodeKey,
            axis: ["X", "Y", "Z"],
            data: {
                keyframeKeys: keyframeKey
            }
        }

        memoizedAddObject(newVXObject);

        return () => memoizedRemoveObject(nodeKey)
    }, [])

    const handleOnClick = (e: ThreeEvent<MouseEvent>) => {
        if (!ref.current) return;
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
                <meshBasicMaterial color={firstObjectSelectedVxkey === nodeKey ? "yellow" : color} />
            </mesh>
        </>
    )
}

export default SplineKeyframeNode
