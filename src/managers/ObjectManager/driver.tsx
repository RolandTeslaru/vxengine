import { TransformControls, useCamera } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import React from "react";
import { useEffect, useRef, useState } from "react";
import { useVXEngine } from "@vxengine/engine";
import { useObjectManagerAPI, useObjectPropertyAPI } from "./store";
import { shallow } from "zustand/shallow";
import { useTimelineEditorAPI } from "../TimelineManager/store";
import * as THREE from "three"
import { KeyframeNodeDataProps } from "@vxengine/types/utilityNode";
import { useSplineManagerAPI } from "@vxengine/managers/SplineManager/store";
import { extractSplineKeyFromNodeKey } from "@vxengine/managers/SplineManager/utils";


export const ObjectManagerDriver = () => {
  const handlePropertyValueChange = useTimelineEditorAPI(state => state.handlePropertyValueChange);
  const setKeyframeValue = useTimelineEditorAPI(state => state.setKeyframeValue)

  const selectedUtilityNode = useObjectManagerAPI(state => state.selectedUtilityNode)
  const firstSelectedObjectStored = useObjectManagerAPI(state => state.selectedObjects[0]);
  const utilityTransfromAxis = useObjectManagerAPI(state => state.utilityTransformAxis)
  const transformMode = useObjectManagerAPI(state => state.transformMode);


  const firstObjectSelected = firstSelectedObjectStored?.ref.current;

  const transformControlsRef = useRef();

  const handleTransformChange = (e) => {
    const controls = e.target; 
    const axis = controls.axis; 

    if (firstSelectedObjectStored && firstObjectSelected && axis) {
      const vxkey = firstSelectedObjectStored.vxkey;

      // Map axis letters to property names
      const axisMap = {
        X: 'x',
        Y: 'y',
        Z: 'z',
      };

      // Determine which properties have changed based on the axis
      const axes = axis.split('');
      axes.forEach((axisLetter) => {
        const propertyAxis = axisMap[axisLetter];

        if (transformMode === 'translate' && propertyAxis) {
          handlePropertyValueChange(
            vxkey,
            `position.${propertyAxis}`,
            firstObjectSelected.position[propertyAxis],
            false
          );
        } else if (transformMode === 'rotate' && propertyAxis) {
          handlePropertyValueChange(
            vxkey,
            `rotation.${propertyAxis}`,
            firstObjectSelected.rotation[propertyAxis],
            false
          );
        } else if (transformMode === 'scale' && propertyAxis) {
          handlePropertyValueChange(
            vxkey,
            `scale.${propertyAxis}`,
            firstObjectSelected.scale[propertyAxis],
            false
          );
        }
      });
    }
  };

  const getKeyframeAxis = (keyframeKey: string): "x" | "y" | "z" => {
    const lowerCaseKey = keyframeKey.toLowerCase();
    if (lowerCaseKey.includes('.x')) return 'x';
    if (lowerCaseKey.includes('.y')) return 'y';
    if (lowerCaseKey.includes('.z')) return 'z';
    return 'x';
  };

  const handleUtilityKeyframeNodeChange = () => {
    if(selectedUtilityNode.type === "keyframe") {
      const { data, ref } = selectedUtilityNode;
        (data as KeyframeNodeDataProps)?.keyframeKeys?.forEach((keyframeKey) => {
          const keyframe = useTimelineEditorAPI.getState().keyframes[keyframeKey]
          // Update keyframe in the store from the the ref stored in the utility node 
          const newPosition = ref.position;
          const axis = getKeyframeAxis(keyframe.propertyPath); 
          setKeyframeValue(keyframeKey, newPosition[axis]);
        });
    }
  }

  const handleUtilitySplineNodeChange = () => {
    if(selectedUtilityNode.type === "spline"){
      const { index, splineKey, ref } = selectedUtilityNode;
      const newPosition = ref.position
      useSplineManagerAPI.getState().setSplineNodePosition(splineKey, index, newPosition)
    }
  }

  const handleUtilityObjectChange = () => {
    switch(selectedUtilityNode?.type) {
      case "keyframe":
        handleUtilityKeyframeNodeChange();
        break;
      case "spline":
        handleUtilitySplineNodeChange();
        break;
    }
  };

  const utilityTrasnformControlsRef = useRef();

  useEffect(() => {
    if (!selectedUtilityNode || !utilityTrasnformControlsRef.current) return;
    const controls = utilityTrasnformControlsRef.current as any;
  
    controls.showX = utilityTransfromAxis.includes('X');
    controls.showY = utilityTransfromAxis.includes('Y');
    controls.showZ = utilityTransfromAxis.includes('Z');
  
    controls.update();
  }, [selectedUtilityNode]);

  return (
    <>
      {/* Object Transform Controls */}
      {firstObjectSelected && !selectedUtilityNode && (
        <TransformControls
          ref={transformControlsRef}
          object={firstObjectSelected}
          mode={transformMode}
          onObjectChange={handleTransformChange}
        />
      )}

      {/* Utility Nodes Transform Controls */}

      {selectedUtilityNode && (
        <TransformControls
          ref={utilityTrasnformControlsRef}
          object={selectedUtilityNode.ref}
          mode="translate"
          onObjectChange={handleUtilityObjectChange}
          axis='Y'
        />
      )}

    </>
  );
};
