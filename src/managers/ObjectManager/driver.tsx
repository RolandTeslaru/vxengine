import { TransformControls, useCamera } from "@react-three/drei";
import React, { useMemo } from "react";
import { useEffect, useRef, useState } from "react";
import { updateProperty, useObjectManagerAPI, useObjectPropertyAPI } from "./stores/managerStore";
import { modifyPropertyValue, truncateToDecimals, useTimelineManagerAPI } from "../TimelineManager/store";
import { vxEntityProps, vxKeyframeNodeProps, vxObjectProps, vxSplineNodeProps } from "@vxengine/managers/ObjectManager/types/objectStore";
import { useRefStore } from "@vxengine/utils";
import { debounce, throttle } from "lodash";
import * as THREE from "three";
import { useObjectSettingsAPI } from "./stores/settingsStore";
import { TransformControls as TransfromControlsIMPL } from "three-stdlib";

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

const dispatchVirtualEntityChangeEvent = (e: any, vxobject: vxObjectProps) => {
  const virtualEntityChangeEvent = new CustomEvent('virtualEntityChange', {
    detail: { transformation: e, object: vxobject }
  });

  document.dispatchEvent(virtualEntityChangeEvent as any);
}

/**
 * ObjectManagerDriver Component
 *
 * Description:
 * This component manages transformations (translate, rotate, scale) for objects in a R3F scene
 * using `TransformControls` from drei. It handles updates to the selected object's properties, supports debounced
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
  const vxobject = useObjectManagerAPI(state => state.selectedObjects[0]);
  const transformSpace = useObjectManagerAPI(state => state.transformSpace)
  const transformMode = useObjectManagerAPI(state => state.transformMode);
  const setTransformMode = useObjectManagerAPI(state => state.setTransformMode)
  const transformControlsRef = useRefStore(state => state.transformControlsRef)

  const vxkey = vxobject?.vxkey;
  const vxObjectRef: THREE.Object3D = vxobject?.ref?.current;
  const type = vxObjectRef?.type
  const isUsingSplinePath = useObjectSettingsAPI(state => state.settings[vxkey]?.useSplinePath);

  const setSplineNodePosition = useTimelineManagerAPI(state => state.setSplineNodePosition);

  const isValid =
    type === "Mesh" ||
    type === "Group" ||
    type === "PerspectiveCamera" ||
    type === "CubeCamera" ||
    type === "Environment"

  const isTransformDisabled =
    isUsingSplinePath ||
    vxobject?.disabledParams?.includes("position") ||
    !isValid;

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
    X: debounce((vxkey, propertyPath, newValue) => modifyPropertyValue("press", vxkey, propertyPath, newValue, false), 300, { leading: false, trailing: true }),
    Y: debounce((vxkey, propertyPath, newValue) => modifyPropertyValue("press", vxkey, propertyPath, newValue, false), 300, { leading: false, trailing: true }),
    Z: debounce((vxkey, propertyPath, newValue) => modifyPropertyValue("press", vxkey, propertyPath, newValue, false), 300, { leading: false, trailing: true }),
  }), []);

  // Cleanup debounced functions on unmount
  useEffect(() => {
    return () => {
      Object.values(debouncedPropertyValueChangeFunctions).forEach(
        (debouncedFn) => debouncedFn.cancel()
      );
    };
  }, [debouncedPropertyValueChangeFunctions]);

  const handleTransformChange = (e) => {
    if (!vxobject) return
    const type = vxobject.type;
    switch (type) {
      case "entity":
        handleEntityChange(e)
        break;
      case "virtualEntity": {
        handleEntityChange(e)
        dispatchVirtualEntityChangeEvent(e, vxobject);
        break;
      }
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
          newValue = vxObjectRef.position[propertyAxis];
          break;
        case 'rotate':
          newValue = vxObjectRef.rotation[propertyAxis]
          break;
        case 'scale':
          newValue = vxObjectRef.scale[propertyAxis]
          break;
      }
      // Call the appropriate debounced function
      debouncedPropertyValueChangeFunctions[axisLetter]?.(
        vxkey,
        propertyPath,
        newValue,
      );

      updateProperty(vxkey, propertyPath, newValue)
    });
  }

  // 
  //  Handle ENTITIES
  // 
  const handleEntityChange = (e) => {
    if (!vxObjectRef)
      return
    const controls = e.target;
    const axis = controls.axis;
    if (!axis) return

    const axes = axis.split('');

    if (transformSpace === "world") {
      handleSpaceTransform(axes, vxkey)
    }
    else if (transformSpace === "local") {
      switch (transformMode) {
        case 'translate': {
          currentProps.current.position = vxObjectRef.position.clone()
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
          vxObjectRef.getWorldQuaternion(currentProps.current.rotation);

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
          vxObjectRef.getWorldScale(currentProps.current.scale);

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
  //  Handle SPLINE Nodes 
  // 
  const handleSplineNodeChange = () => {
    const { index, splineKey, ref } = vxobject as vxSplineNodeProps;
    const newPosition = ref.current.position;
    setSplineNodePosition(splineKey, index, newPosition)

    const vxNodeKey = `${splineKey}.node${index}`

    updateProperty(vxNodeKey, 'position.x', newPosition.x)
    updateProperty(vxNodeKey, 'position.y', newPosition.y)
    updateProperty(vxNodeKey, 'position.z', newPosition.z)
  }



  // Set the Axis of the controls when a node is selected
  useEffect(() => {
    if (!vxobject) return

    const controls = transformControlsRef?.current as any;
    if (!controls) return

    setTransformMode("translate");

    // We need to store initial values when dealing with local space, 
    // because we need to compare them when the entity is changed
    if (transformSpace === "local") {
      vxObjectRef.getWorldPosition(intialProps.current.position);
      vxObjectRef.getWorldQuaternion(intialProps.current.rotation);
      vxObjectRef.getWorldScale(intialProps.current.scale);
    }

    if (vxobject.type === "splineNode") {
      controls.showX = true;
      controls.showY = true;
      controls.showZ = true;
    }
    else if (vxobject.type === "keyframeNode") {
      const axis = vxobject.axis
      controls.showX = axis.includes('X')
      controls.showY = axis.includes('Y')
      controls.showZ = axis.includes('Z')
    }
  }, [vxobject])


  useEffect(() => {
    const controlsImpl = transformControlsRef?.current
    if (!controlsImpl) return

    const handleDraggingChanged = (event: any) => {
      if (event.value) {
        console.log('Transform started')
      } else {
        console.log('Transform ended')
      }
    }

    // @ts-expect-error
    controlsImpl.addEventListener('dragging-changed', handleDraggingChanged)

    return () => {
      // @ts-expect-error
      controlsImpl.removeEventListener('dragging-changed', handleDraggingChanged)
    }
  }, [!isTransformDisabled])

  return (
    <>
      {/* Object Transform Controls */}
      {vxObjectRef && !isTransformDisabled && (
        <TransformControls
          ref={transformControlsRef}
          object={vxObjectRef}
          mode={transformMode}
          onObjectChange={handleTransformChange}
          space={transformSpace}
        />
      )}
    </>
  );
};

const handleSplineNodeChange = (
  vxSplineNode: vxSplineNodeProps
) => {
  const { index, splineKey, ref } = vxSplineNode;
  const vxNodeKey = `${splineKey}.node${index}`;
  const newPosition = ref.current.position;

  updateProperty(vxNodeKey, 'position.x', newPosition.x)
  updateProperty(vxNodeKey, 'position.y', newPosition.y)
  updateProperty(vxNodeKey, 'position.z', newPosition.z)

  const setSplineNodePosition = useTimelineManagerAPI.getState().setSplineNodePosition;
  setSplineNodePosition(splineKey, index, newPosition)
}

