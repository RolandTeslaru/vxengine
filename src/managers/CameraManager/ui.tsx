import React from 'react'
import { useCameraManagerAPI } from './store'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/shadcn/tabs"

const CameraManagerUI = () => {
    const mode = useCameraManagerAPI(state => state.mode)
    const setMode = useCameraManagerAPI(state => state.setMode)

    return (
        <div className={`fixed h-[45px] w-[240px] bg-neutral-900 bg-opacity-70 backdrop-blur-sm border-neutral-800 border-[1px] rounded-3xl
                         top-6 right-6 flex flex-row pl-2 pr-1 py-1`}>
            <p className='font-sans-menlo text-sm my-auto mx-auto h-auto'>Camera</p>
            <div className='h-auto my-auto'>
                <Tabs
                    defaultValue={mode}
                >
                    <TabsList>
                        <TabsTrigger 
                            value="attached" 
                            onClick={() => setMode("attached")}
                        >
                            Attached
                        </TabsTrigger>
                        <TabsTrigger 
                            value="free" 
                            onClick={() => setMode("free")}
                        >
                            Free
                        </TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>
        </div>
    )
}

export default CameraManagerUI
