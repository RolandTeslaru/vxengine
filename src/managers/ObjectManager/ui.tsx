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

  const isEntity = selectedObjectType === "entity" || selectedObjectType === "virtualEntity"

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
        </motion.div>
      )}
    </AnimatePresence>
  )
}

interface Props {
  vxobject: vxObjectProps
}

export const ObjectProperties: React.FC<Props> = ({ vxobject }) => {
  if(!vxobject) return null;
  
  const refObject = vxobject?.ref?.current;
  if(!refObject) return null

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
        <TransformProperties vxobject={vxobject}/>
      }
      {isNode &&
        <NodeTransformProperties vxobject={vxobject}/>
      }
      {geometry && (
        <>
          <GeometryProperties geometry={geometry}/>
          {validMaterial && (
            <MaterialProperties material={validMaterial} />
          )}
        </>
      )}
    </>
  );
};