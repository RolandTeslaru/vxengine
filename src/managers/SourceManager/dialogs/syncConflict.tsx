import { useAnimationEngineAPI } from "@vxengine/AnimationEngine";
import React, { useMemo } from "react";
import { LocalStorageDataType, useSourceManagerAPI } from "../store";
import { Button } from "@vxengine/components/shadcn/button";
import ReactDiffViewer from 'react-diff-viewer-continued';
import { useUIManagerAPI } from "@vxengine/managers/UIManager/store";
import { AlertDialogDescription, AlertDialogTitle } from "@vxengine/components/shadcn/alertDialog";
import { HardDrive, Server } from "@vxengine/components/ui/icons";

const defaultStyles = {
    variables: {
        light: {
            diffViewerBackground: 'transparent',
            diffViewerColor: 'white',
            addedBackground: '#00FF223B',
            addedColor: 'white',
            removedBackground: '#FF001E4E',
            removedColor: 'white',
            wordAddedBackground: '#00FF228F',
            wordRemovedBackground: '#FF001E9B',
            addedGutterBackground: '#00FF228F',
            removedGutterBackground: '#FF001E9B',
            gutterBackground: 'transparent',
            gutterBackgroundDark: 'transparent',
            highlightBackground: 'transparent',
            highlightGutterBackground: 'transparent',
            codeFoldGutterBackground: 'transparent',
            codeFoldBackground: 'transparent',
            emptyLineBackground: 'transparent',
            gutterColor: 'white',
            addedGutterColor: '#FFFFFFFF',
            removedGutterColor: '#FFFFFFFF',
            codeFoldContentColor: '#FFFFFF6B',
            diffViewerTitleBackground: 'transparent',
            diffViewerTitleColor: 'transparent',
            diffViewerTitleBorderColor: 'transparent',
        },
        dark: {
            diffViewerBackground: '#2e303c',
            diffViewerColor: '#FFF',
            addedBackground: '#044B53',
            addedColor: 'white',
            removedBackground: '#632F34',
            removedColor: 'white',
            wordAddedBackground: '#055d67',
            wordRemovedBackground: '#7d383f',
            addedGutterBackground: '#034148',
            removedGutterBackground: '#632b30',
            gutterBackground: '#2c2f3a',
            gutterBackgroundDark: '#262933',
            highlightBackground: '#2a3967',
            highlightGutterBackground: '#2d4077',
            codeFoldGutterBackground: '#21232b',
            codeFoldBackground: '#262831',
            emptyLineBackground: '#363946',
            gutterColor: '#464c67',
            addedGutterColor: '#8c8c8c',
            removedGutterColor: '#8c8c8c',
            codeFoldContentColor: '#555a7b',
            diffViewerTitleBackground: '#2f323e',
            diffViewerTitleColor: '#555a7b',
            diffViewerTitleBorderColor: '#353846',
        }
    }
}


export const DANGER_SyncConflict = ({ dialogId }: { dialogId: string }) => {
    const diskTimelines = useAnimationEngineAPI(state => state.timelines)
    const projectName = useAnimationEngineAPI(state => state.projectName);
    const diskTimelinesString = useMemo(() => JSON.stringify(diskTimelines, null, 2), [diskTimelines])

    const saveDataToLocalStorage = useSourceManagerAPI(state => state.saveDataToLocalStorage)
    const saveDataToDisk = useSourceManagerAPI(state => state.saveDataToDisk);

    const closeDialog = useUIManagerAPI(state => state.closeDialog);

    const lsTimelinesString = useMemo(() => {
        const lsString = localStorage.getItem("VXEngineProjects")
        const lsData = JSON.parse(lsString) as LocalStorageDataType;
        const lsTimelines = lsData[projectName].timelines;
        return JSON.stringify(lsTimelines, null, 2)
    }, [])

    const onClickKeepDisk = () => {
        saveDataToLocalStorage({ force: true })
        closeDialog(dialogId)
    }

    const onClickLocalStorage = () => {
        saveDataToDisk({ force: true, reloadOnSuccess: true })
        closeDialog(dialogId);
    }

    return (
        <div className="w-auto">
            {/* Header */}
            <div className="w-full flex flex-row ">
                <div className='flex h-auto m-9'>
                    <svg className='animate-ping absolute fill-red-600' width="60" height="60" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8.4449 0.608765C8.0183 -0.107015 6.9817 -0.107015 6.55509 0.608766L0.161178 11.3368C-0.275824 12.07 0.252503 13 1.10608 13H13.8939C14.7475 13 15.2758 12.07 14.8388 11.3368L8.4449 0.608765ZM7.4141 1.12073C7.45288 1.05566 7.54712 1.05566 7.5859 1.12073L13.9798 11.8488C14.0196 11.9154 13.9715 12 13.8939 12H1.10608C1.02849 12 0.980454 11.9154 1.02018 11.8488L7.4141 1.12073ZM6.8269 4.48611C6.81221 4.10423 7.11783 3.78663 7.5 3.78663C7.88217 3.78663 8.18778 4.10423 8.1731 4.48612L8.01921 8.48701C8.00848 8.766 7.7792 8.98664 7.5 8.98664C7.2208 8.98664 6.99151 8.766 6.98078 8.48701L6.8269 4.48611ZM8.24989 10.476C8.24989 10.8902 7.9141 11.226 7.49989 11.226C7.08567 11.226 6.74989 10.8902 6.74989 10.476C6.74989 10.0618 7.08567 9.72599 7.49989 9.72599C7.9141 9.72599 8.24989 10.0618 8.24989 10.476Z" fillRule="evenodd" clipRule="evenodd"></path></svg>
                    <svg className=' fill-red-600' width="60" height="60" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8.4449 0.608765C8.0183 -0.107015 6.9817 -0.107015 6.55509 0.608766L0.161178 11.3368C-0.275824 12.07 0.252503 13 1.10608 13H13.8939C14.7475 13 15.2758 12.07 14.8388 11.3368L8.4449 0.608765ZM7.4141 1.12073C7.45288 1.05566 7.54712 1.05566 7.5859 1.12073L13.9798 11.8488C14.0196 11.9154 13.9715 12 13.8939 12H1.10608C1.02849 12 0.980454 11.9154 1.02018 11.8488L7.4141 1.12073ZM6.8269 4.48611C6.81221 4.10423 7.11783 3.78663 7.5 3.78663C7.88217 3.78663 8.18778 4.10423 8.1731 4.48612L8.01921 8.48701C8.00848 8.766 7.7792 8.98664 7.5 8.98664C7.2208 8.98664 6.99151 8.766 6.98078 8.48701L6.8269 4.48611ZM8.24989 10.476C8.24989 10.8902 7.9141 11.226 7.49989 11.226C7.08567 11.226 6.74989 10.8902 6.74989 10.476C6.74989 10.0618 7.08567 9.72599 7.49989 9.72599C7.9141 9.72599 8.24989 10.0618 8.24989 10.476Z" fillRule="evenodd" clipRule="evenodd"></path></svg>
                </div>
                <div className="gap-2 mr-4 h-auto my-auto flex flex-col">
                    <AlertDialogTitle>
                        Data Sync Conflict Detected!
                    </AlertDialogTitle>
                    <AlertDialogDescription className="my-0 py-0 text-xs font-roboto-mono">
                            A conflict between local storage data and disk data has been found. <br/>
                            project name: <span className="text-red-500">{projectName}</span>
                    </AlertDialogDescription>
                </div>
            </div>
            {/* Content */}
            <div className="p-4 pt-0 ">
                <div className="w-full flex flex-col border border-neutral-800  rounded-2xl">
                    {/* Titles */}
                    <div className="flex flex-row w-full py-3 text-neutral-300 text-sm">
                        <div className="flex flex-row gap-2 w-1/2 justify-center">
                            <HardDrive size={20} />
                            <p className="font-roboto-mono">Disk Data <span className="text-xs text-neutral-500">{`(old)`}</span></p>
                        </div>
                        <div className="flex flex-row gap-2 w-1/2 justify-center ">
                            <Server size={20} />
                            <p className="font-roboto-mono">Local Storage Data <span className="text-xs text-neutral-500">{`(new)`}</span></p>
                        </div>
                    </div>
                    {/* Data Difs */}
                    <div className="max-h-[500px] bg-neutral-950 overflow-y-scroll! text-xs">
                        {
                        // @ts-expect-error
                        (<ReactDiffViewer
                                styles={defaultStyles}
                                oldValue={diskTimelinesString}
                                newValue={lsTimelinesString}
                                splitView={true}
                            />
                        )}
                    </div>
                    {/* Buttons */}
                    <div className="flex flex-row py-3 justify-items-center">
                        <div className="w-1/2 flex h-full">
                            <Button variant="error" className="m-auto w-52 bg-red-950 border-red-900 hover:bg-red-950" onClick={onClickKeepDisk}>
                                <p className="font-roboto-mono text-xs text-neutral-200">Keep Disk Data</p>
                            </Button>
                        </div>
                        <div className="w-1/2 flex">
                            <Button variant="error" className="mx-auto w-52 bg-red-950 border-red-900 hover:bg-red-950" onClick={onClickLocalStorage}>
                                <p className="font-roboto-mono text-xs text-neutral-200">Keep Local Storage Data</p>
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
