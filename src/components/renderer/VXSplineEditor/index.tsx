"use client"
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, TransformControls, Text, Html } from '@react-three/drei';
import * as THREE from 'three';
import { Leva, useControls, button } from 'leva';
import splinePointsData from "@/SplinePositions.json";
import { TransformControls as TransformControlsAPI } from 'three-stdlib';
import { useVXEngine } from '@/VXEngine';
import { createPortal } from 'react-dom';
import Spline from './Spline';
import SplineEditorUI from '../../ui/SplineEditorUI';

const VXSplineEditor = ({ transformControls = false, orbitControls = true }: { transformControls?: boolean, orbitControls?: boolean }) => {
  const [selectedSpline, setSelectedSpline] = useState(0);
  const [splines, setSplines] = useState(splinePointsData);

  const transformControl = useRef(null)

  // Mount UI to VXEngine UI Layer
  const [parentElement, setParentElement] = useState(null);
  useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      const element = document.getElementById('VXEngineLeftPanel');
      if (element) {
        console.log(`VXEngine: Mounting SplineEdtitor to id="VXEngineLeftPanel"`, element)
        setParentElement(element)
        observer.disconnect();
      }
    });

    // Start observing the document body for child list changes
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
    };
  }, []);


  return (
    <>
      <Spline
        splineKey={"desktopSplinePoints"}
        splineIndex={0}
        transformControl={transformControl.current}
        setSelectedSpline={setSelectedSpline}
        saveLocation="@/SplinePositions.json"
      />
      <Spline
        splineKey={"desktopCameraTarget"}
        splineIndex={1}
        transformControl={transformControl.current}
        setSelectedSpline={setSelectedSpline}
        saveLocation="@/SplinePositions.json"
      />
      <Html>
        {parentElement && createPortal(
          <SplineEditorUI selectedSpline={selectedSpline} setSelectedSpline={setSelectedSpline}/>,
          parentElement
        )}
      </Html>
    </>
  );
};

export default VXSplineEditor;