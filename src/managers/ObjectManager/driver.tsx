'use client'

import { TransformControls, useCamera } from "@react-three/drei";
import React from "react";
import { useEffect, useRef, useState } from "react";
import { useObjectManagerAPI, useObjectPropertyAPI } from "./store";
import { useTimelineEditorAPI } from "../TimelineManager/store";
import { useSplineManagerAPI } from "@vxengine/managers/SplineManager/store";
import { vxKeyframeNodeProps, vxSplineNodeProps } from "@vxengine/types/objectStore";

export const ObjectManagerDriver = () => {
  const handlePropertyValueChange = useTimelineEditorAPI(state => state.handlePropertyValueChange);
  const setKeyframeValue = useTimelineEditorAPI(state => state.setKeyframeValue)

  const firstSelectedObject = useObjectManagerAPI(state => state.selectedObjects[0]);
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
    if (!firstObjectSelectedRef) return
    const controls = e.target;
    const axis = controls.axis;

    if (!axis) return

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
      if (!propertyAxis) return;

      switch (transformMode) {
        case 'translate': {
          const newValue = firstObjectSelectedRef.position[propertyAxis];
          handlePropertyValueChange(
            vxkey,
            `position.${propertyAxis}`,
            newValue,
            false
          );
          break;
        }

        case 'rotate': {
          const newValue = firstObjectSelectedRef.rotation[propertyAxis]
          handlePropertyValueChange(
            vxkey,
            `rotation.${propertyAxis}`,
            newValue,
            false
          );
          break;
        }

        case 'scale': {
          const newValue = firstObjectSelectedRef.scale[propertyAxis]
          handlePropertyValueChange(
            vxkey,
            `scale.${propertyAxis}`,
            newValue,
            false
          );
          break;
        }
      }

    });
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

        useObjectPropertyAPI.getState().updateProperty(
          firstSelectedObject.vxkey,
          keyframe.propertyPath,
          newPosition[axis]
        )
      }
    );

  }

  const handleSplineNodeChange = () => {
    const { index, splineKey, ref } = firstSelectedObject as vxSplineNodeProps;
    const newPosition = ref.current.position
    useSplineManagerAPI.getState().setSplineNodePosition(splineKey, index, newPosition)
  }

  // Set the Axis of the controls when a node is selected
  useEffect(() => {
    const controls = transformControlsRef.current as any;
    if (!firstSelectedObject) return
    if (!controls) return

    useObjectManagerAPI.getState().setTransformMode("translate");

    if ( firstSelectedObject.type === "splineNode" ) {
      controls.showX = true;
      controls.showY = true;
      controls.showZ = true;
    }
    else if(firstSelectedObject.type === "keyframeNode"){
      const axis = firstSelectedObject.axis
      controls.showX = axis.includes('X')
      controls.showY = axis.includes('Y')
      controls.showZ = axis.includes('Z')
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