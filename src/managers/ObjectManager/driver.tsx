'use client'

import { TransformControls, useCamera } from "@react-three/drei";
import React, { useMemo } from "react";
import { useEffect, useRef, useState } from "react";
import { useObjectManagerAPI, useObjectPropertyAPI } from "./stores/managerStore";
import { useTimelineEditorAPI } from "../TimelineManager/store";
import { useSplineManagerAPI } from "@vxengine/managers/SplineManager/store";
import { vxKeyframeNodeProps, vxObjectProps, vxSplineNodeProps } from "@vxengine/managers/ObjectManager/types/objectStore";
import { useRefStore } from "@vxengine/utils";
import { debounce, throttle } from "lodash";
import * as THREE from "three";

const AXES = ['x', 'y', 'z'];

const axisMap = {
  X: 'x',
  Y: 'y',
  Z: 'z',
};

const transformMap = {
  translate: "position",
  rotate: "rotation",
  scale: "scale"
}

const dispatchVirtualEntityChangeEvent = (e: any, firstSelectedObject: vxObjectProps) => {
  const virtualEntityChangeEvent = new CustomEvent('virtualEntityChange', {
    detail: { transformation: e, object: firstSelectedObject }
  });

  document.dispatchEvent(virtualEntityChangeEvent as any);
}


const getKeyframeAxis = (keyframeKey: string): "x" | "y" | "z" => {
  const lowerCaseKey = keyframeKey.toLowerCase();
  if (lowerCaseKey.includes('.x')) return 'x';
  if (lowerCaseKey.includes('.y')) return 'y';
  if (lowerCaseKey.includes('.z')) return 'z';
  return 'x';
};

/**
 * ObjectManagerDriver Component
 *
 * Description:
 * This component manages transformations (translate, rotate, scale) for objects in a Three.js scene 
 * using `TransformControls`. It handles updates to the selected object's properties, supports debounced
 * updates for performance, and manages specific logic for different types of objects, such as 
 * entities, keyframe nodes, and spline nodes.
 *
 * How it works:
 * 1. **State Initialization**: Access relevant state and APIs from Zustand stores (object manager, timeline editor, etc.).
 * 2. **Debounced Updates**: Use `lodash.debounce` to batch property updates for smoother performance.
 * 3. **Transform Change Handling**: Listen for changes via `TransformControls` and update object properties accordingly.
 * 4. **Type-Specific Logic**:
 *    - **Entities**: Update position, rotation, or scale properties.
 *    - **Virtual Entities**: Same as entities, but also dispatch a custom DOM event.
 *    - **Keyframe Nodes**: Update keyframe values and synchronize them with the timeline store.
 *    - **Spline Nodes**: Update node positions in the spline manager.
 * 5. **Axis Configuration**: Dynamically configure which transformation axes (X, Y, Z) are visible based on the object type.
 * 6. **TransformControls Integration**: Attach `TransformControls` to the selected object and bind event handlers.
 * 7. **Lifecycle Management**: Clean up debounced functions on component unmount and ensure proper state cleanup.
 */

export const ObjectManagerDriver = () => {
  const handlePropertyValueChange = useTimelineEditorAPI(state => state.handlePropertyValueChange)

  const firstSelectedObject = useObjectManagerAPI(state => state.selectedObjects[0]);
  const transformMode = useObjectManagerAPI(state => state.transformMode);
  const transformSpace = useObjectManagerAPI(state => state.transformSpace)

  const firstObjectSelectedRef: THREE.Object3D = firstSelectedObject?.ref.current;
  const type = firstObjectSelectedRef?.type
  const isValid = type === "Mesh" || type === "Group" || type === "PerspectiveCamera" || type === "CubeCamera";

  const transformControlsRef = useRefStore(state => state.transformControlsRef)

  const intialProps = useRef({
    position: new THREE.Vector3,
    rotation: new THREE.Quaternion,
    scale: new THREE.Vector3
  })

  const currentProps = useRef({
    position: new THREE.Vector3,
    rotation: new THREE.Quaternion,
    scale: new THREE.Vector3
  })

  // Create debounced functions for each axis using useMemo
  const debouncedPropertyValueChangeFunctions = useMemo(() => ({
    X: debounce((vxkey, propertyPath, newValue) => handlePropertyValueChange(vxkey, propertyPath, newValue, false), 300, { leading: false, trailing: true }),
    Y: debounce((vxkey, propertyPath, newValue) => handlePropertyValueChange(vxkey, propertyPath, newValue, false), 300, { leading: false, trailing: true }),
    Z: debounce((vxkey, propertyPath, newValue) => handlePropertyValueChange(vxkey, propertyPath, newValue, false), 300, { leading: false, trailing: true }),
  }), [handlePropertyValueChange]);

  // Cleanup debounced functions on unmount
  useEffect(() => {
    return () => {
      Object.values(debouncedPropertyValueChangeFunctions).forEach(
        (debouncedFn) => debouncedFn.cancel()
      );
    };
  }, [debouncedPropertyValueChangeFunctions]);

  const handleTransformChange = (e) => {
    if (!firstSelectedObject) return
    const type = firstSelectedObject.type;
    switch (type) {
      case "entity":
        handleEntiyChange(e)
        break;
      case "virtualEntity": {
        handleEntiyChange(e)
        dispatchVirtualEntityChangeEvent(e, firstSelectedObject);
        break;
      }
      case "keyframeNode":
        handleKeyframeNodeChange();
        break;
      case "splineNode":
        handleSplineNodeChange();
    }
  };


  const handleSpaceTransform = (axes: string[], vxkey: string,) => {
    axes.forEach((axisLetter: string) => {
      const propertyAxis = axisMap[axisLetter];
      if (!propertyAxis) return;

      const propertyPath = `${transformMap[transformMode]}.${propertyAxis}`;
      let newValue;

      switch (transformMode) {
        case 'translate':
          newValue = firstObjectSelectedRef.position[propertyAxis];
          break;
        case 'rotate':
          newValue = firstObjectSelectedRef.rotation[propertyAxis]
          break;
        case 'scale':
          newValue = firstObjectSelectedRef.scale[propertyAxis]
          break;
      }
      // Call the appropriate debounced function
      debouncedPropertyValueChangeFunctions[axisLetter]?.(
        vxkey,
        propertyPath,
        newValue
      );
    });
  }

  // 
  //  Handle ENTITIES
  // 
  const handleEntiyChange = (e) => {
    const firstObjectSelectedRef = firstSelectedObject?.ref.current as THREE.Object3D;
    if (!firstObjectSelectedRef)
      return
    const controls = e.target;
    const axis = controls.axis;
    if (!axis) return

    const vxkey = firstSelectedObject?.vxkey;

    const axes = axis.split('');

    if (transformSpace === "world") {
      handleSpaceTransform(axes, vxkey)
    }
    else if (transformSpace === "local") {

      switch (transformMode) {
        case 'translate': {
          currentProps.current.position = firstObjectSelectedRef.position.clone()
          Array('x', 'y', 'z').forEach(axisLetter => {

            const propertyPath = `${transformMap[transformMode]}.${axisLetter}`;
            const newValue = currentProps.current.position[axisLetter]
            const oldValue = intialProps.current.position[axisLetter];

            if (oldValue !== newValue) {
              debouncedPropertyValueChangeFunctions[axisLetter.toUpperCase()]?.(
                vxkey,
                propertyPath,
                newValue
              );
              intialProps.current.position[axisLetter] = newValue
            }
          })

          break;
        }
        case 'rotate': {
          // Get the current world quaternion
          firstObjectSelectedRef.getWorldQuaternion(currentProps.current.rotation);

          // Convert both initial and current quaternions to Euler angles for comparison
          const initialEuler = new THREE.Euler().setFromQuaternion(intialProps.current.rotation, 'XYZ');
          const currentEuler = new THREE.Euler().setFromQuaternion(currentProps.current.rotation, 'XYZ');

          ['x', 'y', 'z'].forEach(axisLetter => {
            const propertyPath = `${transformMap[transformMode]}.${axisLetter}`;
            const newValue = currentEuler[axisLetter];
            const oldValue = initialEuler[axisLetter];

            if (oldValue !== newValue) {
              // Call debounced function with new rotation value
              debouncedPropertyValueChangeFunctions[axisLetter.toUpperCase()]?.(
                vxkey,
                propertyPath,
                newValue
              );
              // Update the initial Euler to the new value so future comparisons are accurate
              initialEuler[axisLetter] = newValue;
            }
          });

          // After updating, convert `initialEuler` back into a quaternion and store it as the new baseline
          intialProps.current.rotation.setFromEuler(initialEuler);
          break;
        }

        case 'scale': {
          // Get the current world scale
          firstObjectSelectedRef.getWorldScale(currentProps.current.scale);

          ['x', 'y', 'z'].forEach(axisLetter => {
            const propertyPath = `${transformMap[transformMode]}.${axisLetter}`;
            const newValue = currentProps.current.scale[axisLetter];
            const oldValue = intialProps.current.scale[axisLetter];

            if (oldValue !== newValue) {
              // Call debounced function with new scale value
              debouncedPropertyValueChangeFunctions[axisLetter.toUpperCase()]?.(
                vxkey,
                propertyPath,
                newValue
              );
              // Update the initial scale to the new value so future comparisons are accurate
              intialProps.current.scale[axisLetter] = newValue;
            }
          });
          break;
        }
      }

    }
  }

  // 
  //  Handle KEYFRAME Nodes 
  // 
  const handleKeyframeNodeChange = throttle(() => {
    const { data, ref } = (firstSelectedObject as vxKeyframeNodeProps);
    const setKeyframeValue = useTimelineEditorAPI.getState().setKeyframeValue;

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
  }, 300)

  // 
  //  Handle SPLINE Nodes 
  // 
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

    // We need to store initial values when dealing with local space, 
    // because we need to compare them when the entity is changed
    if (transformSpace === "local") {
      firstObjectSelectedRef.getWorldPosition(intialProps.current.position);
      firstObjectSelectedRef.getWorldQuaternion(intialProps.current.rotation);
      firstObjectSelectedRef.getWorldScale(intialProps.current.scale);
    }

    if (firstSelectedObject.type === "splineNode") {
      controls.showX = true;
      controls.showY = true;
      controls.showZ = true;
    }
    else if (firstSelectedObject.type === "keyframeNode") {
      const axis = firstSelectedObject.axis
      controls.showX = axis.includes('X')
      controls.showY = axis.includes('Y')
      controls.showZ = axis.includes('Z')
    }
  }, [firstSelectedObject])

  return (
    <>
      {/* Object Transform Controls */}
      {firstObjectSelectedRef && isValid && (
        <TransformControls
          ref={transformControlsRef}
          object={firstObjectSelectedRef}
          mode={transformMode}
          onObjectChange={handleTransformChange}
          space={transformSpace}
        />
      )}
    </>
  );
};
