import React, { useEffect, useState } from 'react'
import { useVXObjectStore } from '../../stores/objectStore'
import { useObjectManagerAPI } from '../../stores/managerStore'
import CollapsiblePanel from '@vxengine/ui/components/CollapsiblePanel'
import Tree from '@vxengine/ui/components/Tree'
import { RenderNodeContentProps } from '@vxengine/ui/components/Tree/types'
import { ContextMenu, ContextMenuTrigger } from '@vxengine/ui/foundations'
import { ObjectTreeNodeProps } from '@vxengine/types/objectEditorStore'
import classNames from 'classnames'
import { handleOnVxObjectClick, handleOnVxObjectContextMenu } from '../../utils/handleVxObject'
import ICON_MAP from './icons'
import { OBJECT_TREE_CONTEXT_MENUS } from './contextMenus'
import Search from '@vxengine/ui/components/Search'
import { vxengine } from '@vxengine/singleton'

interface ObjectTreeNode {
    vxkey: string
    name: string
    type: string
    children: Record<string, ObjectTreeNode>
    isSelectable: boolean
}

const defaultExpandedKeys = {
    scene: {},
    splines: {},
    effects: {},
    environment: {},
    materials: {}
}

const ObjectTree = () => {
    const objectsLength = useVXObjectStore(state => Object.entries(state.objects).length)
    const tree = useObjectManagerAPI(state => state.tree);

    const [searchQuery, setSearchQuery] = useState("");

    // useEffect( () => {
    //     const unsubscribe = useObjectManagerAPI.subscribe((state, prevState) => {
    //         if(state.selectedObjectKeys.length !== prevState.selectedObjectKeys.length){
    //             const lastSelectObjectKey = state.selectedObjectKeys.at(-1);                
    //         }
    //     })

    //     return () => unsubscribe();
    // }, [])

    return (
        <CollapsiblePanel
            title="Object Tree"
            noPadding={true}
            contentClassName='pb-0 px-0! gap-2'
            icon={ICON_MAP["Tree"]}
            iconClassName='!text-neutral-400'
        >
            {/* Head */}
            <div className='text-xs flex flex-row px-2 text-label-quaternary w-full'>
                <p className='mr-auto text-xs font-light' style={{ fontSize: "10px" }}>
                    {objectsLength} objects
                </p>
                <Search searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
            </div>
            {/* Content */}
            <div className='max-h-[550px] rounded-b-xl overflow-y-scroll text-sm'>
                <Tree 
                    defaultExpandedKeys={defaultExpandedKeys} 
                    tree={tree as any} 
                    renderNodeContent={renderNodeContent} 
                    size='md' 
                />
            </div>
            {vxengine.isProduction &&
                <div>
                    <p className='text-xs text-center font-roboto-mono text-red-600'>
                        Object Tree is not generated in Production Mode!
                    </p>
                </div>
            }
        </CollapsiblePanel>
    )
}

export default ObjectTree


const renderNodeContent: RenderNodeContentProps = (node, { NodeTemplate }) => <ObjectTreeNode node={node} NodeTemplate={NodeTemplate} />


const ObjectTreeNode = ({ node, NodeTemplate }: { node: ObjectTreeNodeProps, NodeTemplate: React.FC<any> }) => {
    const vxkey = node.key
    const isSelected = useObjectManagerAPI(state => state.selectedObjectKeys.includes(vxkey));

    const ContextMenuContentComponent = 
        OBJECT_TREE_CONTEXT_MENUS[node.type] || OBJECT_TREE_CONTEXT_MENUS.default

    return (
        <ContextMenu>
            <ContextMenuTrigger className='w-full'>
                <NodeTemplate className={
                    classNames(
                        "text-label-tertiary ",
                        { "bg-blue-600! !text-neutral-200": isSelected === true },
                        { "hover:bg-blue-800": node.isSelectable }
                    )}
                    listClassNames={classNames(
                        {"bg-neutral-800 text-white":isSelected === true}
                    )}
                    onClick={(e) => handleOnVxObjectClick(e,vxkey)}
                    onContextMenu={(e) => handleOnVxObjectContextMenu(e, vxkey)}
                >
                    <div className='flex flex-row w-full gap-2 &:hover:text-neutral-200 '>
                        <span> {ICON_MAP[node.type]} </span>
                        <p className={`text-xs font-medium antialiased text-nowrap`}>
                            {node.name}
                        </p>
                    </div>
                </NodeTemplate>
            </ContextMenuTrigger>
            <ContextMenuContentComponent vxkey={vxkey}/>
        </ContextMenu>
    )
}