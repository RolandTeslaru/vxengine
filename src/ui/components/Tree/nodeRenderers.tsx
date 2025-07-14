import { vxObjectProps } from '@vxengine/managers/ObjectManager/types/objectStore'
import React from 'react'
import ParamInput from '../ParamInput'
import { TreeNodeType } from './types'
import JsonView from 'react18-json-view'
import { ContextMenuContent } from '@vxengine/ui/foundations/contextMenu'

export const paramRendererWithVxObject = (vxobject: {vxkey: string, ref: React.RefObject<any>}, node: TreeNodeType, { NodeTemplate }) => {
    if (node.data)
        return (
            <NodeTemplate className="hover:bg-neutral-950/40 px-2">
                <div className={`flex ${node?.data?.param?.type !== "slider" ? "flex-row" : "flex-col"} w-full min-h-[22px]`}>
                    {node.data.param && (
                        <ParamInput
                            vxkey={vxobject.vxkey}
                            vxRefObj={vxobject.ref}
                            param={node.data.param}
                            className=""
                        />
                    )}
                </div>
            </NodeTemplate>
        )
    else return (
        <NodeTemplate className="hover:bg-neutral-950/40 px-2">
            <div className={`flex flex-row w-full min-h-[22px]`}>
                <p className={`text-xs w-auto mr-auto my-auto font-light text-label-quaternary`}>
                    {node.key}
                </p>
            </div>
        </NodeTemplate>
    )
}

export const paramRenderer = (node: TreeNodeType, { NodeTemplate }) => {
    if (node.data)
        return (
            <NodeTemplate className="hover:bg-neutral-950/40 px-2">
                <div className={`flex ${node?.data?.param?.type !== "slider" ? "flex-row" : "flex-col"} w-full min-h-[22px]`}>
                    {/* {node.data.param.type !== "slider" &&
                        <p className={`text-xs w-auto mr-auto my-auto font-light text-label-quaternary`}>
                            {node.key}
                        </p>
                    } */}
                    {node.data.param && (
                        <ParamInput
                            vxkey={node.data.vxobject.vxkey}
                            vxRefObj={node.data.vxobject.ref}
                            param={node.data.param}
                            className=""
                        />
                    )}
                </div>
            </NodeTemplate>
        )
    else return (
        <NodeTemplate className="hover:bg-neutral-950/40 px-2">
            <div className={`flex flex-row w-full min-h-[22px]`}>
                <p className={`text-xs w-auto mr-auto my-auto font-light text-label-quaternary`}>
                    {node.key}
                </p>
            </div>
        </NodeTemplate>
    )
}


const ParamContextMenuContent = ({ node }: { node: TreeNodeType }) => {
    return (
        <ContextMenuContent>
            <JsonView src={node.data} />
        </ContextMenuContent>
    )
}