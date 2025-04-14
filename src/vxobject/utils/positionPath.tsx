import React from "react";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three"
import { useTimelineManagerAPI } from "@vxengine/managers/TimelineManager/store";
import KeyframeNode from "./keyframeNode";
import { EditorKeyframe } from "@vxengine/types/data/editorData";

const PositionPath = ({ vxkey }: { vxkey: string }) => {
    const lineRef = useRef<THREE.Line>(null);

    const trackX = useTimelineManagerAPI(state => state.tracks[`${vxkey}.position.x`]);
    const trackY = useTimelineManagerAPI(state => state.tracks[`${vxkey}.position.y`]);
    const trackZ = useTimelineManagerAPI(state => state.tracks[`${vxkey}.position.z`]);

    const staticProps = useTimelineManagerAPI(state => state.staticProps);

    const getAxisValueAtTime = (
        keyframesForAxis: Record<string, EditorKeyframe>, 
        staticPropKey: string, 
        time: number
    ) => {
        const sortedKeyframes = Object.values(keyframesForAxis).sort((a, b) => a.time - b.time);
        if (sortedKeyframes.length > 0) {
            return interpolateKeyframes(sortedKeyframes, time);
        }
        const staticProp = staticProps[staticPropKey];
        return staticProp ? staticProp.value : 0;
    };

    

    const { positions, sortedTimes, keyframeDataForNodes } = useMemo(() => {
        const keyframesX = trackX?.keyframes || {};
        const keyframesY = trackY?.keyframes || {};
        const keyframesZ = trackZ?.keyframes || {};

        const allTimes = new Set([
            ...Object.values(keyframesX).map(kf => kf.time),
            ...Object.values(keyframesY).map(kf => kf.time),
            ...Object.values(keyframesZ).map(kf => kf.time),
        ]);

        const sortedTimes = [...allTimes].sort((a, b) => a - b);
        const positions = new Float32Array(sortedTimes.length * 3);
        const keyframeDataForNodes = sortedTimes.map(() => []); // Contains keyframe keys and their axis


        sortedTimes.forEach((time, index) => {
            const x = getAxisValueAtTime(keyframesX, `${vxkey}.position.x`, time);
            const y = getAxisValueAtTime(keyframesY, `${vxkey}.position.y`, time);
            const z = getAxisValueAtTime(keyframesZ, `${vxkey}.position.z`, time);

            positions[index * 3] = x;
            positions[index * 3 + 1] = y;
            positions[index * 3 + 2] = z;

            Object.values(keyframesX).forEach((kf: EditorKeyframe) => {
                if (kf.time === time) keyframeDataForNodes[index].push({ id: kf.id, axis: "X" });
            });
            Object.values(keyframesY).forEach((kf: EditorKeyframe) => {
                if (kf.time === time) keyframeDataForNodes[index].push({ id: kf.id, axis: "Y" });
            });
            Object.values(keyframesZ).forEach((kf: EditorKeyframe) => {
                if (kf.time === time) keyframeDataForNodes[index].push({ id: kf.id, axis: "Z" });
            });
        });

        if (lineRef.current) {
            const line = lineRef.current as THREE.Line;
            line.geometry.attributes.position.needsUpdate = true;
        }

        return { positions, sortedTimes, keyframeDataForNodes };
    }, [trackX?.keyframes, trackY?.keyframes, trackZ?.keyframes, staticProps]);

    useEffect(() => {
        if (lineRef.current) {
            const line = lineRef.current as THREE.Line;
            const geometry = line.geometry as THREE.BufferGeometry;

            // Recreate the buffer attribute if the size changes
            geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
            geometry.attributes.position.needsUpdate = true;
        }
    }, [positions]);

    return (
        <>
            <line
                // @ts-expect-error 
                ref={lineRef}
            >
                <lineBasicMaterial color={"white"} />
                <bufferGeometry />
            </line>
            {sortedTimes.map((time, index) => (
                <KeyframeNode
                    key={index}
                    parentVxKey={vxkey}
                    index={index}
                    keyframeKeys={keyframeDataForNodes[index].map(data => data.id)} // Pass the keyframe keys
                    axis={keyframeDataForNodes[index].map(data => data.axis)} // Pass the axis info
                    position={[positions[index * 3], positions[index * 3 + 1], positions[index * 3 + 2]]}
                    color={"#2563eb"}
                />
            ))}
        </>
    );
};

export default PositionPath

const interpolateKeyframes = (keyframes: EditorKeyframe[], currentTime: number): number => {
    if (keyframes.length === 0) return 0;

    // Sort keyframes by time
    const sortedKeyframes = [...keyframes].sort((a, b) => a.time - b.time);

    // Handle edge cases where time is outside the bounds of the keyframes
    if (currentTime <= sortedKeyframes[0].time) {
        return sortedKeyframes[0].value;
    }
    if (currentTime >= sortedKeyframes[sortedKeyframes.length - 1].time) {
        return sortedKeyframes[sortedKeyframes.length - 1].value;
    }

    // Find the two keyframes between which the current time falls
    let startKeyframe: EditorKeyframe | undefined;
    let endKeyframe: EditorKeyframe | undefined;

    for (let i = 0; i < sortedKeyframes.length - 1; i++) {
        if (currentTime >= sortedKeyframes[i].time && currentTime <= sortedKeyframes[i + 1].time) {
            startKeyframe = sortedKeyframes[i];
            endKeyframe = sortedKeyframes[i + 1];
            break;
        }
    }

    if (!startKeyframe || !endKeyframe) {
        return 0; // Fallback if something goes wrong
    }

    const duration = endKeyframe.time - startKeyframe.time;
    const progress = (currentTime - startKeyframe.time) / duration;

    return interpolateNumber(startKeyframe.value, endKeyframe.value, progress);
};

const interpolateNumber = (start: number, end: number, progress: number): number => {
    return start + (end - start) * progress;
};

