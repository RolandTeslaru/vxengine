import { ThreeEvent } from '@react-three/fiber';
import { useObjectManagerAPI, useVXObjectStore } from '@vxengine/managers/ObjectManager';
import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef } from 'react'
import { Html } from '@react-three/drei';
import { vxObjectProps, vxSplineNodeProps } from '@vxengine/managers/ObjectManager/types/objectStore';
import { handleOnVxObjectClick } from '@vxengine/managers/ObjectManager/utils/handleVxObject';
import { ObjectManagerService } from '@vxengine/managers/ObjectManager/service';

export interface SplineNodeProps {
    splineKey: string;
    position: [number, number, number]
    index: number
    color?: string
}

const SplineNode: React.FC<SplineNodeProps> = ({ splineKey, position, index, color = "white" }) => {
    const firstObjectSelected = useVXObjectStore(state => state.objects[0])

    const ref = useRef(null);

    const nodeKey = useMemo(() => `${splineKey}.node${index}`, []);


    useLayoutEffect(() => {
        const splineNodeObject: vxSplineNodeProps = {
            type: "splineNode",
            ref,
            vxkey: nodeKey,
            index,
            splineKey,
            parentKey: splineKey,
            name: `node ${index}`
        }

        ObjectManagerService.addObjectToStore(splineNodeObject, { icon: "SplineNode"});

        return () => ObjectManagerService.removeObjectFromStore(nodeKey)
    }, [])

    return (
        <>
            <mesh ref={ref} position={position} onClick={(e) => handleOnVxObjectClick(e, nodeKey)}>
                <sphereGeometry args={[0.15, 24, 24]} />
                <meshBasicMaterial color={firstObjectSelected?.vxkey === nodeKey ? "yellow" : color} />
            </mesh>

            <Html center position={position} style={{ pointerEvents: "none" }}>
                <div className="flex flex-row relative">
                    {firstObjectSelected?.vxkey === nodeKey ? (
                        <div className={`absolute -right-[120px] flex flex-col bg-neutral-900/70 p-1 px-2 rounded-full
                                         border-neutral-800 border-[1px] text-xs font-roboto-mono text-nowrap`}>
                            <p>
                                <span className='font-extrabold! font-sans text-base! mr-2'>{index}</span> 
                                <span>Spline Node</span>
                            </p>
                        </div>
                    ) : (
                        <div className={`absolute -right-[30px] flex flex-col bg-neutral-900/70 rounded-full
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