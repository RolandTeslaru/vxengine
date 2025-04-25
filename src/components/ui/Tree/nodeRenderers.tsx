import { vxObjectProps } from '@vxengine/managers/ObjectManager/types/objectStore'
import React from 'react'
import ParamInput from '../ParamInput'
import { TreeNodeType } from './types'

export const paramRendererWithVxObject = (vxobject: vxObjectProps, node: TreeNodeType, { NodeTemplate }) => {
    return (
        <NodeTemplate className="hover:bg-neutral-950/40 px-2">
            <div className='flex flex-row w-full h-[22px]'>
                <p className={`text-xs my-auto font-light text-neutral-400`}>
                    {node.key}
                </p>
            </div>
            {node?.data?.param &&
                <div className='absolute right-1'>
                    <ParamInput
                        vxkey={vxobject.vxkey}
                        vxRefObj={vxobject.ref}
                        param={node.data.param}
                    />
                </div>
            }
        </NodeTemplate>
    )
}

export const paramRenderer = (node: TreeNodeType, { NodeTemplate }) => {
    return (
        <NodeTemplate className="hover:bg-neutral-950/40 px-2">
            <div className='flex flex-row w-full h-[22px]'>
                <p className={`text-xs my-auto font-light text-neutral-400`}>
                    {node.key}
                </p>
            </div>
            {node?.data?.param &&
                <div className='absolute right-1'>
                    <ParamInput
                        vxkey={node.data.vxobject.vxkey}
                        vxRefObj={node.data.vxobject.ref}
                        param={node.data.param}
                    />
                </div>
            }
        </NodeTemplate>
    )
}
