import { Html } from "@react-three/drei";
import { ThreeEvent } from "@react-three/fiber";
import React, { useEffect, useMemo } from "react";
import { useRef } from "react";
import { useObjectManagerStore } from "@vxengine/managers/ObjectManager/store";
import { useTimelineEditorAPI } from "@vxengine/managers/TimelineManager/store";
import { UtilityNodeProps } from "@vxengine/types/utilityNode";

export interface KeyframeNodeProps {
    keyframeKeys: string[];
    axis: string[];
    position: [number, number, number];
    color?: string;
    size?: number;
}

const KeyframeNode: React.FC<KeyframeNodeProps> = ({ keyframeKeys, axis, position, color = "yellow", size = 0.3 }) => {
    const ref = useRef<THREE.Mesh>(null);

    const addUtilityNode = useObjectManagerStore(state => state.addUtilityNode);
    const removeUtilityNode = useObjectManagerStore(state => state.removeUtilityNode);
    const setSelectedUtilityNode = useObjectManagerStore(state => state.setSelectedUtilityNode);
    const setUtilityTransformAxis = useObjectManagerStore(state => state.setUtilityTransformAxis);
    const selectedUtilityNode = useObjectManagerStore(state => state.selectedUtilityNode)
    const setSelectedKeyframeKeys = useTimelineEditorAPI(state => state.setSelectedKeyframeKeys)
    
    const nodeKey = useMemo(() => keyframeKeys.join('-'), [keyframeKeys])

    useEffect(() => {
        if(ref.current){
            const node: UtilityNodeProps = {
                type: "keyframe",
                ref: ref.current,
                nodeKey: nodeKey,
                data: {
                    keyframeKeys
                }
            }
            addUtilityNode(node, nodeKey)
        }

        return () => removeUtilityNode(nodeKey)
    }, [keyframeKeys])


    const handleOnClick = (e: ThreeEvent<MouseEvent>) => {
        if (!ref.current) return;
        setUtilityTransformAxis(axis);
        setSelectedUtilityNode(nodeKey);
        setSelectedKeyframeKeys(keyframeKeys)
    };

    // Colors for each axis
    const axisColors = {
        X: "rgb(237, 53, 87)",
        Y: "rgb(81,217, 121)",
        Z: "rgb(55, 108, 250)"
    };

    return (
        <>
            {/* Keyframe Node */}
            <mesh ref={ref} position={position} onClick={handleOnClick}>
                <sphereGeometry args={[0.2, 24, 24]} />
                <meshBasicMaterial color={selectedUtilityNode?.nodeKey === nodeKey ? "yellow" : color} />
            </mesh>

            {/* Axis Dots and Html */}
            <Html center position={position} style={{ pointerEvents: "none" }}>
                <div className="flex flex-row relative">
                    {selectedUtilityNode?.nodeKey === nodeKey && (
                        <div className="absolute -left-[100px] flex flex-col bg-neutral-900 p-1 rounded-xl bg-opacity-70 border-neutral-800 border-[1px] text-xs font-sans-menlo">
                            <p>Keyframe Node</p>
                        </div>
                    )}
                    <div style={{ display: "flex", flexDirection: "column", gap: "5px", marginLeft: 50, }}
                        className="bg-neutral-900 p-1 rounded-xl bg-opacity-70 border-neutral-800 border-[1px]"
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