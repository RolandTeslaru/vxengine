import React from 'react'
import { withVX } from '../withVX';
import { VXElementParams } from '../types';
import { ThreeElements, useThree } from '@react-three/fiber';

const sceneParams: VXElementParams = [
    { type: "number", propertyPath: "environmentIntensity", title: "envIntensity" },
    { type: "number", propertyPath: "backgroundBlurriness", title: "bgBlurriness" },
    { type: "number", propertyPath: "backgroundIntensity", title: "bgIntensity" },
  ]

const BaseScene = ({ref, ...props}) => {
    const { scene } = useThree();
    ref.current = scene;
    
    // Apply properties from props to the scene
    React.useEffect(() => {
      if (props.environmentIntensity !== undefined) {
        scene.environmentIntensity = props.environmentIntensity;
      }
      if (props.backgroundBlurriness !== undefined) {
        scene.backgroundBlurriness = props.backgroundBlurriness;
      }
      if (props.backgroundIntensity !== undefined) {
        scene.backgroundIntensity = props.backgroundIntensity;
      }
      // Apply any other props to the scene as needed
    }, [scene, props]);
    
    return null;
  }

export const EditableScene = withVX<ThreeElements["scene"]>(BaseScene, {
    type: "entity",
    vxkey: "scene",
    name: "Scene",
    overrideNodeTreeParentKey: "global",
    icon: "Scene",
    params: sceneParams,
    modifyObjectTree: false,
    disabledParams: [
        "position",
        "rotation",
        "scale",
    ]
})