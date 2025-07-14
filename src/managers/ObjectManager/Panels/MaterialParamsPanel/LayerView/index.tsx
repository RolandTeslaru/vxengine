import { invalidate } from '@react-three/fiber';
import { vxObjectProps } from '@vxengine/managers/ObjectManager/types/objectStore';
import { Popover, PopoverTrigger } from '@vxengine/ui/foundations';
import { AlertTriangle } from '@vxengine/ui/icons';
import { LayerMaterial, MaterialLayerAbstract } from '@vxengine/vxobject/layerMaterials/vanilla';
import React, { useCallback, useState } from 'react'
import LayerPopoverContent from './popover';
import ICON_MAP from '../../ObjectTreePanel/icons';

interface LayerProps {
    layer: MaterialLayerAbstract;
    index: number;
    vxobject: { ref: {current: any}, vxkey: string }
    material: LayerMaterial
}

const LayerView: React.FC<LayerProps> = (props) => {
    const {layer, index, material} = props
    const [isVisible, setIsVisible] = useState(layer.visible)

    const onVisibilityChange = useCallback((event: React.MouseEvent) => {
        event.stopPropagation()
        setIsVisible(visibility => {
            layer.visible = !visibility
            material.refresh()
            invalidate()
            return !visibility
        })

    }, [layer])

    // @ts-expect-error
    const isWarning = layer.name === "Matcap" && (!layer.map || (!layer.map?.source?.data && !layer.map?.image))

    return (
        <li>
            <Popover>
                <PopoverTrigger className='cursor-pointer'>
                    <div className='font-roboto-mono antialiased w-full h-6 relative flex flex-row p-1 px-2 shadow-md bg-secondary-opaque border border-primary-thin hover:bg-secondary-thin rounded-lg'>
                        <p className='font-bold text-md mr-1 absolute top-1/2 -translate-y-1/2 '>{index}</p>
                        <p className='h-auto my-auto ml-5 font-medium '>
                            {layer.name}
                        </p>
                        {isWarning && <>
                            <AlertTriangle size={17} className='text-red-600 font-bold absolute top-1/2 -translate-y-1/2 right-8 animate-ping'/>
                            <AlertTriangle size={17} className='text-red-600 font-bold absolute top-1/2 -translate-y-1/2 right-8 '/>
                        </>
                            }
                        <button 
                            className='absolute top-1/2 -translate-y-1/2 right-0 cursor-pointer hover:bg-neutral-700 rounded-lg p-1'
                            onClick={onVisibilityChange}
                        >
                            {isVisible ? ICON_MAP["eyeOpen"] : ICON_MAP["eyeClosed"]}
                        </button>
                    </div>
                </PopoverTrigger>
                <LayerPopoverContent {...props}/>
            </Popover>
        </li>
    )
}

export default LayerView