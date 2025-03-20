import { ThreeEvent } from "@react-three/fiber";
import React, { useCallback, useEffect, useMemo } from "react";
import { useRef } from "react";
import { useObjectManagerAPI } from "@vxengine/managers/ObjectManager/stores/managerStore";
import { selectKeyframeSTATIC as selectKeyframe } from "@vxengine/managers/TimelineManager/TimelineEditor/store";
import * as THREE from "three"
import { Html } from "@react-three/drei";
import { useVXObjectStore } from "../../managers/ObjectManager/stores/objectStore";
import { vxKeyframeNodeProps, vxObjectProps } from "@vxengine/managers/ObjectManager/types/objectStore";
import { useVXEngine } from "@vxengine/engine";

export interface KeyframeNodeProps {
    keyframeKeys: string[];
    parentVxKey: string;
    axis: string[];
    index: number
    position: [number, number, number];
    color?: string;
    size?: number;
}

// Colors for each axis
const axisColors = {
    X: "rgb(237, 53, 87)",
    Y: "rgb(81,217, 121)",
    Z: "rgb(55, 108, 250)"
};

const KeyframeNode: React.FC<KeyframeNodeProps> = ({ keyframeKeys, parentVxKey, index, axis, position, color = "yellow", size = 0.3 }) => {
    const firstObjectSelected = useVXObjectStore(state => state.objects[0])
    const { IS_DEVELOPMENT } = useVXEngine();

    const ref = useRef<THREE.Mesh>(null);

    const nodeKey = useMemo(() => keyframeKeys.join('-'), [keyframeKeys])

    useEffect(() => {
        const addObject = useVXObjectStore.getState().addObject
        const removeObject = useVXObjectStore.getState().removeObject
        const keyframeNode: vxKeyframeNodeProps = {
            type: "keyframeNode",
            ref,
            vxkey: nodeKey,
            axis: axis,
            name: `Keyframe Node ${index}`,
            data: {
                keyframeKeys
            },
            parentKey: parentVxKey
        }
        addObject(keyframeNode, IS_DEVELOPMENT, { icon: "Keyframe"});

        return () => removeObject(nodeKey, IS_DEVELOPMENT)
    }, [keyframeKeys])

    return (
        <>
            {/* Keyframe Node */}
            <mesh ref={ref} position={position} onClick={(e) => handleOnClick(e, ref, nodeKey)}>
                <sphereGeometry args={[0.2, 24, 24]} />
                <meshBasicMaterial color={firstObjectSelected?.vxkey === nodeKey ? "yellow" : color} />
            </mesh>

            {/* Axis Dots and Html */}
            <Html center position={position} style={{ pointerEvents: "none" }}>
                <div className="flex flex-row relative">
                    {firstObjectSelected?.vxkey === nodeKey && (
                        <div className="absolute -left-[100px] flex flex-col bg-neutral-900/70 p-1 rounded-xl border-neutral-800 border-[1px] text-xs font-roboto-mono">
                            <p>Keyframe Node</p>
                        </div>
                    )}
                    <div style={{ display: "flex", flexDirection: "column", gap: "5px", marginLeft: 50, }}
                        className="bg-neutral-900/70 p-1 rounded-xl border-neutral-800 border-[1px]"
                    >
                        {axis.map((oneAxis) => (
                            <div key={oneAxis} style={{
                                width: "10px",
                                height: "10px",
                                backgroundColor: axisColors[oneAxis],
                                borderRadius: "50%",
                                content: "",
                            }}>
                            </div>
                        ))}
                    </div>
                </div>
            </Html>
        </>
    );
};

export default KeyframeNode



const handleOnClick = (e: ThreeEvent<MouseEvent>, ref:React.RefObject<any>, vxkey) => {
    if (!ref.current) return;

    useObjectManagerAPI.getState().selectObject(vxkey);
};