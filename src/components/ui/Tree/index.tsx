import React, { useEffect, useState, memo, useRef, useCallback } from 'react'
import s from "./s.module.scss"
import classNames from 'classnames'
import { CreateNodeDataFnType, TreeNodeDataType, TreeNodeProps, TreeProps } from './types'
import { TreeCollapseButton, TreeLine, TreeLineConnect, TreeLineCorner } from './Elements'
import { ContextMenu, ContextMenuContent, ContextMenuTrigger } from '@vxengine/components/shadcn/contextMenu'
import JsonView from 'react18-json-view'
import { createBranch } from './utils'

const Tree: React.FC<TreeProps> = ({
    tree,
    defaultExpandedKeys = {},
    createNodeDataFn,
    className,
    ...restNodeProps
}) => {
    if (!tree) {
        return null
    }
    const childrenLength = Object.values(tree).length

    if (childrenLength === 0) {
        return null
    }
    return (
        <ul
            role="tree"
            className={`${s.tree_container} ${className}`}
        >
            {Object.values(tree).map((node, i) =>
                <TreeNode
                    key={node.key}
                    node={node}
                    siblings={childrenLength}
                    indexToParent={i}
                    level={0}
                    createNodeDataFn={createNodeDataFn}
                    defaultExpandedKeys={defaultExpandedKeys}
                    {...restNodeProps}
                />
            )}
        </ul>
    );
}

export default Tree


const loadBranch = (node: TreeNodeDataType, createNodeDataFn: CreateNodeDataFnType) => {
    const loadedChildren = createBranch(node, createNodeDataFn);
    node.children = loadedChildren
}

const TreeNode: React.FC<TreeNodeProps> =
    memo(({
        node,
        level,
        siblings,
        indexToParent,
        renderNodeContent,
        size = "sm",
        createNodeDataFn,
        defaultExpandedKeys
    }) => {
        const isFinalSibling = siblings - 1 === indexToParent

        const [isExpanded, setIsExpanded] = useState(defaultExpandedKeys[node.key] || false)

        let canBeExpanded = false
        if ("refObject" in node && node.children === null) {
            canBeExpanded = true
        }
        else if (node.children && Object.values(node.children).length > 0) {
            canBeExpanded = true
        }
        const branchNeedsLazyLoading = createNodeDataFn && canBeExpanded && !node.children

        const handleOnCollapseCallback = useCallback(() => {
            setIsExpanded((prev: boolean) => {
                if (prev === false && branchNeedsLazyLoading)
                    loadBranch(node, createNodeDataFn)
                return !prev;
            })
        }, [node])

        return (
            <>
                {renderNodeContent &&
                    renderNodeContent(node, {
                        NodeTemplate: ({ children, className, listClassNames, ...rest }) => (
                            <li
                                role="treeitem"
                                aria-selected="false"
                                aria-expanded={isExpanded}
                                aria-level={level}
                                tabIndex={-1}
                                className={listClassNames + " relative w-full"}
                            >
                                <div style={{ paddingLeft: `${level * 24}px` }}
                                    className={classNames(s.listItem, { "py-2": size === "md" }, className,
                                        `relative w-full flex items-center py-1 gap-2 bg-transparent`)}
                                    {...rest}
                                >
                                    {canBeExpanded ?
                                        <TreeCollapseButton
                                            onClick={handleOnCollapseCallback}
                                            isFinalSibling={isFinalSibling}
                                            isExpanded={isExpanded}
                                            level={level}
                                            size={size}
                                        />
                                        :
                                        <>
                                            {isFinalSibling ?
                                                <TreeLineCorner level={level} size={size} />
                                                :
                                                <TreeLine level={level} size={size} />
                                            }
                                            <TreeLineConnect />
                                        </>
                                    }
                                    {children}
                                </div>


                                {/* Render Children */}
                                {isExpanded && canBeExpanded && (
                                    <ul role="group" className='m-0 p-0'>
                                        {!!node.children && Object.values(node.children).map((child, i) =>
                                            <TreeNode
                                                key={`tree-${node.key}-${i}`}
                                                node={child}
                                                siblings={Object.values(node.children).length}
                                                indexToParent={i}
                                                level={level + 1}
                                                renderNodeContent={renderNodeContent}
                                                size={size}
                                                createNodeDataFn={createNodeDataFn}
                                                defaultExpandedKeys={defaultExpandedKeys}
                                            />
                                        )}
                                    </ul>
                                )}
                            </li >
                        )
                    })}
            </>

        )
    })


const TreeNodeContextMenu = ({ node }) => {
    return (
        <ContextMenuContent className='gap-1 text-xs max-w-[300px] max-h-[500px] overflow-scroll'>
            <p className='font-roboto-mono'>Node Object</p>
            <JsonView className='bg-neutral-900' src={node} collapsed={({ depth }) => depth > 1} />
        </ContextMenuContent>
    )
}