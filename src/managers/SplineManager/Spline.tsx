"use client"

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { CatmullRomLine, Html } from '@react-three/drei';
import { useSplineManagerAPI } from '@vxengine/managers/SplineManager/store';
import SplineNode from './components/SplineNode';
import { useTimelineEditorAPI } from '../TimelineManager/store';
import SplineKeyframeNode from './components/SplineKeyframeNode';

interface SplineProps {
    splineKey: string;
    vxkey: string
}

const Spline: React.FC<SplineProps> = React.memo(({ vxkey }) => {
    const splineKey = `${vxkey}.spline`
    const nodes = useSplineManagerAPI(state => state.splines[splineKey]?.nodes)
    const splineProgressTrackKey = `${vxkey}.splineProgress`
    const getKeyframeForTrack = useTimelineEditorAPI(state => state.getKeyframesForTrack)

    const keyframeNodes = useMemo(() => {
        return getKeyframeForTrack(splineProgressTrackKey);
    }, [splineProgressTrackKey])

    console.log("Spline Keyframe Nodes", keyframeNodes)

    const segmentMultiplier = 10;
    const segments = Math.max(nodes?.length * segmentMultiplier, 10); 

    if(!nodes)
        return


    return (
        <>
            {nodes.map((nodePosition, index) => (
                <SplineNode splineKey={splineKey} position={nodePosition} index={index} key={index} />
            ))}
            {/* {Object.entries(keyframeNodes).map(([key, keyframe]) => (
                <SplineKeyframeNode 
                    splineKey={splineKey}
                    keyframeKey={keyframe.id}
                /> 
))} */}
            <CatmullRomLine
                points={nodes}
                curveType="catmullrom"
                color="rgb(237, 53, 87)"
                frustumCulled={true}
                // @ts-expect-error
                segments={segments}
            />
            <CatmullRomLine
                points={nodes}
                curveType="centripetal"
                color="rgb(81,217, 121)"
                frustumCulled={true}
                // @ts-expect-error
                segments={segments}
            />
            <CatmullRomLine
                points={nodes}
                curveType="chordal"
                color="rgb(55, 108, 250)"
                frustumCulled={true}
                // @ts-expect-error
                segments={segments}
            />
        </>
    );
});

export default Spline

