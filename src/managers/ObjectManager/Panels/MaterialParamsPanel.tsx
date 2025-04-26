import React, { useCallback, useEffect, useMemo, useState } from 'react'
import * as THREE from "three"
import CollapsiblePanel from '@vxengine/core/components/CollapsiblePanel';
import ParamInput from '@vxengine/components/ui/ParamInput';
import Search from '@vxengine/components/ui/Search';
import { vxObjectProps } from '../types/objectStore';
import Tree from '@vxengine/components/ui/Tree';
import { getValueType, ParamTreeNodeDataType, TreeNodeType } from '../utils/createPropertyTree';
import { VXElementParam } from '@vxengine/vxobject/types';
import { CreateNodeDataFnType } from '@vxengine/components/ui/Tree/types';
import { paramRendererWithVxObject } from '@vxengine/components/ui/Tree/nodeRenderers';
import { ScrollArea } from '@vxengine/components/shadcn/scrollArea';


interface MaterialParamNodeProps extends TreeNodeType {
    data: {
        param: VXElementParam
        vxobject: vxObjectProps
        type: "number" | "color"
    }
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
        "roughness": { key: "roughness", currentPath: "roughness", data: { param: { propertyPath: "material.roughness", type: "number", title: "Roughness" } } },
        "metalness": { key: "metalness", currentPath: "metalness", data: { param: { propertyPath: "material.metalness", type: "number", title: "Metalness" } } },
        "opacity": { key: "opacity", currentPath: "opacity", data: { param: { propertyPath: "material.opacity", type: "number", title: "Opacity" } } },
        "ior": { key: "ior", currentPath: "ior", data: { param: { propertyPath: "material.ior", type: "number", title: "IOR" } } },
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

        baseTree["instance"] = { key: "instance", currentPath: "", children: null, refObject: material }

        return [baseTree, __createNodeDataFn]
    }, [vxobject, material])


    const [searchQuery, setSearchQuery] = useState("");

    return (
        <CollapsiblePanel
            title={`${material.type}`}
            defaultOpen={true}
            noPadding={true}
            contentClassName=' gap-2 min-h-0'
        >
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