import React, { forwardRef, ElementRef, ComponentPropsWithoutRef } from 'react'
import Image from "next/image"
import { Menubar, MenubarContent, MenubarItem, MenubarSubContent, MenubarSubTrigger, MenubarMenu, MenubarSeparator, MenubarShortcut, MenubarSub, MenubarTrigger } from '../shadcn/menubar'
import { } from '@radix-ui/react-menubar'
import { useObjectManagerAPI } from "../../managers/ObjectManager/store"
import { shallow } from 'zustand/shallow'
import { useVXObjectStore } from '../../vxobject/ObjectStore'
import { Button } from '../shadcn/button'

export const MenubarUI = () => {

    return (
        <>
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
                    <ObjectButton />
                    <SceneButton/>
                </Menubar>
            </div>

        </>
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

const ObjectButton = () => {
    return (
        <MenubarMenu> 
            <MenubarTrigger><p className='font-sans-menlo'>Object</p></MenubarTrigger>
            <MenubarContent>
                <MenubarItem>
                    New Tab <MenubarShortcut>⌘T</MenubarShortcut>
                </MenubarItem>
                <MenubarItem>New Window</MenubarItem>
                <MenubarSeparator />
                <MenubarItem>Share</MenubarItem>
                <MenubarSeparator />
                <MenubarItem>Print</MenubarItem>
            </MenubarContent>
        </MenubarMenu>
    )
}

const SceneButton = () => {
    return (
        <MenubarMenu> 
            <MenubarTrigger><p className='font-sans-menlo'>Scene</p></MenubarTrigger>
            <MenubarContent>
                <MenubarItem>
                    New Tab <MenubarShortcut>⌘T</MenubarShortcut>
                </MenubarItem>
                <MenubarItem>New Window</MenubarItem>
                <MenubarSeparator />
                <MenubarItem>Share</MenubarItem>
                <MenubarSeparator />
                <MenubarItem>Print</MenubarItem>
            </MenubarContent>
        </MenubarMenu>
    )
}