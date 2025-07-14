import React from "react"
import {  useSourceManagerAPI } from "./store"
import { pushDialogStatic } from "../UIManager/store"
import { MenubarItem, MenubarSeparator, MenubarSub, MenubarSubContent, MenubarSubTrigger } from "@vxengine/ui/foundations/menubar"
import { DANGER_ProjectNameUnSync } from "@vxengine/ui/dialogs/Danger"

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


export const pushProjectNameUnSyncDialog = (diskJsonProjectName: string, providerProjectName: string) => {
    pushDialogStatic({
        content: <DANGER_ProjectNameUnSync diskJsonProjectName={diskJsonProjectName} providerProjectName={providerProjectName} />, 
        type: "danger",
        id: "id-unsyncProjectName",
    })
}