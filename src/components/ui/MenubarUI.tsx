import React, { forwardRef, ElementRef, ComponentPropsWithoutRef } from 'react'
import Image from "next/image"
import { Menubar, MenubarContent, MenubarItem, MenubarSubContent, MenubarSubTrigger, MenubarMenu, MenubarSeparator, MenubarShortcut, MenubarSub, MenubarTrigger } from '../shadcn/menubar'
import { } from '@radix-ui/react-menubar'
import { useObjectManagerAPI } from "../../managers/ObjectManager/store"
import { shallow } from 'zustand/shallow'
import { useVXObjectStore } from '../../vxobject/ObjectStore'
import { Button } from '../shadcn/button'
import { useVXEngine } from '@vxengine/engine'
import { useVXUiStore } from './VXUIStore'
import { invalidate } from '@react-three/fiber'

export const MenubarUI = () => {

    return (
        <div
            className={`fixed top-6 left-6 z-10 h-10 w-fit border-neutral-800 border-[1px] text-white 
                    backdrop-blur-sm bg-neutral-900 bg-opacity-70 rounded-3xl flex flex-row px-6`}
            id="VXEngineMenubar"
        >
            {/* Icon */}
            <div className='h-full  w-[40px] flex scale-75'>
                <Image src={"/VXEngine/logo.png"} width={33} height={23}
                    alt="VXEngineLogo" className='w-[33px] h-[23px] my-auto' />
            </div>
            {/* Status */}
            {/* <div className='flex-row flex my-auto mx-4 text-nowrap'>
                <p className='font-sans-menlo text-sm'>
                    STATUS: SYS. READY
                </p>
            </div> */}
            {/* Items  */}
            <div className='my-auto-fit !text-white font-sans-menlo flex flex-row text-xs'>
                <Menubar>
                    <FileButton />
                    <EditButton />
                    <SelectButton />
                    <AddButton />
                    <ViewButton />
                    <SceneButton />
                </Menubar>
            </div>

        </div>
    )
}

const FileButton = () => {
    return (
        <MenubarMenu>
            <MenubarTrigger><p className='font-sans-menlo'>File</p></MenubarTrigger>
            <MenubarContent>
                <MenubarItem>New</MenubarItem>
                <MenubarItem>Open</MenubarItem>
                <MenubarSeparator />
                <MenubarItem>Import</MenubarItem>
                <MenubarItem>Export</MenubarItem>

            </MenubarContent>
        </MenubarMenu>
    )
}

const EditButton = () => {
    return (
        <MenubarMenu>
            <MenubarTrigger><p className='font-sans-menlo'>Edit</p></MenubarTrigger>
            <MenubarContent>
                <MenubarItem>
                    Undo <MenubarShortcut>⌘Z</MenubarShortcut>
                </MenubarItem>
                <MenubarItem>
                    Redo <MenubarShortcut>⇧⌘Z</MenubarShortcut>
                </MenubarItem>
                <MenubarSeparator />
                <MenubarItem>
                    Settings
                </MenubarItem>
            </MenubarContent>
        </MenubarMenu>
    )
}

const SelectButton = React.memo(() => {
    const selectObjects = useObjectManagerAPI(state => state.selectObjects)
    const selectedObjectKeys = useObjectManagerAPI(state => state.selectedObjectKeys)

    const handleSelectAll = () => { selectObjects(Object.values(useVXObjectStore.getState().objects).map((object) => object.vxkey)) }
    const handleSelectNone = () => { selectObjects([]) }
    const handleSelectInvert = () => {
        const newKeys = selectedObjectKeys.filter((vxkey) => !selectedObjectKeys.includes(vxkey))
        selectObjects(newKeys);
    }

    return (
        <MenubarMenu>
            <MenubarTrigger><p className='font-sans-menlo'>Select</p></MenubarTrigger>
            <MenubarContent>
                <MenubarItem onClick={handleSelectAll}>All</MenubarItem>
                <MenubarItem onClick={handleSelectNone}>None</MenubarItem>
                <MenubarItem onClick={handleSelectInvert}>Invert</MenubarItem>
            </MenubarContent>
        </MenubarMenu>
    )
}
)
const AddButton = () => {
    return (
        <MenubarMenu>
            <MenubarTrigger><p className='font-sans-menlo'>Add</p></MenubarTrigger>
            <MenubarContent>
                <MenubarItem>Group</MenubarItem>
                <MenubarSub>
                    <MenubarSubTrigger>Mesh</MenubarSubTrigger>
                    <MenubarSubContent>
                        <MenubarItem>Cube</MenubarItem>
                        <MenubarItem>Plane</MenubarItem>
                        <MenubarItem>Circle</MenubarItem>
                        <MenubarItem>Cylinder</MenubarItem>
                        <MenubarItem>Torus</MenubarItem>
                        <MenubarSeparator />
                        <MenubarItem>Grid</MenubarItem>
                        <MenubarItem>Monkey</MenubarItem>
                    </MenubarSubContent>
                </MenubarSub>
                <MenubarItem>3D Text</MenubarItem>
                <MenubarItem>Light</MenubarItem>
                <MenubarItem>Image</MenubarItem>
            </MenubarContent>
        </MenubarMenu>
    )
}

const CheckVisualizer = ({ show }: { show: boolean }) => {
    if (show)
        return (
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M11.4669 3.72684C11.7558 3.91574 11.8369 4.30308 11.648 4.59198L7.39799 11.092C7.29783 11.2452 7.13556 11.3467 6.95402 11.3699C6.77247 11.3931 6.58989 11.3355 6.45446 11.2124L3.70446 8.71241C3.44905 8.48022 3.43023 8.08494 3.66242 7.82953C3.89461 7.57412 4.28989 7.55529 4.5453 7.78749L6.75292 9.79441L10.6018 3.90792C10.7907 3.61902 11.178 3.53795 11.4669 3.72684Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
        )
    else
        return null;
}

const ViewButton = () => {
    const mountCoreUI = useVXUiStore(state => state.mountCoreUI);
    const setMountCoreUI = useVXUiStore(state => state.setMountCoreUI); 

    const showStateVisualizer = useVXUiStore(state => state.showStateVisualizer)
    const setShowStateVisualizer = useVXUiStore(state => state.setShowStateVisualizer);

    const mountLeftPanel = useVXUiStore(state => state.mountLeftPanel)
    const setMountLeftPanel = useVXUiStore(state => state.setMountLeftPanel)

    const mountRightPanel = useVXUiStore(state => state.mountRightPanel);
    const setMountRightPanel = useVXUiStore(state => state.setMountRightPanel)

    const mountTimelineEditor = useVXUiStore(state => state.mountTimelineEditor);
    const setMountTimelineEditor = useVXUiStore(state => state.setMountTimelineEditor)

    return (
        <MenubarMenu>
            <MenubarTrigger><p className='font-sans-menlo'>View</p></MenubarTrigger>
            <MenubarContent>
                <MenubarItem onClick={() => setMountCoreUI(!mountCoreUI)}>
                    VXEngine Core UI <MenubarShortcut><CheckVisualizer show={mountCoreUI} /></MenubarShortcut>
                </MenubarItem>
                <MenubarItem onClick={() => setMountLeftPanel(!mountLeftPanel)}>
                    Left Panel <MenubarShortcut><CheckVisualizer show={mountLeftPanel} /></MenubarShortcut>
                </MenubarItem>
                <MenubarItem onClick={() => setMountRightPanel(!mountRightPanel)}>
                    Right Panel <MenubarShortcut><CheckVisualizer show={mountRightPanel} /></MenubarShortcut>
                </MenubarItem>
                <MenubarItem onClick={() => setMountTimelineEditor(!mountTimelineEditor)}>
                    Timeline Editor<MenubarShortcut><CheckVisualizer show={mountTimelineEditor} /></MenubarShortcut>
                </MenubarItem>
                <MenubarItem onClick={() => setShowStateVisualizer(!showStateVisualizer)}>
                    State Visualizer <MenubarShortcut><CheckVisualizer show={showStateVisualizer} /></MenubarShortcut>
                </MenubarItem>
                
            </MenubarContent>
        </MenubarMenu>
    )
}

const SceneButton = () => {
    return (
        <MenubarMenu>
            <MenubarTrigger><p className='font-sans-menlo'>Scene</p></MenubarTrigger>
            <MenubarContent>
                <MenubarItem onClick={() => invalidate()}>Invalidate</MenubarItem>
            </MenubarContent>
        </MenubarMenu>
    )
}