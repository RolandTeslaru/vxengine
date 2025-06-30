// VXEngine - VEXR Labs' proprietary toolset for React Three Fiber
// (c) 2024 VEXR Labs. All Rights Reserved.
// See the LICENSE file in the root directory of this source tree for licensing information.

import React, { useEffect } from 'react'
import { TransformParams } from './Panels/TransformParams'
import { GeometryParams } from './Panels/GeometryParams'
import NodeTransformParams from './Panels/NodeTransformParams'
import { vxObjectProps } from '@vxengine/managers/ObjectManager/types/objectStore'
import { MenubarItem, MenubarSub, MenubarSubContent, MenubarSubTrigger } from '@vxengine/components/shadcn/menubar'
import { useUIManagerAPI } from '../UIManager/store'
import { DIALOG_setTransformMode, DIALOG_setTransformSpace } from './components/dialogs'
import SplineParams from './Panels/SplineParams'
import SplineNodeParams from './Panels/SplineNodeParams'
import ParamList from './Panels/ParamList'
import MaterialParamsPanel from './Panels/MaterialParamsPanel'
import { ObjectManagerService } from './service'
import { useObjectManagerAPI } from './stores/managerStore'
import { useVXObjectStore } from './stores/objectStore'

export const ObjectManagerUI = () => {

  useEffect(() => {
    const unsubscribe = useVXObjectStore.subscribe((state, prevState) => {
      if(state.objects != prevState.objects){
        console.log("Difrente")
        Object.entries(state.objects).forEach(([string, vxobject]) => {

          useObjectManagerAPI.getState().addToTree(vxobject)
        })
      }
    })
    
    return () => unsubscribe();
  })

  return null
}

const ObjectParamsConfig = {
  entity: [
      TransformParams, 
      ParamList,
      MaterialParamsPanel,
      GeometryParams, 
  ],
  virtualEntity: [
    TransformParams, 
    ParamList,
    MaterialParamsPanel,
    GeometryParams, 
  ],
  spline: [
      SplineParams, 
      ParamList
  ],
  splineNode: [
    SplineNodeParams, 
    ParamList
  ],
  keyframeNode: [
    NodeTransformParams, 
    ParamList
  ],
  effect: [
    ParamList,
  ],
  custom: [
    ParamList
  ]
};

export const ObjectParamsPanel = ({ vxobject }: {vxobject: vxObjectProps}) => {
  if (!vxobject) return null;

  const refObject = vxobject.ref?.current;
  if(!refObject)
    return null

  const components = (ObjectParamsConfig[vxobject.type] || []).filter((Component) => {
    if (Component === MaterialParamsPanel && (!refObject || !refObject.material)) {
      return false;
    }
    if(Component === GeometryParams && (!refObject || !refObject?.geometry?.parameters))
      return false;
    return true;
  });

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