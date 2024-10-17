import { Button } from "@vxengine/components/shadcn/button"
import CollapsiblePanel from "@vxengine/components/ui/CollapsiblePanel"
import React, { useMemo, useRef } from "react"
import { useSourceManagerAPI } from "./store"
import { useAnimationEngineAPI } from "@vxengine/AnimationEngine"
import HardDrive from '@geist-ui/icons/hardDrive'
import Server from '@geist-ui/icons/server'

export const SourceManagerUI = () => {
    const saveToDisk = useSourceManagerAPI(state => state.saveDataToDisk)

    return (
        <CollapsiblePanel
            title='Source Manager'
        >
            <div className="flex flex-col gap-2">
                <Button onClick={saveToDisk} variant='default' className="mx-auto" size="sm">
                    <p className="text-xs font-sans-menlo">
                        Save to Disk
                    </p>
                </Button>
                <Button variant='default' className="mx-auto" size="sm">
                    <p className="text-xs font-sans-menlo">
                        Save to LS
                    </p>
                </Button>
                <Button variant='default' className="mx-auto" size="sm">
                    <p className="text-xs font-sans-menlo">
                        Sync Data
                    </p>
                </Button>
            </div>
        </CollapsiblePanel>
    )
}

export const DataSyncPopup = () => {
    const diskData = useAnimationEngineAPI(state => state.timelines)

    const overwriteLocalStorageData = useSourceManagerAPI(state => state.overwriteLocalStorageData)
    const overwriteDiskData = useSourceManagerAPI(state => state.overwriteDiskData);
    const setShowSyncPopup = useSourceManagerAPI(state => state.setShowSyncPopup)

    const localStorageData = useMemo(() => {
        return JSON.parse(localStorage.getItem("timelines"))
    }, [])

    const diskDataElementRef = useRef();
    const lsDataElementRef = useRef();

    const handleOnScrollLeft = (e: React.UIEvent<HTMLDivElement, UIEvent>) => {
        const scrollContainer = e.target;

        // @ts-expect-error
        lsDataElementRef.current.scrollTop = scrollContainer.scrollTop
    }
    const handleOnScrollRight = (e: React.UIEvent<HTMLDivElement, UIEvent>) => {
        const scrollContainer = e.target;

        // @ts-expect-error
        diskDataElementRef.current.scrollTop = scrollContainer.scrollTop
    }

    const onClickKeepDisk = () => {
        const timelines = useAnimationEngineAPI.getState().timelines
        overwriteLocalStorageData(timelines)
        setShowSyncPopup(false)
    }

    const onClickLocalStorage = () => {
        overwriteDiskData(localStorageData)
        setShowSyncPopup(false);
    }

    return (
        <div className={`fixed z-50 top-0 left-0 w-full h-full bg-black bg-opacity-50 flex`}>
            <div className={`w-auto h-auto m-auto px-8 py-6 bg-neutral-950 bg-opacity-80 border border-neutral-600 border-opacity-80 rounded-3xl
                             flex flex-col
            `}>
                <div className="w-full flex flex-row mb-10">
                    <div className='flex ml-2 h-auto mx-5 pr-5 mb-auto mt-5'>
                        <svg className='animate-ping absolute fill-red-600' width="60" height="60" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8.4449 0.608765C8.0183 -0.107015 6.9817 -0.107015 6.55509 0.608766L0.161178 11.3368C-0.275824 12.07 0.252503 13 1.10608 13H13.8939C14.7475 13 15.2758 12.07 14.8388 11.3368L8.4449 0.608765ZM7.4141 1.12073C7.45288 1.05566 7.54712 1.05566 7.5859 1.12073L13.9798 11.8488C14.0196 11.9154 13.9715 12 13.8939 12H1.10608C1.02849 12 0.980454 11.9154 1.02018 11.8488L7.4141 1.12073ZM6.8269 4.48611C6.81221 4.10423 7.11783 3.78663 7.5 3.78663C7.88217 3.78663 8.18778 4.10423 8.1731 4.48612L8.01921 8.48701C8.00848 8.766 7.7792 8.98664 7.5 8.98664C7.2208 8.98664 6.99151 8.766 6.98078 8.48701L6.8269 4.48611ZM8.24989 10.476C8.24989 10.8902 7.9141 11.226 7.49989 11.226C7.08567 11.226 6.74989 10.8902 6.74989 10.476C6.74989 10.0618 7.08567 9.72599 7.49989 9.72599C7.9141 9.72599 8.24989 10.0618 8.24989 10.476Z" fill-rule="evenodd" clip-rule="evenodd"></path></svg>
                        <svg className=' fill-red-600' width="60" height="60" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8.4449 0.608765C8.0183 -0.107015 6.9817 -0.107015 6.55509 0.608766L0.161178 11.3368C-0.275824 12.07 0.252503 13 1.10608 13H13.8939C14.7475 13 15.2758 12.07 14.8388 11.3368L8.4449 0.608765ZM7.4141 1.12073C7.45288 1.05566 7.54712 1.05566 7.5859 1.12073L13.9798 11.8488C14.0196 11.9154 13.9715 12 13.8939 12H1.10608C1.02849 12 0.980454 11.9154 1.02018 11.8488L7.4141 1.12073ZM6.8269 4.48611C6.81221 4.10423 7.11783 3.78663 7.5 3.78663C7.88217 3.78663 8.18778 4.10423 8.1731 4.48612L8.01921 8.48701C8.00848 8.766 7.7792 8.98664 7.5 8.98664C7.2208 8.98664 6.99151 8.766 6.98078 8.48701L6.8269 4.48611ZM8.24989 10.476C8.24989 10.8902 7.9141 11.226 7.49989 11.226C7.08567 11.226 6.74989 10.8902 6.74989 10.476C6.74989 10.0618 7.08567 9.72599 7.49989 9.72599C7.9141 9.72599 8.24989 10.0618 8.24989 10.476Z" fill-rule="evenodd" clip-rule="evenodd"></path></svg>
                    </div>
                    <div className="gap-2 flex flex-col">
                        <h1 className="text-lg text-neutral-200 font-semibold font-sans-menlo">Data Sync Conflict Detected!</h1>
                        <p className="text-xs text-neutral-400 font-sans-menlo">A conflict between the local storage data and the disk data has been found.</p>
                    </div>
                </div>
                <div className="w-full flex flex-row gap-4 ">
                    {/* Data */}
                    <div className="flex flex-col gap-2">
                        <div className="flex flex-row gap-2 text-neutral-200">
                            <HardDrive/>
                            <p className="font-sans-menlo">Disk Data</p>
                        </div>
                        <div className="w-96 max-h-[500px] overflow-scroll border rounded-2xl p-5 border-neutral-300 border-opacity-10 "
                            ref={diskDataElementRef}
                            onScroll={handleOnScrollLeft}
                        >
                            <pre
                                style={{
                                    overflowY: 'scroll',
                                    whiteSpace: 'pre-wrap',
                                }}
                                className="text-xs text-neutral-200 font-sans-menlo"
                            >
                                {JSON.stringify(diskData, null, 2)}
                            </pre>
                        </div>

                        <Button variant="error" className="mx-8" onClick={onClickKeepDisk}>
                            <p className="font-sans-menlo">Keep Disk Data</p>
                        </Button>
                    </div>
                    <div className="flex flex-col gap-2">
                        <div className="flex flex-row gap-2 text-neutral-200">
                            <Server/>
                            <p className="font-sans-menlo">Local Storage Data</p>
                        </div>
                        <div className="w-96 max-h-[500px] overflow-scroll border rounded-2xl p-5 border-neutral-300 border-opacity-10 "
                            ref={lsDataElementRef}
                            onScroll={handleOnScrollRight}
                        >
                            <pre
                                style={{
                                    overflowY: 'scroll',
                                    whiteSpace: 'pre-wrap',
                                }}
                                className="text-xs text-neutral-200 font-sans-menlo"
                            >
                                {JSON.stringify(localStorageData, null, 2)}
                            </pre>
                        </div>
                        <Button variant="error" className="mx-8" onClick={onClickLocalStorage}>
                            <p className="font-sans-menlo">Keep Local Storage Data</p>
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}