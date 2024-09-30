import { ThreeEvent, useFrame } from "@react-three/fiber";
import React from "react";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three"
import { IKeyframe } from "@vxengine/AnimationEngine/types/track";
import { useObjectManagerAPI } from "@vxengine/managers/ObjectManager/store";
import { useTimelineEditorAPI } from "@vxengine/managers/TimelineManager/store";
import { shallow } from "zustand/shallow";
import KeyframeNode from "./keyframeNode";

const PositionPath = ({ vxkey }: { vxkey: string }) => {
    const lineRef = useRef<THREE.Line>(null);
    const trackKeys = useTimelineEditorAPI(state => state.editorObjects[vxkey].trackKeys, shallow);

    const keyframeKeysForTrackPostionX = useTimelineEditorAPI(state => state.tracks[`${vxkey}.position.x`]?.keyframes)
    const keyframeKeysForTrackPostionY = useTimelineEditorAPI(state => state.tracks[`${vxkey}.position.y`]?.keyframes)
    const keyframeKeysForTrackPostionZ = useTimelineEditorAPI(state => state.tracks[`${vxkey}.position.z`]?.keyframes)

    const keyframesForPositionX = useMemo(() => {
        return useTimelineEditorAPI.getState().getKeyframesForTrack(`${vxkey}.position.x`)
    }, [keyframeKeysForTrackPostionX])
    const keyframesForPositionY = useMemo(() => {
        return useTimelineEditorAPI.getState().getKeyframesForTrack(`${vxkey}.position.y`)
    }, [keyframeKeysForTrackPostionY])
    const keyframesForPositionZ = useMemo(() => {
        return useTimelineEditorAPI.getState().getKeyframesForTrack(`${vxkey}.position.z`)
    }, [keyframeKeysForTrackPostionZ])

    const keyframes = useTimelineEditorAPI(state => state.keyframes)
    const staticProps = useTimelineEditorAPI(state => state.staticProps);

    const XpositionKey = `${vxkey}.position.x`;
    const YpositionKey = `${vxkey}.position.y`;
    const ZpositionKey = `${vxkey}.position.z`;

    const getAxisValueAtTime = (
        keyframesForAxis: IKeyframe[], 
        staticPropKey: string, 
        time: number
    ) => {
        if (keyframesForAxis.length > 0) {
            return interpolateKeyframes(keyframesForAxis, time);
        }
        const staticProp = staticProps[staticPropKey];
        return staticProp ? staticProp.value : 0;
    };

    const { positions, sortedTimes, keyframeDataForNodes } = useMemo(() => {
        const _keyframesForX = useTimelineEditorAPI.getState().getKeyframesForTrack(`${vxkey}.position.x`)
        const _keyframesForY = useTimelineEditorAPI.getState().getKeyframesForTrack(`${vxkey}.position.y`)
        const _keyframesForZ = useTimelineEditorAPI.getState().getKeyframesForTrack(`${vxkey}.position.z`)

        const allTimes = new Set([
            ..._keyframesForX.map(kf => kf.time),
            ..._keyframesForY.map(kf => kf.time),
            ..._keyframesForZ.map(kf => kf.time),
        ]);
        const sortedTimes = [...allTimes].sort((a, b) => a - b);

        const positions = new Float32Array(sortedTimes.length * 3);
        const keyframeDataForNodes = sortedTimes.map(() => []); // Contains keyframe keys and their axis

        sortedTimes.forEach((time, index) => {
            const x = getAxisValueAtTime(_keyframesForX, XpositionKey, time);
            const y = getAxisValueAtTime(_keyframesForY, YpositionKey, time);
            const z = getAxisValueAtTime(_keyframesForZ, ZpositionKey, time);

            positions[index * 3] = x;
            positions[index * 3 + 1] = y;
            positions[index * 3 + 2] = z;

            _keyframesForX.forEach(kf => {
                if (kf.time === time) keyframeDataForNodes[index].push({ id: kf.id, axis: "X" });
            });
            _keyframesForY.forEach(kf => {
                if (kf.time === time) keyframeDataForNodes[index].push({ id: kf.id, axis: "Y" });
            });
            _keyframesForZ.forEach(kf => {
                if (kf.time === time) keyframeDataForNodes[index].push({ id: kf.id, axis: "Z" });
            });
        });

        if (lineRef.current) {
            const line = lineRef.current as THREE.Line;
            line.geometry.attributes.position.needsUpdate = true;
        }

        return { positions, sortedTimes, keyframeDataForNodes };
    }, [keyframesForPositionX, keyframesForPositionY, keyframesForPositionZ, keyframes, staticProps, trackKeys]);

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

const interpolateKeyframes = (keyframes: IKeyframe[], currentTime: number): number => {
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
    let startKeyframe: IKeyframe | undefined;
    let endKeyframe: IKeyframe | undefined;

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

