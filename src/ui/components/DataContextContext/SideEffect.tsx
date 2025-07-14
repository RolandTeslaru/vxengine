import animationEngineInstance from '@vxengine/singleton';
import React from 'react'

const SideEffectData = ({ trackKey }: { trackKey: string }) => {
    
    const sideEffect = animationEngineInstance
                        .propertyControlService
                        .getSideEffect(trackKey);

    const data = {
        callback: sideEffect.toString()
    }
    return (
        <div className='flex flex-col'>
            <p className='font-roboto-mono text-xs text-center text-label-primary'>SideEffect Data</p>
            <div className='max-h-[70vh] overflow-y-scroll flex flex-col w-full mt-2 text-xs bg-neutral-900 p-1 rounded-md shadow-lg'>
                <pre className='font-roboto-mono'>
                    <code className="whitespace-pre-wrap">{sideEffect.toString()}</code>
                </pre>
            </div>
        </div>
    )
}

export default SideEffectData