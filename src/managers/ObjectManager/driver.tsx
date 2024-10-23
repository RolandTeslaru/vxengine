'use client'

import { TransformControls, useCamera } from "@react-three/drei";
import React from "react";
import { useEffect, useRef, useState } from "react";
import { useObjectManagerAPI, useObjectPropertyAPI } from "./store";
import { useTimelineEditorAPI } from "../TimelineManager/store";
import { KeyframeNodeDataProps } from "@vxengine/types/utilityNode";
import { useSplineManagerAPI } from "@vxengine/managers/SplineManager/store";
import { vxKeyframeNodeProps, vxSplineNodeProps } from "@vxengine/types/objectStore";

export const ObjectManagerDriver = () => {
  const handlePropertyValueChange = useTimelineEditorAPI(state => state.handlePropertyValueChange);
  const setKeyframeValue = useTimelineEditorAPI(state => state.setKeyframeValue)

  const firstSelectedObject = useObjectManagerAPI(state => state.selectedObjects[0]);
  const utilityTransfromAxis = useObjectManagerAPI(state => state.utilityTransformAxis)
  const transformMode = useObjectManagerAPI(state => state.transformMode);

  const firstObjectSelectedRef = firstSelectedObject?.ref.current;

  const transformControlsRef = useRef();

  const handleTransformChange = (e) => {
    if (!firstSelectedObject) return
    const type = firstSelectedObject.type;
    switch (type) {
      case "entity":
        handleEntiyChange(e)
        break;
      case "keyframeNode":
        handleKeyframeNodeChange();
        break;
      case "splineNode":
        handleSplineNodeChange();
    }
  };

  const handleEntiyChange = (e) => {
    const controls = e.target;
    const axis = controls.axis;

    if (firstObjectSelectedRef && axis) {
      const vxkey = firstSelectedObject.vxkey;

      // Map axis letters to property names
      const axisMap = {
        X: 'x',
        Y: 'y',
        Z: 'z',
      };

      // Determine which properties have changed based on the axis
      const axes = axis.split('');
      axes.forEach((axisLetter: string) => {
        const propertyAxis = axisMap[axisLetter];

        if (transformMode === 'translate' && propertyAxis) {
          handlePropertyValueChange(
            vxkey,
            `position.${propertyAxis}`,
            firstObjectSelectedRef.position[propertyAxis],
            false
          );
        } else if (transformMode === 'rotate' && propertyAxis) {
          handlePropertyValueChange(
            vxkey,
            `rotation.${propertyAxis}`,
            firstObjectSelectedRef.rotation[propertyAxis],
            false
          );
        } else if (transformMode === 'scale' && propertyAxis) {
          handlePropertyValueChange(
            vxkey,
            `scale.${propertyAxis}`,
            firstObjectSelectedRef.scale[propertyAxis],
            false
          );
        }
      });
    }
  }

  const handleKeyframeNodeChange = () => {
    const { data, ref } = (firstSelectedObject as vxKeyframeNodeProps);

    (data.keyframeKeys as string[])?.forEach(
      (keyframeKey) => {
        const keyframe = useTimelineEditorAPI.getState().keyframes[keyframeKey]
        // Update keyframe in the store from the the ref stored in the utility node 
        const newPosition = ref.current.position;
        const axis = getKeyframeAxis(keyframe.propertyPath);
        setKeyframeValue(keyframeKey, newPosition[axis]);

        useObjectPropertyAPI.getState().updateProperty(firstSelectedObject.vxkey, keyframe.propertyPath, newPosition[axis])
      }
    );

  }

  const handleSplineNodeChange = () => {
    const { index, splineKey, ref } = firstSelectedObject as vxSplineNodeProps;
    const newPosition = ref.current.position
    useSplineManagerAPI.getState().setSplineNodePosition(splineKey, index, newPosition)
  }

  // Node object must allow all axis movement and only translate
  // This set teh axis to XYZ and the transform mode to "translate"
  useEffect(() => {
    if (!firstSelectedObject) return
    if (
      firstSelectedObject.type === "keyframeNode" ||
      firstSelectedObject.type === "splineNode" 
    ) {
      if(!transformControlsRef.current) return
      
      useObjectManagerAPI.getState().setTransformMode("translate");
      useObjectManagerAPI.getState().setUtilityTransformAxis(['X', 'Y', 'Z']);
      const controls = transformControlsRef.current as any;

      controls.showX = true;
      controls.showY = true;
      controls.showZ = true;
    }
  }, [firstSelectedObject])

  return (
    <>
      {/* Object Transform Controls */}
      {firstObjectSelectedRef && (
        <TransformControls
          ref={transformControlsRef}
          object={firstObjectSelectedRef}
          mode={transformMode}
          onObjectChange={handleTransformChange}
        />
      )}
    </>
  );
};

const getKeyframeAxis = (keyframeKey: string): "x" | "y" | "z" => {
  const lowerCaseKey = keyframeKey.toLowerCase();
  if (lowerCaseKey.includes('.x')) return 'x';
  if (lowerCaseKey.includes('.y')) return 'y';
  if (lowerCaseKey.includes('.z')) return 'z';
  return 'x';
};