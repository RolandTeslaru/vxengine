import React from 'react'
import { useCameraManagerAPI } from './store'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../ui/foundations/tabs"
import { StandardWindowStyling, VXEngineWindow } from '@vxengine/ui/components/VXEngineWindow';

const CameraManagerUI = () => {
    const mode = useCameraManagerAPI(state => state.mode);
    const setMode = useCameraManagerAPI(state => state.setMode)
    const cameraCanvasPreviewRef = useCameraManagerAPI(state => state.cameraCanvasPreviewRef)


    return (
        <>
            <StandardWindowStyling
                className='top-6 right-6 w-[240px] px-2! py-1! flex-row!'
                style={{ boxShadow: "0 4px 15px -3px rgb(0 0 0 / 0.6), 0 1px 6px -2px rgb(0 0 0 / 0.6" }}
            >
                <p className='font-roboto-mono font-semibold antialiased text-xs my-auto mx-auto h-auto text-label-primary'>Camera</p>
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
            </StandardWindowStyling>

            <VXEngineWindow
                vxWindowId='cameraPreview'
                title="VXStudio: Camera Preview"
                windowClasses='top=0, left=0'
                className={`bottom-5 left-[280px] min-w-[350px] !p-0 ${mode === "attached" && "hidden"} resize-x overflow-hidden !rounded-md !border-0`}
                detachedClassName={"!h-full !w-full !left-0 !bottom-0"}
            >
                <canvas 
                    ref={cameraCanvasPreviewRef}
                    style={{
                        display:         'block',
                        transform:       'scaleY(-1)',
                        transformOrigin: 'center center',
                      }}
                    className="z-[-1] h-auto w-full mx-auto"
                />
            </VXEngineWindow>
        </>
    )
}

export default CameraManagerUI
