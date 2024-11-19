import CollapsiblePanel from '@vxengine/components/ui/CollapsiblePanel'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useSplineManagerAPI } from './store'
import { useObjectManagerAPI, useObjectSettingsAPI, useVXObjectStore } from '../ObjectManager'
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from '@vxengine/components/shadcn/contextMenu';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@vxengine/components/shadcn/select';
import { Popover, PopoverContent, PopoverTrigger } from '@vxengine/components/shadcn/popover'
import { ScrollArea } from '@vxengine/components/shadcn/scrollArea'

import styles from "./styles.module.scss"
import { MenubarItem, MenubarSub, MenubarSubContent, MenubarSubTrigger } from '@vxengine/components/shadcn/menubar';

const SplineManagerUI = () => {
  const selectedSpline = useSplineManagerAPI(state => state.selectedSpline)

  if (!selectedSpline) return

  return <SplineSettings />
}

export default SplineManagerUI

const SplineSettings = () => {
  const vxkey = useSplineManagerAPI(state => state.selectedSpline.vxkey)
  const isShowingSpline = useObjectSettingsAPI(state => state.additionalSettings[vxkey].showPositionPath)

  if (!isShowingSpline) return null;

  return (
    <CollapsiblePanel
      title='Spline Manager'
    >
      <div className='gap-2 flex flex-col'>
        <div className='w-auto mx-auto'>
          <SplineSelect defaultSplineKey={vxkey} />
        </div>
        <SplineNodesScrollArea />
      </div>
    </CollapsiblePanel>
  )
}

const SplineNodesScrollArea = () => {
  const [isOverflowing, setIsOverflowing] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const selectedSpline = useSplineManagerAPI(state => state.selectedSpline);

  useEffect(() => {
    const checkOverflow = () => {
      const scrollArea = scrollAreaRef.current;
      if (scrollArea) {
        setIsOverflowing(scrollArea.scrollHeight > scrollArea.clientHeight);
      }
    };

    checkOverflow();

    window.addEventListener('resize', checkOverflow);
    return () => window.removeEventListener('resize', checkOverflow);
  }, [selectedSpline.nodes]);

  return (
    <div className={"relative max-h-48 overflow-hidden " + styles.scrollContainer}>
      <ScrollArea
        ref={scrollAreaRef}
        scrollbarPosition="left"
        className={`flex flex-col px-4 mx-1 max-h-48 overflow-y-scroll ${isOverflowing ? `${styles.gradientMask}` : ''}`}
      >
        {selectedSpline.nodes.map((position, index) => (
          <SplineNodeListObject splineKey={selectedSpline.splineKey} position={position} index={index} key={index} />
        ))}
      </ScrollArea>
    </div>
  );
};

const SplineNodeListObject = ({ splineKey, position, index, }) => {
  const nodeKey = `${splineKey}.node${index}`

  const vxSplineNode = useVXObjectStore(state => state.objects[nodeKey]);

  const selectedObjectKeys = useObjectManagerAPI(state => state.selectedObjectKeys)
  const selectObject = useObjectManagerAPI(state => state.selectObjects)

  const insertNode = useSplineManagerAPI(state => state.insertNode)
  const removeNode = useSplineManagerAPI(state => state.removeNode)

  const isSelected = useMemo(() => {
    return selectedObjectKeys.includes(vxSplineNode?.vxkey)
  }, [vxSplineNode, selectedObjectKeys])

  const handleOnClick = () => {
    useObjectManagerAPI.getState().setTransformMode("translate");
    selectObject([nodeKey], 'splineNode')
  }


  return (
    <>
      <ContextMenu>
        <ContextMenuTrigger className={'h-6 px-2 border flex flex-row rounded-xl bg-neutral-800 hover:bg-neutral-900 border-neutral-700 cursor-pointer ' +
          ` ${isSelected && " !bg-blue-600 hover:!bg-blue-700 !border-neutral-300"} `}
          onMouseDown={(event) => event.preventDefault()}
          onClick={handleOnClick}
        >
          <p className={'h-auto my-auto text-sm font-bold mr-auto text-neutral-200 text-opacity-80'}>
            {index}
          </p>
          <p className={'h-auto my-auto text-xs ml-auto text-neutral-600 ' +
            `${isSelected && "!text-neutral-400"}`}
            style={{ fontSize: "11px" }}
          >
            {splineKey}
          </p>
        </ContextMenuTrigger>
        <ContextMenuContent>
          <Popover>
            <PopoverTrigger asChild>
              <ContextMenuItem
                onMouseDown={(e) => {
                  e.preventDefault()
                  e.stopPropagation();
                }}
              >
                <p className=' text-neutral-300'>
                  Show Data
                </p>
              </ContextMenuItem>
            </PopoverTrigger>
            <PopoverContent>
              Popover content
            </PopoverContent>
          </Popover>
          <ContextMenuItem onClick={() => removeNode(splineKey, index)}>
            <p className=' text-red-700'>
              Delete Node
            </p>
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
      <div className='py-1 w-full cursor-pointer group' onClick={() => insertNode(splineKey, index)}>
        <div className={`content-[""] w-fil h-[2px] rounded-full mx-2
                          group-hover:bg-gradient-to-r group-hover:from-neutral-950 group-hover:via-blue-500 group-hover:to-neutral-950`} />
      </div>
    </>
  )
}

const SplineSelect = ({ defaultSplineKey }) => {
  const setSelectedSpline = useSplineManagerAPI(state => state.setSelectedSpline)
  const splines = useSplineManagerAPI(state => state.splines)

  const handleOnValueChange = (newSplineKey: string) => {
    setSelectedSpline(newSplineKey)
  }

  return (
    <Select
      defaultValue={defaultSplineKey}
      onValueChange={handleOnValueChange}
    >
      <SelectTrigger className="w-[180px] h-7 my-auto">
        <SelectValue placeholder="Select a Spline" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {Object.entries(splines).map(([splineKey, spline], index) => {
            const vxkey = spline.vxkey || splineKey; // Fallback to splineKey if vxkey is missing

            if (!vxkey) return null;

            return (
              <SelectItem value={vxkey} key={splineKey}>
                <p className='text-xs font-light'>
                  {spline.splineKey} - {vxkey}
                </p>
              </SelectItem>
            )
          })}
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}

export const SplineManagerSubMenu = () => {
  return (
    <MenubarSub>
      <MenubarSubTrigger>Spline Manager API</MenubarSubTrigger>
      <MenubarSubContent>
        <MenubarItem>Remove Spline</MenubarItem>
        <MenubarItem>Set Spline Node Position</MenubarItem>
        <MenubarItem>Change Spline Node Axis Value</MenubarItem>
        <MenubarItem>Insert Node</MenubarItem>
        <MenubarItem>Remove Node</MenubarItem>
      </MenubarSubContent>
    </MenubarSub>
  )
}