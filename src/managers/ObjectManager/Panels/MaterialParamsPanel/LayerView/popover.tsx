import { PopoverContent } from '@vxengine/ui/foundations';
import { LayerMaterial } from '@vxengine/vxobject/layerMaterials';
import { LayerProps } from '@vxengine/vxobject/layerMaterials/types';
import { Matcap } from '@vxengine/vxobject/layerMaterials/vanilla';
import React, { useEffect } from 'react'
import * as THREE from "three"
import { LAYER_PARAMS } from './maps';
import ParamInput from '@vxengine/ui/components/ParamInput';

const LayerPopoverContent = ({layer, index, vxobject}: LayerProps) => {
    const refObject = vxobject.ref.current as THREE.Mesh | THREE.Material;
    const currentPath = `layers.${index}`

    const isMatcap = layer.name === "Matcap";
    
    return (
        <PopoverContent className='w-[200px] mr-2 pt-1' side="left" align='start'>
            <p className='text-white antialiased text-xs font-semibold font-roboto-mono text-center '>{layer.name} Layer</p>
            <div className='flex flex-col gap-1 w-full pt-1'>
                {isMatcap && <MatcapImageViewer layer={layer as Matcap & { map: THREE.Texture }}/>}
                {LAYER_PARAMS[layer.name]?.map((param, index) => 
                    <ParamInput  
                        param={{
                            ...param,
                            propertyPath: `${currentPath}.${param.propertyPath}`
                        }}
                        vxkey={vxobject.vxkey} 
                        vxRefObj={vxobject.ref}
                        titleClassname='!text-label-secondary'
                    />
                )}
            </div>
        </PopoverContent>
    )
}

export default LayerPopoverContent




const MatcapImageViewer = ({layer}: {layer: Matcap & { map: THREE.Texture }}) => {
    const imgRef = React.useRef<HTMLImageElement>(null);

    useEffect(() => {
        if (imgRef.current && layer && layer.map && layer.map.source && layer.map.source.data instanceof HTMLImageElement) {
            const textureImage = layer.map.source.data as HTMLImageElement;
            imgRef.current.src = textureImage.src;
            // You might want to set width/height based on textureImage.naturalWidth/Height
            // or use CSS to control the size.
            // For example:
            // imgRef.current.width = textureImage.naturalWidth;
            // imgRef.current.height = textureImage.naturalHeight;
        } else if (imgRef.current && layer && layer.map && layer.map.image instanceof HTMLImageElement) {
            // Fallback for textures where .image is the HTMLImageElement
            const textureImage = layer.map.image as HTMLImageElement;
            imgRef.current.src = textureImage.src;
        }
    }, [layer]);

    if (!layer || !layer.map || (!layer.map.source?.data && !layer.map.image)) {
        return <p className='text-xs text-red-600 font-semibold text-center'>No Matcap Texture Loaded</p>;
    }

    // Check if the source data or image is an HTMLImageElement
    const isImageDataAvailable = (layer.map.source?.data instanceof HTMLImageElement) || (layer.map.image instanceof HTMLImageElement);

    if (!isImageDataAvailable) {
        // Handle cases where data is not an HTMLImageElement (e.g., ImageBitmap, DataTexture, etc.)
        // You might need a canvas to render these, or display a message.
        return <p className='text-xs text-neutral-500 text-center'>Unsupported texture format</p>;
    }

    return (
        <img ref={imgRef} alt={`${layer.name} Matcap Texture`} className='shadow-xl shadow-black/20 rounded-lg border border-primary-opaque'/>
    );
}
