import { Button } from "@vxengine/components/shadcn/button"
import CollapsiblePanel from "@vxengine/core/components/CollapsiblePanel"
import React, { useEffect, useMemo, useRef, useState } from "react"
import { LocalStorageDataType, useSourceManagerAPI } from "./store"
import { useAnimationEngineAPI } from "@vxengine/AnimationEngine"
import HardDrive from '@geist-ui/icons/hardDrive'
import Server from '@geist-ui/icons/server'
import { MenubarItem, MenubarSeparator, MenubarSub, MenubarSubContent, MenubarSubTrigger } from "@vxengine/components/shadcn/menubar"
import ReactDiffViewer from 'react-diff-viewer-continued';

export const SourceManagerSubMenu = () => {
    const saveToDisk = useSourceManagerAPI(state => state.saveDataToDisk)
    const saveToLocalStorage = useSourceManagerAPI(state => state.saveDataToLocalStorage)
    return (
        <MenubarSub>
            <MenubarSubTrigger>Source Manager API</MenubarSubTrigger>
            <MenubarSubContent>
                <MenubarItem onClick={() => saveToDisk()}>Save Data to Disk</MenubarItem>
                <MenubarItem onClick={() => saveToLocalStorage()}>Save Data to Local Storage</MenubarItem>
                <MenubarSeparator />
                <MenubarItem onClick={() => saveToDisk({force: true, reloadOnSuccess: true})}>
                    Override Disk
                </MenubarItem>
                <MenubarItem onClick={() => saveToLocalStorage({force: true})}>
                    Override Local Storage
                </MenubarItem>
            </MenubarSubContent>
        </MenubarSub>
    )
}
