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
  const transformSpace = useObjectManagerAPI(state => state.transformSpace);
  const setTransformSpace = useObjectManagerAPI(state => state.setTransformSpace);

  const isEntity = selectedObjectType === "entity" || selectedObjectType === "virtualEntity"

  const handleSpaceChange = () => {
    if(transformSpace === "local")
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
              className={"bg-neutral-950 border hover:bg-neutral-800 border-neutral-600 p-1 rounded-lg cursor-pointer "
              + (transformMode === "scale" && "!border-neutral-200 !bg-blue-600   ")}
              onClick={handleSpaceChange}
            >
              {transformSpace === "local" &&
                <svg width="24" height="24" className="scale-75" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7.28856 0.796908C7.42258 0.734364 7.57742 0.734364 7.71144 0.796908L13.7114 3.59691C13.8875 3.67906 14 3.85574 14 4.05V10.95C14 11.1443 13.8875 11.3209 13.7114 11.4031L7.71144 14.2031C7.57742 14.2656 7.42258 14.2656 7.28856 14.2031L1.28856 11.4031C1.11252 11.3209 1 11.1443 1 10.95V4.05C1 3.85574 1.11252 3.67906 1.28856 3.59691L7.28856 0.796908ZM2 4.80578L7 6.93078V12.9649L2 10.6316V4.80578ZM8 12.9649L13 10.6316V4.80578L8 6.93078V12.9649ZM7.5 6.05672L12.2719 4.02866L7.5 1.80176L2.72809 4.02866L7.5 6.05672Z" fill="currentColor" fill-rule="evenodd" clip-rule="evenodd"></path></svg>
              }
              {transformSpace === "world" &&
                <svg width="24" height="24" className="scale-75" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7.49996 1.80002C4.35194 1.80002 1.79996 4.352 1.79996 7.50002C1.79996 10.648 4.35194 13.2 7.49996 13.2C10.648 13.2 13.2 10.648 13.2 7.50002C13.2 4.352 10.648 1.80002 7.49996 1.80002ZM0.899963 7.50002C0.899963 3.85494 3.85488 0.900024 7.49996 0.900024C11.145 0.900024 14.1 3.85494 14.1 7.50002C14.1 11.1451 11.145 14.1 7.49996 14.1C3.85488 14.1 0.899963 11.1451 0.899963 7.50002Z" fill="currentColor" fill-rule="evenodd" clip-rule="evenodd"></path><path d="M13.4999 7.89998H1.49994V7.09998H13.4999V7.89998Z" fill="currentColor" fill-rule="evenodd" clip-rule="evenodd"></path><path d="M7.09991 13.5V1.5H7.89991V13.5H7.09991zM10.375 7.49998C10.375 5.32724 9.59364 3.17778 8.06183 1.75656L8.53793 1.24341C10.2396 2.82218 11.075 5.17273 11.075 7.49998 11.075 9.82724 10.2396 12.1778 8.53793 13.7566L8.06183 13.2434C9.59364 11.8222 10.375 9.67273 10.375 7.49998zM3.99969 7.5C3.99969 5.17611 4.80786 2.82678 6.45768 1.24719L6.94177 1.75281C5.4582 3.17323 4.69969 5.32389 4.69969 7.5 4.6997 9.67611 5.45822 11.8268 6.94179 13.2472L6.45769 13.7528C4.80788 12.1732 3.9997 9.8239 3.99969 7.5z" fill="currentColor" fill-rule="evenodd" clip-rule="evenodd"></path><path d="M7.49996 3.95801C9.66928 3.95801 11.8753 4.35915 13.3706 5.19448 13.5394 5.28875 13.5998 5.50197 13.5055 5.67073 13.4113 5.83948 13.198 5.89987 13.0293 5.8056 11.6794 5.05155 9.60799 4.65801 7.49996 4.65801 5.39192 4.65801 3.32052 5.05155 1.97064 5.8056 1.80188 5.89987 1.58866 5.83948 1.49439 5.67073 1.40013 5.50197 1.46051 5.28875 1.62927 5.19448 3.12466 4.35915 5.33063 3.95801 7.49996 3.95801zM7.49996 10.85C9.66928 10.85 11.8753 10.4488 13.3706 9.6135 13.5394 9.51924 13.5998 9.30601 13.5055 9.13726 13.4113 8.9685 13.198 8.90812 13.0293 9.00238 11.6794 9.75643 9.60799 10.15 7.49996 10.15 5.39192 10.15 3.32052 9.75643 1.97064 9.00239 1.80188 8.90812 1.58866 8.9685 1.49439 9.13726 1.40013 9.30601 1.46051 9.51924 1.62927 9.6135 3.12466 10.4488 5.33063 10.85 7.49996 10.85z" fill="currentColor" fill-rule="evenodd" clip-rule="evenodd"></path></svg>
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