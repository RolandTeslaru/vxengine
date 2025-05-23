import React, { useCallback, useEffect, useMemo, useState } from 'react'
import * as THREE from "three"
import CollapsiblePanel from '@vxengine/core/components/CollapsiblePanel';
import ParamInput from '@vxengine/components/ui/ParamInput';
import Search from '@vxengine/components/ui/Search';
import { vxObjectProps } from '../types/objectStore';
import Tree from '@vxengine/components/ui/Tree';
import { getValueType, ParamTreeNodeDataType, TreeNodeType } from '../utils/createPropertyTree';
import { VXElementParam, VXElementParams } from '@vxengine/vxobject/types';
import { CreateNodeDataFnType } from '@vxengine/components/ui/Tree/types';
import { paramRendererWithVxObject } from '@vxengine/components/ui/Tree/nodeRenderers';
import { ScrollArea } from '@vxengine/components/shadcn/scrollArea';
import { Abstract, LayerMaterial, Matcap } from '@vxengine/vxobject/layerMaterials/vanilla';
import { Popover, PopoverContent, PopoverTrigger } from '@vxengine/components/shadcn/popover';


interface MaterialParamNodeProps extends TreeNodeType {
    data: {
        param: VXElementParam
        vxobject: vxObjectProps
        type: "number" | "color"
    }
}

const MATERIAL_TITLES = {
    "MeshStandardMaterial": "Standard Material",
    "MeshPhysicalMaterial": "Physical Material",
    "MeshPhongMaterial": "Phong Material",
    "MeshLambertMaterial": "Lambert Material",
    "MeshDepthMaterial": "Depth Material",
    "MeshBasicMaterial": "Basic Material",
    "MeshToonMaterial": "Toon Material",
    "ShaderMaterial": "Shader Material",
}

const MATERIAL_PARAM_TREE_TYPES = {
    "MeshStandardMaterial": {
        "color": { key: "color", currentPath: "color", data: { param: { propertyPath: "material.color", type: "color", title: "Color" } } },
        "emissive": { key: "emissive", currentPath: "emissive", data: { param: { propertyPath: "material.emissive", type: "color", title: "Emissive" } } },
        "roughness": { key: "roughness", currentPath: "roughness", data: { param: { propertyPath: "material.roughness", type: "number", title: "Roughness" } } },
        "metalness": { key: "metalness", currentPath: "metalness", data: { param: { propertyPath: "material.metalness", type: "number", title: "Metalness" } } },
        "opacity": { key: "opacity", currentPath: "opacity", data: { param: { propertyPath: "material.opacity", type: "number", title: "Opacity" } } },
    },
    "MeshPhysicalMaterial": {
        "color": { key: "color", currentPath: "color", data: { param: { propertyPath: "material.color", type: "color", title: "Color" } } },
        "emissive": { key: "emissive", currentPath: "emissive", data: { param: { propertyPath: "material.emissive", type: "color", title: "Emissive" } } },
        "roughness": { key: "roughness", currentPath: "roughness", data: { param: { propertyPath: "material.roughness", type: "slider", min:0, max: 1, step: 0.01, title: "roughness" } } },
        "transmission": { key: "transmission", currentPath: "transmission", data: { param: { propertyPath: "material.transmission", type: "slider", min: 0, max: 1, step: 0.01, title: "transmission" } } },
        "metalness": { key: "metalness", currentPath: "metalness", data: { param: { propertyPath: "material.metalness", type: "slider", min: 0, max: 1, step: 0.01, title: "metalness" } } },
        "thickness": { key: "thickness", currentPath: "thickness", data: { param: { propertyPath: "material.thickness", type: "slider", min: 0, max: 10, step: 0.01, title: "thickness" } } },
        "ior": { key: "ior", currentPath: "ior", data: { param: { propertyPath: "material.ior", type: "slider", min: 0, max: 10, step: 0.01, title: "Refraction / IOR" } } },
        "opacity": { key: "opacity", currentPath: "opacity", data: { param: { propertyPath: "material.opacity", type: "number", title: "Opacity" } } },
        "reflectivity": { key: "reflectivity", currentPath: "reflectivity", data: { param: { propertyPath: "material.reflectivity", type: "number", title: "Reflectivity" } } },
        "iridescence": { key: "iridescence", currentPath: "iridescence", data: { param: { propertyPath: "material.iridescence", type: "number", title: "Iridescence" } } },
        "iridescenceIOR": { key: "iridescenceIOR", currentPath: "iridescenceIOR", data: { param: { propertyPath: "material.iridescenceIOR", type: "number", title: "Iridescence IOR" } } },
        "sheenRoughness": { key: "sheenRoughness", currentPath: "sheenRoughness", data: { param: { propertyPath: "material.sheenRoughness", type: "number", title: "Sheen Roughness" } } },
        "sheenColor": { key: "sheenColor", currentPath: "sheenColor", data: { param: { propertyPath: "material.sheenColor", type: "color", title: "Sheen Color" } } },
        "clearcoat": { key: "clearcoat", currentPath: "clearcoat", data: { param: { propertyPath: "material.clearcoat", type: "number", title: "Clearcoat" } } },
        "clearcoatRoughness": { key: "clearcoatRoughness", currentPath: "clearcoatRoughness", data: { param: { propertyPath: "material.clearcoatRoughness", type: "number", title: "Clearcoat Roughness" } } },
        "specularIntensity": { key: "specularIntensity", currentPath: "specularIntensity", data: { param: { propertyPath: "material.specularIntensity", type: "number", title: "Specular Intensity" } } },
        "specularColor": { key: "specularColor", currentPath: "specularColor", data: { param: { propertyPath: "material.specularColor", type: "color", title: "Specular Color" } } },
    },
    "MeshPhongMaterial": {
        "color": { key: "color", currentPath: "color", data: { param: { propertyPath: "material.color", type: "color", title: "Color" } } },
        "emissive": { key: "emissive", currentPath: "emissive", data: { param: { propertyPath: "material.emissive", type: "color", title: "Emissive" } } },
        "specular": { key: "specular", currentPath: "specular", data: { param: { propertyPath: "material.specular", type: "color", title: "Specular" } } },
        "shininess": { key: "shininess", currentPath: "shininess", data: { param: { propertyPath: "material.shininess", type: "number", title: "Shininess" } } },
        "opacity": { key: "opacity", currentPath: "opacity", data: { param: { propertyPath: "material.opacity", type: "number", title: "Opacity" } } },
    },
    "MeshMatcapMaterial": {
        "color": { key: "color", currentPath: "color", data: { param: { propertyPath: "material.color", type: "color", title: "Color" } } },
    },
    "MeshLambertMaterial": {
        "color": { key: "color", currentPath: "color", data: { param: { propertyPath: "material.color", type: "color", title: "Color" } } },
        "emissive": { key: "emissive", currentPath: "emissive", data: { param: { propertyPath: "material.emissive", type: "color", title: "Emissive" } } },
        "opacity": { key: "opacity", currentPath: "opacity", data: { param: { propertyPath: "material.opacity", type: "number", title: "Opacity" } } },
        "reflectivity": { key: "reflectivity", currentPath: "reflectivity", data: { param: { propertyPath: "material.reflectivity", type: "number", title: "Reflectivity" } } },
        "refractionRatio": { key: "refractionRatio", currentPath: "refractionRatio", data: { param: { propertyPath: "material.refractionRatio", type: "number", title: "Refraction Ratio" } } },
    },
    "MeshDepthMaterial": {},
    "MeshBasicMaterial": {
        "color": { key: "color", currentPath: "color", data: { param: { propertyPath: "material.color", type: "color", title: "Color" } } },
        "reflectivity": { key: "reflectivity", currentPath: "reflectivity", data: { param: { propertyPath: "material.reflectivity", type: "number", title: "Reflectivity" } } },
        "refractionRatio": { key: "refractionRatio", currentPath: "refractionRatio", data: { param: { propertyPath: "material.refractionRatio", type: "number", title: "Refraction Ratio" } } },
    },
    "MeshToonMaterial": {
        "color": { key: "color", currentPath: "color", data: { param: { propertyPath: "material.color", type: "color", title: "Color" } } },
        "opacity": { key: "opacity", currentPath: "opacity", data: { param: { propertyPath: "material.opacity", type: "number", title: "Opacity" } } },
    },
    "ShaderMaterial": {

    },
    default: {}
}

const MaterialParams = ({ vxobject }: { vxobject: vxObjectProps }) => {
    const refObject = (vxobject.ref.current as THREE.Mesh)
    const material = refObject.material as THREE.Material;

    const isLayerMaterial = material.name === "LayerMaterial"

    console.log("Material ", material)

    const [tree, createNodeDataFn] = useMemo(() => {
        const __createNodeDataFn: CreateNodeDataFnType = ({ key, currentPath, value, parentNode }) => ({
            param: {
                propertyPath: currentPath,
                type: getValueType(value),
                title: key
            },
            vxobject
        })

        const baseTree = MATERIAL_PARAM_TREE_TYPES[material.type as keyof typeof MATERIAL_PARAM_TREE_TYPES] as Record<string, ParamTreeNodeDataType> || {}
        if (!!(material as THREE.ShaderMaterial).uniforms) {
            baseTree["uniforms"] = { key: "uniforms", currentPath: "material.uniforms", children: null, refObject: (material as THREE.ShaderMaterial).uniforms }
        }

        if(!isLayerMaterial)
            baseTree["instance"] = { key: "instance", currentPath: "material", children: null, refObject: material }

        return [baseTree, __createNodeDataFn]
    }, [vxobject, material])


    const [searchQuery, setSearchQuery] = useState("");

    return (
        <CollapsiblePanel
            title={`${MATERIAL_TITLES[material.type as keyof typeof MATERIAL_TITLES]}`}
            defaultOpen={true}
            noPadding={true}
            contentClassName=' gap-2 min-h-0'
        >
            {isLayerMaterial &&
                <ul className='flex flex-col gap-1 p-1 px-2'>
                    {(material as LayerMaterial).layers.map((layer, index) => 
                        <LayerView layer={layer} key={index} index={index} vxobject={vxobject} />
                    ) }
                </ul>
            }
            <div className='text-xs px-2 flex flex-row text-neutral-400'>
                {/* Search input */}
                <Search className='ml-auto' searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
            </div>
            <div className='max-h-96 overflow-y-scroll'>
                <Tree
                    // @ts-ignore
                    tree={tree}
                    renderNodeContent={(node, { NodeTemplate }) => paramRendererWithVxObject(vxobject, node, { NodeTemplate })}
                    createNodeDataFn={createNodeDataFn}
                />
            </div>
        </CollapsiblePanel>
    )
}

export default MaterialParams



interface LayerProps {
    layer: Abstract;
    index: number;
    vxobject: vxObjectProps
}

const LayerView: React.FC<LayerProps> = ({layer, index, ...rest}) => {
    
    return (
        <li>
            <Popover>
                <PopoverTrigger>
                    <div className='w-full h-6 relative flex flex-row p-1 px-2 shadow-md bg-secondary-opaque hover:bg-secondary-thin rounded-lg'>
                        <p className='font-bold text-md mr-1 absolute top-1/2 -translate-y-1/2 '>{index}</p>
                        <p className='h-auto my-auto ml-5 font-roboto-mono font-normal antialiased'>
                            {layer.name}
                        </p>
                    </div>
                </PopoverTrigger>
                <LayerPopoverContent layer={layer} index={index} {...rest}/>
            </Popover>
        </li>
    )
}

const LayerPopoverContent = ({layer, index, vxobject}: LayerProps) => {
    const currentPath = `material.layers.${index}`;

    const isMatcap = layer.name === "Matcap";
    
    return (
        <PopoverContent className='w-[200px]'>
            <p className='text-white antialiased text-xs font-semibold font-roboto-mono text-center '>{layer.name} Layer</p>
            <div className='flex flex-col gap-1 w-full'>
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
        return <p className='text-xs text-neutral-500 text-center'>No Matcap Texture</p>;
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

const LAYER_PARAMS = {
    Depth: [
        { title: "intensity", propertyPath: "alpha", type: "slider", min: 0, max: 1, step: 0.01 },
        { title: "colorA", propertyPath: "colorA", type: "color" },
        { title: "colorB", propertyPath: "colorB", type: "color" },
        { title: "near", propertyPath: "near", type: "number" },
        { title: "far", propertyPath: "far", type: "number" },
    ],
    Color: [
        { title: "intensity", propertyPath: "alpha", type: "slider", min: 0, max: 1, step: 0.01 },
        { title: "color", propertyPath: "color", type: "color" },
    ],
    Displace: [
        { title: "strength", propertyPath: "strength", type: "number" },
        { title: "scale", propertyPath: "scale", type: "number" },
    ],
    Fresnel: [
        { title: "color", propertyPath: "color", type: "color" },
        { title: "intensity", propertyPath: "intensity", type: "slider", min: 0, max: 10, step: 0.01 },
        { title: "bias", propertyPath: "bias", type: "slider", min: -1, max: 1, step: 0.01 },
        { title: "power", propertyPath: "power", type: "slider", min: 0, max: 10, step: 0.01 },
        { title: "factor", propertyPath: "factor", type: "slider", min: 0, max: 10, step: 0.01 },
    ],
    Matcap: [
        { title: "intensity", propertyPath: "alpha", type: "slider", min: 0, max: 1, step: 0.01 },
    ],
    Glass: [
        { title: "Blur", propertyPath: "blur", type: "number" },
        { title: "Thickness", propertyPath: "thickness", type: "number" },
        { title: "Refraction", propertyPath: "refraction", type: "number" },
    ]
} as Record<string, VXElementParams>