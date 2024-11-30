// VXEngine - VEXR Labs' proprietary toolset for React Three Fiber
// (c) 2024 VEXR Labs. All Rights Reserved.
// See the LICENSE file in the root directory of this source tree for licensing information.

"use client"

import React, { useEffect, useRef, useState } from 'react'
import * as THREE from "three"
import { createPortal } from 'react-dom'
import Move from "@geist-ui/icons/move"
import RefreshCcw from "@geist-ui/icons/refreshCcw"
import { motion, AnimatePresence } from "framer-motion"
import { useObjectManagerAPI, useObjectPropertyAPI } from './stores/managerStore'
import { TransformProperties } from './components/TransformProperties'
import { GeometryProperties } from './components/GeometryProperties'
import ObjectList from './components/ObjectList'
import MaterialProperties from './components/MaterialProperties'
import NodeTransformProperties from './components/NodeTransformProperties'
import { vxObjectProps } from '@vxengine/managers/ObjectManager/types/objectStore'
import Globe from '@geist-ui/icons/globe'
import { MenubarItem, MenubarSub, MenubarSubContent, MenubarSubTrigger } from '@vxengine/components/shadcn/menubar'
import { useUIManagerAPI } from '../UIManager/store'
import { DIALOG_setTransformMode, DIALOG_setTransformSpace } from './components/dialogs'


export const ObjectManagerUI = () => {
  const listMountOnId = 'VXEngineLeftPanel'
  const propsMountOnId = 'VXEngineRightPanel'

  const [listParent, setListParent] = useState(null);
  const [propsParent, setPropsParent] = useState(null);

  // Object list mounter
  useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      const element = document.getElementById(listMountOnId);
      if (element) {
        console.log(`VXObjectManager: Mounting ObjectList to id = ${listMountOnId}`)
        setListParent(element)
        observer.disconnect();
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
    };
  }, [listMountOnId])

  // Object props mounter
  useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      const element = document.getElementById(propsMountOnId);
      if (element) {
        console.log(`VXObjectManager: Mounting ObjectProps to id = ${propsMountOnId}`)
        setPropsParent(element)
        observer.disconnect();
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
    };
  }, [listMountOnId])


  return (<>
    {listParent && createPortal(
      <ObjectList />,
      listParent
    )}
  </>)
}

export const ObjectTransformControls = () => {
  const transformMode = useObjectManagerAPI(state => state.transformMode)
  const setTransformMode = useObjectManagerAPI(state => state.setTransformMode)
  const selectedObjectType = useObjectManagerAPI(state => state.selectedObjects[0]?.type)
  const transformSpace = useObjectManagerAPI(state => state.transformSpace);
  const setTransformSpace = useObjectManagerAPI(state => state.setTransformSpace);

  const isEntity = selectedObjectType === "entity" || selectedObjectType === "virtualEntity"

  const handleSpaceChange = () => {
    if (transformSpace === "local")
      setTransformSpace("world")
    else if (transformSpace === "world")
      setTransformSpace("local")
  }

  return (
    <AnimatePresence>
      {isEntity && (
        <motion.div
          className='absolute right-[-54px] z-[-1] top-0 '
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
        >
          <div className=" gap-2 p-1 backdrop-blur-sm bg-neutral-900  bg-opacity-85 border-neutral-800 border-[1px] rounded-xl flex flex-col">
            <button className={"bg-neutral-950 border hover:bg-neutral-800 border-neutral-600 p-1 rounded-lg cursor-pointer "
              + (transformMode === "translate" && "!border-neutral-200 !bg-blue-600  ")}
              onClick={() => setTransformMode("translate")}
            >
              <Move className='scale-90' />
            </button>
            <button className={"bg-neutral-950 border hover:bg-neutral-800 border-neutral-600 p-1 rounded-lg cursor-pointer "
              + (transformMode === "rotate" && "!border-neutral-200 !bg-blue-600   ")}
              onClick={() => setTransformMode("rotate")}
            >
              <RefreshCcw className='scale-75' />
            </button>
            <button className={"bg-neutral-950 border hover:bg-neutral-800 border-neutral-600 p-1 rounded-lg cursor-pointer "
              + (transformMode === "scale" && "!border-neutral-200 !bg-blue-600   ")}
              onClick={() => setTransformMode("scale")}
            >
              <svg width="24" height="24" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M11.5 3.04999C11.7485 3.04999 11.95 3.25146 11.95 3.49999V7.49999C11.95 7.74852 11.7485 7.94999 11.5 7.94999C11.2515 7.94999 11.05 7.74852 11.05 7.49999V4.58639L4.58638 11.05H7.49999C7.74852 11.05 7.94999 11.2515 7.94999 11.5C7.94999 11.7485 7.74852 11.95 7.49999 11.95L3.49999 11.95C3.38064 11.95 3.26618 11.9026 3.18179 11.8182C3.0974 11.7338 3.04999 11.6193 3.04999 11.5L3.04999 7.49999C3.04999 7.25146 3.25146 7.04999 3.49999 7.04999C3.74852 7.04999 3.94999 7.25146 3.94999 7.49999L3.94999 10.4136L10.4136 3.94999L7.49999 3.94999C7.25146 3.94999 7.04999 3.74852 7.04999 3.49999C7.04999 3.25146 7.25146 3.04999 7.49999 3.04999L11.5 3.04999Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
            </button>
          </div>

          <div className=" gap-2 p-1 mt-2 backdrop-blur-sm bg-neutral-900  bg-opacity-85 border-neutral-800 border-[1px] rounded-xl flex flex-col">
            <button
              className={"bg-neutral-950 border hover:bg-neutral-800 border-neutral-600 p-1 rounded-lg cursor-pointer"}
              onClick={handleSpaceChange}
            >
              {transformSpace === "local" &&
                <svg width="24" height="24" className="scale-75" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7.28856 0.796908C7.42258 0.734364 7.57742 0.734364 7.71144 0.796908L13.7114 3.59691C13.8875 3.67906 14 3.85574 14 4.05V10.95C14 11.1443 13.8875 11.3209 13.7114 11.4031L7.71144 14.2031C7.57742 14.2656 7.42258 14.2656 7.28856 14.2031L1.28856 11.4031C1.11252 11.3209 1 11.1443 1 10.95V4.05C1 3.85574 1.11252 3.67906 1.28856 3.59691L7.28856 0.796908ZM2 4.80578L7 6.93078V12.9649L2 10.6316V4.80578ZM8 12.9649L13 10.6316V4.80578L8 6.93078V12.9649ZM7.5 6.05672L12.2719 4.02866L7.5 1.80176L2.72809 4.02866L7.5 6.05672Z" fill="currentColor" fill-rule="evenodd" clip-rule="evenodd"></path></svg>
              }
              {transformSpace === "world" &&
                <Globe className='scale-75' />
              }
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

interface Props {
  vxobject: vxObjectProps
}

export const ObjectPropertiesPanel: React.FC<Props> = ({ vxobject }) => {
  if (!vxobject) return null;

  const refObject = vxobject?.ref?.current;
  if (!refObject) return null

  const material = refObject.material;
  const geometry = refObject.geometry;

  const vxType = vxobject.type

  let validMaterial: THREE.MeshBasicMaterial | THREE.MeshStandardMaterial | null = null;

  if (
    material instanceof THREE.MeshBasicMaterial ||
    material instanceof THREE.MeshStandardMaterial
  ) {
    validMaterial = material;
  }


  const isEntity = vxType === "entity" || vxType === "virtualEntity";
  const isNode = vxType === "splineNode" || vxType === "keyframeNode";

  return (
    <>
      {isEntity &&
        <TransformProperties vxobject={vxobject} />
      }
      {isNode &&
        <NodeTransformProperties vxobject={vxobject} />
      }
      {geometry && (
        <>
          <GeometryProperties geometry={geometry} />
          {validMaterial && (
            <MaterialProperties material={validMaterial} />
          )}
        </>
      )}
    </>
  );
};


export const ObjectManagerSubMenu = () => {
  const pushDialog = useUIManagerAPI(state => state.pushDialog)
  return (
    <MenubarSub>
      <MenubarSubTrigger>Object Manager API</MenubarSubTrigger>
      <MenubarSubContent>
        <MenubarItem onClick={() => pushDialog(<DIALOG_setTransformMode/>, "normal")}>set Transform Mode</MenubarItem>
        <MenubarItem onClick={() => pushDialog(<DIALOG_setTransformSpace/>, "normal")}>set Transform Space</MenubarItem>
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