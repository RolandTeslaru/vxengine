"use client"
import { Toggle } from '@geist-ui/core'
import React, { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useFrame } from '@react-three/fiber'
import { isEqual } from 'lodash'
import { ChevronRight, Move } from '@geist-ui/icons'
import { RefreshCcw } from '@geist-ui/icons'
import { motion, AnimatePresence } from "framer-motion"
import { useVXObjectStore } from 'vxengine/store'
import { StoredObjectProps } from 'vxengine/types/objectStore'
import { useVXEngine } from 'vxengine/engine'
import { Input } from 'vxengine/components/shadcn/input'
import { useObjectManagerStore, useObjectPropertyStore } from './store'
import { shallow } from 'zustand/shallow'

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
    {propsParent && createPortal(
      <ObjectProperties />,
      propsParent
    )
    }
  </>)
}

export const ObjectList = () => {
  const [visible, setVisible] = useState(true)
  const { objects } = useVXObjectStore();
  const { selectedObjectKeys, selectObjects, hoveredObject } = useObjectManagerStore(state => ({
    selectedObjectKeys: state.selectedObjectKeys,
    selectObjects: state.selectObjects,
    hoveredObject: state.hoveredObject
  }), shallow);

  const [lastSelectedIndex, setLastSelectedIndex] = React.useState(null);

  const handleObjectClick = (event, obj: StoredObjectProps, index: number) => {
    event.preventDefault();

    // Convert objects to an array to get a slice
    const objectArray = Object.values(objects);

    // Click + SHIFT key
    if (event.shiftKey && lastSelectedIndex !== null) {
      const start = Math.min(lastSelectedIndex, index);
      const end = Math.max(lastSelectedIndex, index);
      const newSelectedObjectKeys = objectArray.slice(start, end + 1).map((obj: StoredObjectProps) => obj.vxkey);
      selectObjects([...newSelectedObjectKeys, ...selectedObjectKeys]);
    }
    // Click + CTRL key ( command key on macOS )
    else if (event.metaKey || event.ctrlKey) {
      let newSelectedKeys: string[] = [];
      if (selectedObjectKeys.includes(obj.vxkey)) {
        newSelectedKeys = selectedObjectKeys.filter(key => key !== obj.vxkey);
      } else {
        newSelectedKeys = [...selectedObjectKeys, obj.vxkey];
      }
      selectObjects(newSelectedKeys);
    }
    // Click
    else {
      selectObjects([obj.vxkey]);
    }
    setLastSelectedIndex(index);
  };

  return (
    <motion.div className='bg-neutral-950 overflow-hidden min-w-60 h-fit  bg-opacity-70 gap-2 flex flex-col rounded-2xl p-2'
    >
      <div className='flex flex-row w-full h-auto'>
        <button className={"absolute h-7 w-7 flex hover:bg-neutral-800 rounded-lg cursor-pointer "}
          onClick={() => setVisible(!visible)}
        >
          <ChevronRight className={`${visible === true && " rotate-90 "}  scale-[90%] m-auto`} />
        </button>
        <p className='text-center text-md pt-1 h-auto m-auto pb-1 font-sans-menlo'>Object List</p>
      </div>
      <div className='border-t flex flex-col pt-2 gap-2 border-neutral-700 '>
        <div className='text-xs flex flex-row text-neutral-400'>
          {selectedObjectKeys.length === 1 && (
            <p className='text-xs text-neutral-400' >{selectedObjectKeys.length} object selected</p>
          )}
          {selectedObjectKeys.length > 1 && (
            <p className='text-xs  text-neutral-400' >{selectedObjectKeys.length} objects selected</p>
          )}
          <p className='ml-auto text-xs'> objects</p>
        </div>
        <div className='flex flex-col'>
          {Object.values(objects).map((obj: StoredObjectProps, index: number) => {
            const isSelected = selectedObjectKeys.includes(obj.vxkey);
            const isHovered = hoveredObject?.vxkey === obj.vxkey
            return (
              <div key={index} className={'h-9 my-1 border flex flex-row p-2 rounded-xl bg-neutral-800 border-neutral-700 cursor-pointer ' +
                `${isHovered && " !bg-blue-800 !border-blue-600"} ${isSelected && " !bg-blue-600 !border-neutral-200"} `}
                onClick={(event) => handleObjectClick(event, obj, index)}
                onMouseDown={(event) => event.preventDefault()}
              >
                <p className={'h-auto my-auto text-xs mr-auto text-neutral-200'}>
                  {obj.name}
                </p>
                <p className={'h-auto my-auto text-xs ml-auto text-neutral-600 ' +
                  `${isSelected && "!text-neutral-400"}`}>
                  {obj.type}
                </p>
              </div>
            )
          })}

        </div>
      </div>
    </motion.div>
  )
}

export const ObjectTransformControls = () => {

  const { selectedObjects, transformMode, setTransformMode } = useObjectManagerStore(state => ({
    selectedObjects: state.selectedObjects,
    transformMode: state.transformMode,
    setTransformMode: state.setTransformMode
  }), shallow);

  return (
    <AnimatePresence>
      {selectedObjects[0] && (
        <motion.div
          className='absolute right-[-54px] z-[-1] top-0 '
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
        >
          <div className=" gap-2 p-1 backdrop-blur-sm bg-neutral-900  bg-opacity-85 border-neutral-800 border-[1px] rounded-xl flex flex-col">
            <button className={"bg-neutral-950 border hover:bg-neutral-800 border-neutral-600 p-1 rounded-lg cursor-pointer " + (transformMode === "translate" && "!border-neutral-200 !bg-blue-600  ")}
              onClick={() => setTransformMode("translate")}
            >
              <Move className='scale-90' />
            </button>
            <button className={"bg-neutral-950 border hover:bg-neutral-800 border-neutral-600 p-1 rounded-lg cursor-pointer " + (transformMode === "rotate" && "!border-neutral-200 !bg-blue-600   ")}
              onClick={() => setTransformMode("rotate")}
            >
              <RefreshCcw className='scale-75' />
            </button>
            <button className={"bg-neutral-950 border hover:bg-neutral-800 border-neutral-600 p-1 rounded-lg cursor-pointer " + (transformMode === "scale" && "!border-neutral-200 !bg-blue-600   ")}
              onClick={() => setTransformMode("scale")}
            >
              <svg width="24" height="24" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M11.5 3.04999C11.7485 3.04999 11.95 3.25146 11.95 3.49999V7.49999C11.95 7.74852 11.7485 7.94999 11.5 7.94999C11.2515 7.94999 11.05 7.74852 11.05 7.49999V4.58639L4.58638 11.05H7.49999C7.74852 11.05 7.94999 11.2515 7.94999 11.5C7.94999 11.7485 7.74852 11.95 7.49999 11.95L3.49999 11.95C3.38064 11.95 3.26618 11.9026 3.18179 11.8182C3.0974 11.7338 3.04999 11.6193 3.04999 11.5L3.04999 7.49999C3.04999 7.25146 3.25146 7.04999 3.49999 7.04999C3.74852 7.04999 3.94999 7.25146 3.94999 7.49999L3.94999 10.4136L10.4136 3.94999L7.49999 3.94999C7.25146 3.94999 7.04999 3.74852 7.04999 3.49999C7.04999 3.25146 7.25146 3.04999 7.49999 3.04999L11.5 3.04999Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
            </button>

          </div>
          <div className='pt-2'>

          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export const ObjectProperties = () => {

  const firstObjectSelected = useObjectManagerStore((state) => state.selectedObjects[0], shallow)

  return (
    <div id="VXObjectManager_ObjectProperties" className='bg-neutral-950 z-20 h-fit transition-all ease-in-out duration-500 bg-opacity-70 rounded-2xl p-2'>
      <p className='text-center font-sans-menlo pb-1'>Object Properties</p>
      <TransformProperties />
      <AnimatePresence>
        {firstObjectSelected?.ref?.current && firstObjectSelected.type === "mesh" && (
          <GeometryProperties geometry={(firstObjectSelected.ref.current as THREE.Mesh).geometry} />
        )}
      </AnimatePresence>
    </div >
  )
}

export const TransformProperties = () => {
  const firstObjectSelectedStored = useObjectManagerStore((state) => state.selectedObjects[0]);
  const firstObjectSelected = firstObjectSelectedStored?.ref.current;
  const updateProperty = useObjectPropertyStore((state) => state.updateProperty);
  const { properties } = useObjectPropertyStore(state => ({ properties: state.properties }), shallow);

  const handleTransformChange = (property, axis, value) => {
    if (firstObjectSelected) {
      firstObjectSelected[property][axis] = parseFloat(value);
      updateProperty(firstObjectSelectedStored.vxkey, `${property}.${axis}`, parseFloat(value));
    }
  };

  const renderInputs = (property) => {
    return ['x', 'y', 'z'].map((axis) => (
      <Input
        key={`${property}-${axis}`}
        className={`${axis} text-xs`}
        type="number"
        value={properties[firstObjectSelectedStored.vxkey]?.[property]?.[axis] || firstObjectSelected[property][axis]}
        onChange={(e) => handleTransformChange(property, axis, e.target.value)}
      />
    ));
  };

  return (
    <AnimatePresence>
      {firstObjectSelected && (
        <>
          {/* TRANSFORM Controls */}
          <motion.div className='border-t flex flex-col border-neutral-600 bg-none hover:bg-neutral-900 transition-all text-neutral-400'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <p className='text-xs pt-2'>Transform</p>

            <div className='flex flex-row py-2'>
              <p className='text-xs'>Position</p>
              <div className='PositionProp flex flex-row max-w-36 ml-auto [&>*]:p-0.5 [&>*]:h-fit [&>*]:border-none  [&>*]:bg-neutral-800'>
                {renderInputs('position')}
              </div>
            </div>

            <div className='flex flex-row py-2'>
              <p className='text-xs'>Scale</p>
              <div className='ScaleProp flex flex-row max-w-36 ml-auto [&>*]:p-0.5 [&>*]:h-fit [&>*]:border-none  [&>*]:bg-neutral-800'>
                {renderInputs('scale')}
              </div>
            </div>

            <div className='flex flex-row py-2'>
              <p className='text-xs'>Rotation</p>
              <div className='RotationProp flex flex-row max-w-36 ml-auto [&>*]:p-0.5 [&>*]:h-fit [&>*]:border-none  [&>*]:bg-neutral-800'>
                {renderInputs('rotation')}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export const GeometryProperties = ({ geometry }: { geometry: THREE.BufferGeometry }) => {

  useEffect(() => {
    console.log("Geometry ", geometry);
  }, [])

  return (
    <motion.div className='border-t text-xs flex flex-col py-2 border-neutral-600 bg-none hover:bg-neutral-900 transition-all text-neutral-400'
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <p>Geometry</p>
      <div className='flex flex-col'>
        <div>
          <p>Type: {geometry.type}</p>
        </div>
      </div>
    </motion.div>
  )
}