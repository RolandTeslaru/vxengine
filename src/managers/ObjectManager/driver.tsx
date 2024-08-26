import { TransformControls, useCamera } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import React from "react";
import { useEffect, useRef, useState } from "react";
import { useVXEngine } from "vxengine/engine";
import { useVXObjectStore } from "vxengine/store";
import { useObjectManagerStore, useObjectPropertyStore } from "./store";
import { shallow } from "zustand/shallow";

export const ObjectManagerDriver = () => {

  const { selectedObjectKeys, transformMode } = useObjectManagerStore(state => ({
    selectedObjectKeys: state.selectedObjectKeys,
    transformMode: state.transformMode
}), shallow);
  const firstSelectedObjectStored = useObjectManagerStore(state => state.selectedObjects[0], shallow);
  const firstObjectSelected: THREE.Object3D = firstSelectedObjectStored?.ref.current
  const updateProperty = useObjectPropertyStore(state => state.updateProperty, shallow)

  const handleTransformChange = () => {
    if (firstSelectedObjectStored && firstObjectSelected) {
      const vxkey = firstSelectedObjectStored.vxkey;

      if (firstObjectSelected.position) {
        updateProperty(vxkey, 'position.x', firstObjectSelected.position.x);
        updateProperty(vxkey, 'position.y', firstObjectSelected.position.y);
        updateProperty(vxkey, 'position.z', firstObjectSelected.position.z);
      }

      if (firstObjectSelected.rotation) {
        updateProperty(vxkey, 'rotation.x', firstObjectSelected.rotation.x);
        updateProperty(vxkey, 'rotation.y', firstObjectSelected.rotation.y);
        updateProperty(vxkey, 'rotation.z', firstObjectSelected.rotation.z);
      }

      if (firstObjectSelected.scale) {
        updateProperty(vxkey, 'scale.x', firstObjectSelected.scale.x);
        updateProperty(vxkey, 'scale.y', firstObjectSelected.scale.y);
        updateProperty(vxkey, 'scale.z', firstObjectSelected.scale.z);
      }
    }
  };

  return (
    <>
      {selectedObjectKeys.length === 1 &&
        <TransformControls
          object={firstObjectSelected}
          mode={transformMode}
          onChange={handleTransformChange}
        />
      }
    </>
  )
}




// Deprecated method of displaying object properties to the ui

const UiInterface = () => {
  const firstSelectedObject = useObjectManagerStore(state => state.selectedObjects[0]?.ref.current);
  const [objectPropsPanel, setObjectPropsPanel] = useState<HTMLElement | null>(null);

  const positionRefs = useRef<{ x: HTMLInputElement | null, y: HTMLInputElement | null, z: HTMLInputElement | null }>({ x: null, y: null, z: null });
  const scaleRefs = useRef<{ x: HTMLInputElement | null, y: HTMLInputElement | null, z: HTMLInputElement | null }>({ x: null, y: null, z: null });
  const rotationRefs = useRef<{ x: HTMLInputElement | null, y: HTMLInputElement | null, z: HTMLInputElement | null }>({ x: null, y: null, z: null });

  const previousValues = useRef({
    position: { x: 0, y: 0, z: 0 },
    scale: { x: 1, y: 1, z: 1 },
    rotation: { x: 0, y: 0, z: 0 }
  });

  useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      const element = document.getElementById("VXObjectManager_ObjectProperties");
      if (element) {
        setObjectPropsPanel(element);

        // Query and store references to the input fields with classnames x, y, z inside the element
        positionRefs.current = {
          x: element.querySelector('.PositionProp .x'),
          y: element.querySelector('.PositionProp .y'),
          z: element.querySelector('.PositionProp .z'),
        };

        scaleRefs.current = {
          x: element.querySelector('.ScaleProp .x'),
          y: element.querySelector('.ScaleProp .y'),
          z: element.querySelector('.ScaleProp .z'),
        };

        rotationRefs.current = {
          x: element.querySelector('.RotationProp .x'),
          y: element.querySelector('.RotationProp .y'),
          z: element.querySelector('.RotationProp .z'),
        };

        observer.disconnect();
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
    };
  }, [objectPropsPanel]);

  useFrame(() => {
    if (firstSelectedObject && objectPropsPanel) {
      // Check and update position fields only if values have changed
      const currentPosition = firstSelectedObject.position;
      if (currentPosition.x !== previousValues.current.position.x) {
        positionRefs.current.x.value = currentPosition.x.toFixed(2);
        previousValues.current.position.x = currentPosition.x;
      }
      if (currentPosition.y !== previousValues.current.position.y) {
        positionRefs.current.y!.value = currentPosition.y.toFixed(2);
        previousValues.current.position.y = currentPosition.y;
      }
      if (currentPosition.z !== previousValues.current.position.z) {
        positionRefs.current.z!.value = currentPosition.z.toFixed(2);
        previousValues.current.position.z = currentPosition.z;
      }

      // Check and update scale fields only if values have changed
      const currentScale = firstSelectedObject.scale;
      if (currentScale.x !== previousValues.current.scale.x) {
        scaleRefs.current.x!.value = currentScale.x.toFixed(2);
        previousValues.current.scale.x = currentScale.x;
      }
      if (currentScale.y !== previousValues.current.scale.y) {
        scaleRefs.current.y!.value = currentScale.y.toFixed(2);
        previousValues.current.scale.y = currentScale.y;
      }
      if (currentScale.z !== previousValues.current.scale.z) {
        scaleRefs.current.z!.value = currentScale.z.toFixed(2);
        previousValues.current.scale.z = currentScale.z;
      }

      // Check and update rotation fields only if values have changed
      const currentRotation = firstSelectedObject.rotation;
      if (currentRotation.x !== previousValues.current.rotation.x) {
        rotationRefs.current.x!.value = currentRotation.x.toFixed(2);
        previousValues.current.rotation.x = currentRotation.x;
      }
      if (currentRotation.y !== previousValues.current.rotation.y) {
        rotationRefs.current.y!.value = currentRotation.y.toFixed(2);
        previousValues.current.rotation.y = currentRotation.y;
      }
      if (currentRotation.z !== previousValues.current.rotation.z) {
        rotationRefs.current.z!.value = currentRotation.z.toFixed(2);
        previousValues.current.rotation.z = currentRotation.z;
      }
    }
  });


  return null
}