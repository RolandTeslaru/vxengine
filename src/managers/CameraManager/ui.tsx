import React from 'react'
import { useCameraManagerAPI } from './store'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/shadcn/tabs"

const CameraManagerUI = () => {
    const mode = useCameraManagerAPI(state => state.mode)
    const setMode = useCameraManagerAPI(state => state.setMode)

    return (
        <div className={`fixed w-[240px] bg-neutral-900 bg-opacity-70 backdrop-blur-sm border-neutral-400 border-opacity-20 border-[1px] rounded-3xl
                         top-6 right-6 flex flex-row pl-2 pr-1 py-1 shadow-md shadow-neutral-950`}>
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
        </div>
    )
}

export default CameraManagerUI
