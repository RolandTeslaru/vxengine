import React, { forwardRef, ElementRef, ComponentPropsWithoutRef } from 'react'
import Image from "next/image"
import { useVXEngine } from '@/VXEngine'
import { Menubar, MenubarContent, MenubarItem, MenubarSubContent, MenubarSubTrigger, MenubarMenu, MenubarSeparator, MenubarShortcut, MenubarSub, MenubarTrigger } from '../shadcn/menubar'
import {  } from '@radix-ui/react-menubar'

export const MenubarUI = () => {
    return (
        <>
            {/* Icon */}
            <div className='h-full  w-[40px] flex '>
                <Image src={"/VXEngine/logo.png"} width={33} height={23}
                    alt="VXEngineLogo" className='w-[33px] h-[23px] my-auto' />
            </div>
            {/* Status */}
            <div className='flex-row flex my-auto mx-4 text-nowrap'>
                <p className='font-sans-menlo text-sm'>
                    STATUS: SYS. READY
                </p>
            </div>
            {/* Items  */}
            <div className='my-auto-fit !text-white font-sans-menlo flex flex-row text-xs'>
                <Menubar>
                    {/* File Button */}
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
                    {/* Edit Button */}
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
                    {/* Select Button */}
                    <MenubarMenu>
                        <MenubarTrigger><p className='font-sans-menlo'>Select</p></MenubarTrigger>
                        <MenubarContent>
                            <MenubarItem>All</MenubarItem>
                            <MenubarItem>None</MenubarItem>
                            <MenubarItem>Invert</MenubarItem>
                        </MenubarContent>
                    </MenubarMenu>
                    {/* Add Button */}
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
                    {/* Object Button */}
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
                </Menubar>
            </div>

        </>
    )
}