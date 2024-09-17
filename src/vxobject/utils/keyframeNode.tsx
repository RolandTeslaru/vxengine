import { Html } from "@react-three/drei";
import { ThreeEvent } from "@react-three/fiber";
import React from "react";
import { useRef } from "react";
import { useObjectManagerStore } from "vxengine/managers/ObjectManager/store";

export interface KeyframeNodeProps {
    keyframeKeys: string[];
    axis: string[];
    position: [number, number, number];
    color?: string;
    size?: number;
}

const KeyframeNode: React.FC<KeyframeNodeProps> = ({ keyframeKeys, axis, position, color = "yellow", size = 0.3 }) => {
    const ref = useRef<THREE.Mesh>(null);
    const setSelectedUtilityObject = useObjectManagerStore(state => state.setSelectedUtilityObject);
    const setUtilityTransformAxis = useObjectManagerStore(state => state.setUtilityTransformAxis);

    const handleOnClick = (e: ThreeEvent<MouseEvent>) => {
        if (!ref.current) return;
        setUtilityTransformAxis(axis);
        setSelectedUtilityObject(ref.current, "keyframeNode", keyframeKeys);
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
                <octahedronGeometry args={[size, 0]} />
                <meshBasicMaterial color={color} wireframe />
            </mesh>

            {/* Axis Dots and Html */}
            <Html center position={position} style={{ pointerEvents: "none" }}>
                <div className="flex flex-row">

                    <div style={{ display: "flex", flexDirection: "column", gap: "5px", marginLeft: 50, }}>
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