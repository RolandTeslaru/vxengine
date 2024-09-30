"use client"
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { CatmullRomLine, Html } from '@react-three/drei';
import { useSplineManagerAPI } from '@vxengine/managers/SplineManager/store';
import SplineNode from './SplineNode';
import { useVXAnimationStore } from '@vxengine/AnimationEngine';
import { ISpline } from '@vxengine/AnimationEngine/types/track';
import { useTimelineEditorAPI } from '../TimelineManager/store';
import { useObjectManagerAPI } from '../ObjectManager';
import { useVXObjectStore } from '@vxengine/vxobject';

const ARC_SEGMENTS = 200;

interface SplineProps {
    splineKey: string;
    vxkey: string
}

const Spline: React.FC<SplineProps> = React.memo(({ vxkey }) => {
    const splineKey = `${vxkey}.spline`
    const nodes = useSplineManagerAPI(state => state.splines[splineKey]?.nodes)

    const segmentMultiplier = 10;
    const segments = Math.max(nodes?.length * segmentMultiplier, 10); 

    if(!nodes)
        return


    return (
        <>
            {nodes.map((nodePosition, index) => (
                <SplineNode splineKey={splineKey} position={nodePosition} index={index} key={index} />
            ))}
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

