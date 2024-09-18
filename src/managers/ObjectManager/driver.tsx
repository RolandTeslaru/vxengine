import { TransformControls, useCamera } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import React from "react";
import { useEffect, useRef, useState } from "react";
import { useVXEngine } from "vxengine/engine";
import { useObjectManagerStore, useObjectPropertyStore } from "./store";
import { shallow } from "zustand/shallow";
import { useTimelineEditorAPI } from "../TimelineManager/store";
import * as THREE from "three"


export const ObjectManagerDriver = () => {
  const { selectedObjectKeys, transformMode } = useObjectManagerStore(
    (state) => ({
      selectedObjectKeys: state.selectedObjectKeys,
      transformMode: state.transformMode,
    }),
    shallow
  );

  const firstSelectedObjectStored = useObjectManagerStore(
    (state) => state.selectedObjects[0],
    shallow
  );
  const firstObjectSelected = firstSelectedObjectStored?.ref.current;
  const handlePropertyValueChange = useTimelineEditorAPI(
    (state) => state.handlePropertyValueChange,
    shallow
  );

  // Reference to the TransformControls instance
  const transformControlsRef = useRef();

  const handleTransformChange = (e) => {
    const controls = e.target; // TransformControls instance
    const axis = controls.axis; // 'X', 'Y', 'Z', 'XY', etc.

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

  const selectedUtilityNodeKey = useObjectManagerStore(state => state.selectedUtilityNodeKey)
  const selectedUtilityNode = useObjectManagerStore(state => state.utilityNodes[selectedUtilityNodeKey])
  const setKeyframeValue = useTimelineEditorAPI(state => state.setKeyframeValue)

  const handleUtilityObjectChange = () => {
    
    if (selectedUtilityNode?.type === "keyframe") {
      const { data, ref } = selectedUtilityNode;

      data?.keyframeKeys?.forEach((keyframeKey) => {
        const keyframe = useTimelineEditorAPI.getState().keyframes[keyframeKey]
        const position = ref.position;
        const axis = getKeyframeAxis(keyframe.propertyPath); 
        setKeyframeValue(keyframeKey, position[axis]);
      });

    }
  };

  const utilityTrasnformControlsRef = useRef();

  const utilityTransfromAxis = useObjectManagerStore(state => state.utilityTransformAxis)

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
