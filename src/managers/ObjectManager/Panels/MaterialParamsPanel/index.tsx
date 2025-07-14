import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import * as THREE from "three"
import CollapsiblePanel from '@vxengine/ui/components/CollapsiblePanel';
import { vxObjectProps } from '../../types/objectStore';
import { getValueType, ParamTreeNodeDataType, TreeNodeType } from '../../utils/createPropertyTree';
import { VXElementParam, VXElementParams } from '@vxengine/vxobject/types';
import { MaterialLayerAbstract, LayerMaterial, Matcap } from '@vxengine/vxobject/layerMaterials/vanilla';
import { invalidate } from '@react-three/fiber';
import ICON_MAP from '../ObjectTreePanel/icons';
import { CreateNodeDataFnType } from '@vxengine/ui/components/Tree/types';
import Search from '@vxengine/ui/components/Search';
import Tree from '@vxengine/ui/components/Tree';
import { Popover, PopoverContent, PopoverTrigger } from '@vxengine/ui/foundations/popover';
import ParamInput from '@vxengine/ui/components/ParamInput';
import { paramRendererWithVxObject } from '@vxengine/ui/components/Tree/nodeRenderers';
import { AlertTriangle } from '@vxengine/ui/icons';
import { MATERIAL_TITLES, MATERIALS_PARAM_MAP } from './maps';
import LayerView from './LayerView';
import { cloneDeep } from 'lodash';

interface MaterialParamNodeProps extends TreeNodeType {
    data: {
        param: VXElementParam
        vxobject: vxObjectProps
        type: "number" | "color"
    }
}


const MaterialParams = ({ vxobject }: { vxobject: vxObjectProps }) => {
    const refObject = (vxobject.ref.current)
    // If the vxmesh has a vxmaterial which is also registered in the ObjectStore and animationEngine
    // then the property path will be relative to the vxmaterial and NOT the vxmesh
    let isVXMaterialObject = false;
    let vxobjectHasVXMaterialObejct = false;

    let material: THREE.Material | LayerMaterial

    let materialVxkey = null;

    if (refObject instanceof THREE.Mesh) {
        if (refObject.material instanceof LayerMaterial) {
            vxobjectHasVXMaterialObejct = true;
            materialVxkey = refObject.material.vxkey
        }
        else {
            vxobjectHasVXMaterialObejct = false
        }
        material = refObject.material as THREE.Material | LayerMaterial
    }
    else if (refObject instanceof LayerMaterial && vxobject.type === "material") {
        isVXMaterialObject = true;
        material = refObject;
        materialVxkey = vxobject.vxkey
    }

    const [tree, createNodeDataFn, paramRenderer] = useMemo(() => {
        let __createNodeDataFn: CreateNodeDataFnType = ({ key, currentPath, value, parentNode }) => {
            return {
                param: {
                    propertyPath: currentPath,
                    type: getValueType(value),
                    title: key
                },
                vxobject
            }
        }

        let paramRenderer;

        let baseTree = MATERIALS_PARAM_MAP[material.type as keyof typeof MATERIALS_PARAM_MAP] as Record<string, ParamTreeNodeDataType> || {}
        // if the vxobject (vxmesh) has a regular material ( non LayerMaterial )
        // use the path relative to the vxobject(vxmesh)
        // Also add the instance of the normal material to the panel ( hide if its a layerMaterial)
        if (vxobjectHasVXMaterialObejct == false && isVXMaterialObject == false) {
            baseTree = generateParamTreeWithPrefixedPropertyPath(baseTree, "material")

            baseTree["instance"] = {
                key: "instance",
                currentPath: "",
                children: null,
                refObject: material
            }

            paramRenderer = (node, { NodeTemplate }) => paramRendererWithVxObject(vxobject, node, { NodeTemplate })
            
            __createNodeDataFn = ({ key, currentPath, value, parentNode }) => {
                return {
                    param: {
                        propertyPath: "material." + currentPath,
                        type: getValueType(value),
                        title: key
                    },
                    vxobject
                }
            }
        }
        // if the vxobject (vxmesh) has a LayerMaterial (VXMaterialObject)
        else if (vxobjectHasVXMaterialObejct) {
            // use the path relative to the VXMaterialObject ( use the vxkey for the VXMaterialObject (materialVxkey))
            paramRenderer = (node, { NodeTemplate }) => paramRendererWithVxObject({ vxkey: materialVxkey, ref: { current: material } }, node, { NodeTemplate })
            __createNodeDataFn = ({ key, currentPath, value, parentNode }) => {
                return {
                    param: {
                        propertyPath: currentPath,
                        type: getValueType(value),
                        title: key
                    },
                    vxobject
                }
            }
            // baseTree["uniforms"] = {
            //     key: "uniforms",
            //     currentPath: "uniforms",
            //     children: null,
            //     refObject: (material as THREE.ShaderMaterial).uniforms
            // }
        }
        // if the vxobject is a VXMaterialObject itself
        else if (isVXMaterialObject) {
            // dont do anything the currenPaths for the params is good
            paramRenderer = (node, { NodeTemplate }) => paramRendererWithVxObject(vxobject, node, { NodeTemplate })
            __createNodeDataFn = ({ key, currentPath, value, parentNode }) => {
                return {
                    param: {
                        propertyPath: currentPath,
                        type: getValueType(value),
                        title: key
                    },
                    vxobject
                }
            }
            // baseTree["uniforms"] = {
            //     key: "uniforms",
            //     currentPath: "uniforms",
            //     children: null,
            //     refObject: (material as THREE.ShaderMaterial).uniforms
            // }
        }

        return [baseTree, __createNodeDataFn, paramRenderer]
    }, [vxobject, material])


    const [searchQuery, setSearchQuery] = useState("");

    const panelTitle = `${MATERIAL_TITLES[material.type as keyof typeof MATERIAL_TITLES]}`

    return (
        <CollapsiblePanel
            title={panelTitle}
            defaultOpen={true}
            noPadding={true}
            contentClassName=' gap-2 min-h-0'
            icon={ICON_MAP["Material"]}
            iconClassName='text-purple-400'
        >
            {(isVXMaterialObject || vxobjectHasVXMaterialObejct) &&
                <ul className='flex flex-col gap-1 p-1 px-2'>
                    {(material as LayerMaterial).layers.map((layer, index) => 
                        <LayerView 
                            material={material as LayerMaterial} 
                            layer={layer} 
                            key={index} 
                            index={index} 
                            vxobject={{
                                vxkey: materialVxkey,
                                ref: { current: material }
                            }} 
                        />
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
                    renderNodeContent={paramRenderer}
                    createNodeDataFn={createNodeDataFn}
                />
            </div>
        </CollapsiblePanel>
    )
}

export default MaterialParams



const generateParamTreeWithPrefixedPropertyPath = (baseTree: any, prefix?: string) => {
    return Object.fromEntries(
        Object.entries(baseTree).map(([propKey, node]: [propKey: string, node: MaterialParamNodeProps]) => {
            // if this node has a .data.param, override its propertyPath
            if (node.data?.param) {
                const oldPath = node.data.param.propertyPath;
                const newPath = `material.${oldPath}`;

                // shallow‐clone the node and its .data.param
                const newNode: MaterialParamNodeProps = {
                    ...node,
                    currentPath: prefix ? `${prefix}.` + newPath : newPath,    // you’ll probably want to prefix here, too
                    data: {
                        ...node.data,
                        param: {
                            ...node.data.param,
                            propertyPath: newPath
                        }
                    }
                };

                return [propKey, newNode] as const;
            }

            // otherwise leave it untouched
            return [propKey, node] as const;
        })
    );
}