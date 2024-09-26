"use client"
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { CatmullRomLine, Html } from '@react-three/drei';
import { useSplineStore } from '@vxengine/managers/SplineManager/store';
import SplineNode from './SplineNode';

const ARC_SEGMENTS = 200;

interface SplineProps {
    splineKey: string;
}

const Spline: React.FC<SplineProps> = ({ splineKey }) => {  
    const splineObj = useSplineStore(state => state.splines[splineKey])
    const splineNodes = splineObj.nodes

    const segmentMultiplier = 10; 
    const segments = Math.max(splineNodes.length * segmentMultiplier, 10); 


    return (
      <>
        {splineNodes.map((nodePosition, index) => (
            <SplineNode splineKey={splineKey} position={nodePosition} index={index} key={index}/>
        ))}
        <CatmullRomLine
            points={splineObj.nodes}
            curveType="catmullrom"
            color="rgb(237, 53, 87)"
            frustumCulled={true}
            // @ts-expect-error
            segments={segments}
        />
        <CatmullRomLine
            points={splineObj.nodes}
            curveType="centripetal"
            color="rgb(81,217, 121)"
            frustumCulled={true}
            // @ts-expect-error
            segments={segments}
        />
        <CatmullRomLine
            points={splineObj.nodes}
            curveType="chordal"
            color="rgb(55, 108, 250)"
            frustumCulled={true}
            // @ts-expect-error
            segments={segments}
        />
      </>
    );
  };
  
  export default Spline

