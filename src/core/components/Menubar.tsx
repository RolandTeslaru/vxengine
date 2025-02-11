import React from 'react'
import { Menubar, MenubarContent, MenubarItem, MenubarSubContent, MenubarSubTrigger, MenubarMenu, MenubarSeparator, MenubarShortcut, MenubarSub, MenubarTrigger } from '../../components/shadcn/menubar'
import { } from '@radix-ui/react-menubar'
import { useObjectManagerAPI } from "../../managers/ObjectManager/stores/managerStore"
import { useVXObjectStore } from '../../managers/ObjectManager/stores/objectStore'
import { useUIManagerAPI } from '../../managers/UIManager/store'
import { invalidate } from '@react-three/fiber'
import { SourceManagerSubMenu } from '@vxengine/managers/SourceManager/ui'
import { ObjectManagerSubMenu, ObjectPropertySubMenu, ObjectSettingsSubMenu } from '@vxengine/managers/ObjectManager/ui'
import { EffectsManagerSubMenu } from '@vxengine/managers/EffectsManager/ui'
import VXEngineLogo from '@vxengine/components/ui/VXEngineLogo'
import { INFO_About, INFO_Settings } from '@vxengine/components/ui/DialogInfos'
import TimelineManagerSubMenu from '@vxengine/managers/TimelineManager/subMenu'
import { logReportingService } from '@vxengine/AnimationEngine/services/LogReportingService'

const LOG_MODULE = "VXMenubar"

const VXMenubar = () => {
    return (
        <div
            className={`fixed top-6 left-6 z-10 w-fit border-neutral-400 border-opacity-20 border-[1px] text-white 
                        backdrop-blur-lg bg-neutral-900 bg-opacity-70 rounded-3xl flex flex-row px-3 
                    `}
            id="VXEngineMenubar"
            style={{ boxShadow: "0 4px 15px -3px rgb(0 0 0 / 0.6), 0 2px 6px -4px rgb(0 0 0 / 0.6"}}
        >
            {/* Icon */}

            <div className='my-auto-fit !text-white font-sans-menlo flex flex-row text-sm'>
                <Menubar className=' h-auto'>
                    <LogoButton />
                    <FileButton />
                    <EditButton />
                    <SelectButton />
                    <ManagersButton />
                    <ViewButton />
                    <SceneButton />
                </Menubar>
            </div>

        </div>
    )
}

export default VXMenubar

const LogoButton = () => {

    const pushDialog = useUIManagerAPI(state => state.pushDialog);

    return (
        <MenubarMenu>
            <MenubarTrigger className='!my-0 !py-0'>
                <VXEngineLogo />
            </MenubarTrigger>
            <MenubarContent>
                <MenubarItem onClick={() => pushDialog({content:<INFO_About/>, type: "normal", className:"!p-0"})}>About VXEngine</MenubarItem>
                <MenubarItem onClick={() => pushDialog({content:<INFO_Settings/> , type:"normal"})}>Settings</MenubarItem>
            </MenubarContent>
        </MenubarMenu >
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

    const handleSelectAll = () => {
        selectObjects(
            Object.values(useVXObjectStore.getState().objects).map((object) => object.vxkey),
            "entity",
            false
        )
    }
    const handleSelectNone = () => { selectObjects([], "entity", false) }
    const handleSelectInvert = () => {
        const selectedObjectKeys = useObjectManagerAPI.getState().selectedObjectKeys
        const newKeys = selectedObjectKeys.filter((vxkey) => !selectedObjectKeys.includes(vxkey))

        selectObjects(newKeys, "entity", false);
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
})

const ManagersButton = () => {
    return (
        <MenubarMenu>
            <MenubarTrigger><p className='font-sans-menlo'>Debug</p></MenubarTrigger>
            <MenubarContent>

                <ObjectManagerSubMenu />
                <ObjectSettingsSubMenu />
                <ObjectPropertySubMenu />

                <MenubarSeparator />

                <SourceManagerSubMenu />
                <EffectsManagerSubMenu />
                <TimelineManagerSubMenu />
            </MenubarContent>
        </MenubarMenu>
    )
}


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
    const windows = useUIManagerAPI(state => state.windows);
    const windowVisibility = useUIManagerAPI(state => state.windowVisibility);
    const setWindowVisibility = useUIManagerAPI(state => state.setWindowVisibility);

    const handleClick = (id: string) => {
        const visibility = useUIManagerAPI.getState().windowVisibility[id];
        setWindowVisibility(id, !visibility);
    }

    return (
        <MenubarMenu>
            <MenubarTrigger><p className='font-sans-menlo'>View</p></MenubarTrigger>
            <MenubarContent>
                {Object.entries(windows).map(([key, window]) =>
                    <MenubarItem key={key} onClick={() => handleClick(window.id)}>
                        {window.title} <MenubarShortcut><CheckVisualizer show={windowVisibility[window.id]} /></MenubarShortcut>
                    </MenubarItem>
                )}
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
                <MenubarSub>
                    <MenubarSubTrigger>Camera</MenubarSubTrigger>
                    <MenubarSubContent>
                        <MenubarItem onClick={updateProjectionMatrix}>Update Projection Matrix</MenubarItem>
                    </MenubarSubContent>
                </MenubarSub>
            </MenubarContent>
        </MenubarMenu>
    )
}

const updateProjectionMatrix = () => {
    const vxobject = useVXObjectStore.getState().objects['perspectiveCamera'];
    if(!vxobject)
        return;

    const cameraRef = vxobject.ref.current
    if(cameraRef)
        cameraRef.updateProjectionMatrix();

    logReportingService.logInfo(
        `Updated Projection Matrix`, {module: LOG_MODULE, functionName: "updateProjectionMatrix"}
    )
}