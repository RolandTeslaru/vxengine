'use client'

// import { Html } from '@react-three/drei';
import { ThreeEvent } from '@react-three/fiber';
import { useObjectManagerAPI } from '@vxengine/managers/ObjectManager';
import { UtilityNodeProps } from '@vxengine/types/utilityNode';
import React, { useCallback, useEffect, useMemo, useRef } from 'react'
import { useSplineManagerAPI } from '../store';
import { Html } from '@react-three/drei';
import { vxObjectProps } from '@vxengine/types/objectStore';
import { useVXObjectStore } from '@vxengine/vxobject';

export interface SplineNodeProps {
    splineKey: string;
    position: [number, number, number]
    index: number
    color?: string
}

const SplineNode: React.FC<SplineNodeProps> = ({ splineKey, position, index, color = "white" }) => {
    const addObject = useVXObjectStore(state => state.addObject);
    const removeObject = useVXObjectStore(state => state.removeObject);
    const memoizedAddObject = useCallback(addObject, []);
    const memoizedRemoveObject = useCallback(removeObject, []);

    const selectObjects = useObjectManagerAPI(state => state.selectObjects)

    const addUtilityNode = useObjectManagerAPI(state => state.addUtilityNode)
    const removeUtilityNode = useObjectManagerAPI(state => state.removeUtilityNode)
    const setSelectedUtilityNode = useObjectManagerAPI(state => state.setSelectedUtilityNode);
    const setUtilityTransformAxis = useObjectManagerAPI(state => state.setUtilityTransformAxis);
    const selectedUtilityNode = useObjectManagerAPI(state => state.selectedUtilityNode)
    const setSelectedSpline = useSplineManagerAPI(state => state.setSelectedSpline)

    const ref = useRef();

    const nodeKey = useMemo(() => `${splineKey}.node${index}`, []);

    useEffect(() => {
        const splineNodeObject: vxObjectProps = {
            type: "splineNode",
            ref,
            vxkey: nodeKey,
            index,
            splineKey
        }

        memoizedAddObject(splineNodeObject);

        return () => memoizedRemoveObject(nodeKey)
    }, [])

    const handleOnClick = (e: ThreeEvent<MouseEvent>) => {
        if (!ref.current) return;
        setUtilityTransformAxis(['X', 'Y', 'Z']);
        selectObjects([nodeKey]);
        setSelectedSpline(splineKey)
    };

    return (
        <>
            <mesh ref={ref} position={position} onClick={handleOnClick}>
                <sphereGeometry args={[0.15, 24, 24]} />
                <meshBasicMaterial color={selectedUtilityNode?.nodeKey === nodeKey ? "yellow" : color} />
            </mesh>

            <Html center position={position} style={{ pointerEvents: "none" }}>
                <div className="flex flex-row relative">
                    {selectedUtilityNode?.nodeKey === nodeKey ? (
                        <div className={`absolute -right-[120px] flex flex-col bg-neutral-900 p-1 px-2 rounded-full bg-opacity-70
                                         border-neutral-800 border-[1px] text-xs font-sans-menlo text-nowrap`}>
                            <p>
                                <span className='!font-extrabold font-sans !text-base mr-2'>{index}</span> 
                                <span>Spline Node</span>
                            </p>
                        </div>
                    ) : (
                        <div className={`absolute -right-[30px] flex flex-col bg-neutral-900 rounded-full bg-opacity-70
                                       border-neutral-800 border-[1px] text-nowrap h-7 w-7`}>
                            <p className='text-lg font-bold text-center'>{index}</p>
                        </div>
                    )}                   
                </div>
            </Html>
        </>
    )
}

export default SplineNode
