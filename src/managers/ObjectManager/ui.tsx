// VXEngine - VEXR Labs' proprietary toolset for React Three Fiber
// (c) 2024 VEXR Labs. All Rights Reserved.
// See the LICENSE file in the root directory of this source tree for licensing information.

"use client"

import React, { useEffect, useRef, useState } from 'react'
import { TransformProperties } from './components/TransformProperties'
import { GeometryProperties } from './components/GeometryProperties'
import MaterialProperties from './components/MaterialProperties'
import NodeTransformProperties from './components/NodeTransformProperties'
import { vxObjectProps } from '@vxengine/managers/ObjectManager/types/objectStore'
import { MenubarItem, MenubarSub, MenubarSubContent, MenubarSubTrigger } from '@vxengine/components/shadcn/menubar'
import { useUIManagerAPI } from '../UIManager/store'
import { DIALOG_setTransformMode, DIALOG_setTransformSpace } from './components/dialogs'
import SplineProperties from './components/SplineProperties'
import SplineNodePanel from './components/SplineNodePanel'
import ObjectInfoPanel from './components/ObjectInfoPanel'

const ObjectPropertiesConfig = {
  entity: [
      TransformProperties, 
      GeometryProperties, 
      MaterialProperties,
  ],
  virtualEntity: [
    TransformProperties, 
    GeometryProperties, 
    MaterialProperties
  ],
  spline: [SplineProperties],
  splineNode: [SplineNodePanel],
  keyframeNode: [NodeTransformProperties],
};

export const ObjectPropertiesPanel = ({ vxobject }: {vxobject: vxObjectProps}) => {
  if (!vxobject) return null;

  const components = ObjectPropertiesConfig[vxobject.type] || [];
  return (
    <>
      {components.map((Component, index) => 
        <Component key={index} vxobject={vxobject}/>)
      }
    </>
  );
};



//
//  S U B M E N U S
//



export const ObjectManagerSubMenu = () => {
  const pushDialog = useUIManagerAPI(state => state.pushDialog)

  return (
    <MenubarSub>
      <MenubarSubTrigger>Object Manager API</MenubarSubTrigger>
      <MenubarSubContent>
        <MenubarItem onClick={() => pushDialog({content: <DIALOG_setTransformMode/>, type:"normal"})}>set Transform Mode</MenubarItem>
        <MenubarItem onClick={() => pushDialog({content: <DIALOG_setTransformSpace/>, type: "normal"})}>set Transform Space</MenubarItem>
        <MenubarItem>select Objects</MenubarItem>
      </MenubarSubContent>
    </MenubarSub>
  )
}

export const ObjectSettingsSubMenu = () => {
  const pushDialog = useUIManagerAPI(state => state.pushDialog)
  return (
    <MenubarSub>
      <MenubarSubTrigger>Object Settings API</MenubarSubTrigger>
      <MenubarSubContent>
        <MenubarItem>set Setting</MenubarItem>
        <MenubarItem>toggle Setting</MenubarItem>
        <MenubarItem>set Additional Setting</MenubarItem>
        <MenubarItem>toggle Additional Setting</MenubarItem>
      </MenubarSubContent>
    </MenubarSub>
  )
}

export const ObjectPropertySubMenu = () => {
  const pushDialog = useUIManagerAPI(state => state.pushDialog)
  return (
    <MenubarSub>
      <MenubarSubTrigger>Object Property API</MenubarSubTrigger>
      <MenubarSubContent>
        <MenubarItem>update Property</MenubarItem>
      </MenubarSubContent>
    </MenubarSub>
  )
}