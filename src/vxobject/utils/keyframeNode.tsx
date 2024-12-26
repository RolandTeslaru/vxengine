'use client'

// import { Html } from "@react-three/drei";
import { ThreeEvent } from "@react-three/fiber";
import React, { useCallback, useEffect, useMemo } from "react";
import { useRef } from "react";
import { useObjectManagerAPI } from "@vxengine/managers/ObjectManager/stores/managerStore";
import { useTimelineEditorAPI } from "@vxengine/managers/TimelineManager/store";
import * as THREE from "three"
import { Html } from "@react-three/drei";
import { useVXObjectStore } from "../../managers/ObjectManager/stores/objectStore";
import { vxObjectProps } from "@vxengine/managers/ObjectManager/types/objectStore";

export interface KeyframeNodeProps {
    keyframeKeys: string[];
    axis: string[];
    position: [number, number, number];
    color?: string;
    size?: number;
}

const KeyframeNode: React.FC<KeyframeNodeProps> = ({ keyframeKeys, axis, position, color = "yellow", size = 0.3 }) => {
    return null;
    // const addObject = useVXObjectStore(state => state.addObject);
    // const removeObject = useVXObjectStore(state => state.removeObject);
    // const firstObjectSelected = useVXObjectStore(state => state.objects[0])

    // const memoizedAddObject = useCallback(addObject, []);
    // const memoizedRemoveObject = useCallback(removeObject, []);

    // const selectObjects = useObjectManagerAPI(state => state.selectObjects)
    
    // const setSelectedKeyframeKeys = useTimelineEditorAPI(state => state.setSelectedKeyframeKeys)

    // const ref = useRef<THREE.Mesh>(null);

    // const nodeKey = useMemo(() => keyframeKeys.join('-'), [keyframeKeys])

    // useEffect(() => {
    //     const keyframeNode: vxObjectProps = {
    //         type: "keyframeNode",
    //         ref,
    //         vxkey: nodeKey,
    //         axis: axis,
    //         data: {
    //             keyframeKeys
    //         },
    //         parentKey: null
    //     }
    //     memoizedAddObject(keyframeNode);

    //     return () => memoizedRemoveObject(nodeKey)
    // }, [keyframeKeys])


    // const handleOnClick = (e: ThreeEvent<MouseEvent>) => {
    //     if (!ref.current) return;
    //     selectObjects([nodeKey]);
    //     setSelectedKeyframeKeys(keyframeKeys)
    // };

    // // Colors for each axis
    // const axisColors = {
    //     X: "rgb(237, 53, 87)",
    //     Y: "rgb(81,217, 121)",
    //     Z: "rgb(55, 108, 250)"
    // };

    // return (
    //     <>
    //         {/* Keyframe Node */}
    //         <mesh ref={ref} position={position} onClick={handleOnClick}>
    //             <sphereGeometry args={[0.2, 24, 24]} />
    //             <meshBasicMaterial color={firstObjectSelected?.vxkey === nodeKey ? "yellow" : color} />
    //         </mesh>

    //         {/* Axis Dots and Html */}
    //         <Html center position={position} style={{ pointerEvents: "none" }}>
    //             <div className="flex flex-row relative">
    //                 {firstObjectSelected?.vxkey === nodeKey && (
    //                     <div className="absolute -left-[100px] flex flex-col bg-neutral-900 p-1 rounded-xl bg-opacity-70 border-neutral-800 border-[1px] text-xs font-sans-menlo">
    //                         <p>Keyframe Node</p>
    //                     </div>
    //                 )}
    //                 <div style={{ display: "flex", flexDirection: "column", gap: "5px", marginLeft: 50, }}
    //                     className="bg-neutral-900 p-1 rounded-xl bg-opacity-70 border-neutral-800 border-[1px]"
    //                 >
    //                     {axis.map((oneAxis) => (
    //                         <div key={oneAxis} style={{
    //                             width: "10px",
    //                             height: "10px",
    //                             backgroundColor: axisColors[oneAxis],
    //                             borderRadius: "50%",
    //                             content: "",
    //                         }}>
    //                         </div>
    //                     ))}
    //                 </div>
    //             </div>
    //         </Html>
    //     </>
    // );
};

export default KeyframeNode