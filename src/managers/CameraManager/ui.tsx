import React from 'react'
import { useCameraManagerAPI } from './store'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/shadcn/tabs"
import { StandardWindowStyling } from '@vxengine/core/components/VXEngineWindow'

const CameraManagerUI = () => {
    const mode = useCameraManagerAPI(state => state.mode)
    const setMode = useCameraManagerAPI(state => state.setMode)

    return (
        <StandardWindowStyling
            className='top-6 right-6 w-[240px] px-2! py-1! flex-row!'
            style={{ boxShadow: "0 4px 15px -3px rgb(0 0 0 / 0.6), 0 1px 6px -2px rgb(0 0 0 / 0.6" }}
        >
            <p className='font-sans-menlo text-xs my-auto mx-auto h-auto'>Camera</p>
            <div className='h-auto my-auto'>
                <Tabs
                    defaultValue={mode}
                >
                    <TabsList>
                        <TabsTrigger
                            value="attached"
                            onClick={() => setMode("attached")}
                        >
                            <p className='text-xs font-sans-menlo'>
                                Attached
                            </p>
                        </TabsTrigger>
                        <TabsTrigger
                            value="free"
                            onClick={() => setMode("free")}
                        >
                            <p className='text-xs font-sans-menlo'>
                                Free
                            </p>
                        </TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>
        </StandardWindowStyling>
    )
}

export default CameraManagerUI
