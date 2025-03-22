import React, { useEffect, useState } from 'react'
import s from "./s.module.scss"
import classNames from 'classnames'
import { TreeNodeDataType, TreeNodeProps, TreeProps } from './types'
import { ContextMenu, ContextMenuContent, ContextMenuTrigger } from '@vxengine/components/shadcn/contextMenu'
import JsonView from 'react18-json-view'

const Tree: React.FC<TreeProps> = ({ tree, defaultExpandedKeys = {}, createBranch, className, ...restNodeProps }) => {
    const [expandedKeys, setExpandedKeys] = useState<Record<string, boolean>>(defaultExpandedKeys)
    const childrenLength = Object.values(tree).length

    const toggleExpand = (nodeKey: string, node: TreeNodeDataType) => {
        if (!expandedKeys[nodeKey] && node.children === null && node.rawObject) {
            const loadedChildren = createBranch(node.rawObject, "", nodeKey);
            node.children = loadedChildren
        }
        setExpandedKeys((prev) => ({
            ...prev,
            [nodeKey]: !prev[nodeKey],
        }));
    }

    const TreeNode: React.FC<TreeNodeProps> =
        ({ node, level, siblings, indexToParent, renderNodeContent, size = "sm" }) => {
            const isFinalSibling = siblings - 1 === indexToParent
            const isExpanded = expandedKeys[node.key] || false;


            const canBeExpanded = ("rawObject" in node && node.children === null) || Object.values(node.children).length > 0

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
                                                onClick={() => toggleExpand(node.key, node)}
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
                                            {node.children && Object.values(node.children).map((child, i) =>
                                                <TreeNode
                                                    key={`tree-${node.key}-${i}`}
                                                    node={child}
                                                    siblings={Object.values(node.children).length}
                                                    indexToParent={i}
                                                    level={level + 1}
                                                    renderNodeContent={renderNodeContent}
                                                    size={size}
                                                />
                                            )}
                                        </ul>
                                    )}
                                </li>
                            )
                        })}
                </>

            )
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
                    {...restNodeProps}
                />
            )}
        </ul>
    );
}

export default Tree



const TreeCollapseButton = ({ onClick, level, isExpanded, isFinalSibling, size }) => {
    return (
        <>
            <div className={
                classNames(s.groupVerticalLine, `bg-neutral-500 ml-[7.5px] h-[9px]! left-[${level * 12}px]`,
                    { "h-[10.2px]!": size === "md" }
                )} />
            <button
                type="button"
                aria-label="Toggle children"
                onClick={onClick}
                style={{
                    transform: isExpanded ? "rotate(90deg)" : "rotate(0deg)",
                    transition: "transform 0.2s",
                }}
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" /><path d="m10 8 4 4-4 4" /></svg>
            </button>
            {!isExpanded && !isFinalSibling && (
                <div className={classNames(
                    s.groupVerticalLine, `bg-neutral-500  ml-[7.5px] left-[${level * 16 + 4}px ]`,
                    { "mt-[21px] h-[9px]!": size === "sm" },
                    { "mt-[22px] h-[10px]!": size === "md" },
                )} />
            )}
        </>
    )
}

const TreeLine = ({ level, size }) => {
    return <div className={`${s.verticalLine} ml-[7.5px]  bg-neutral-500 left-[${level * 16 + 4}px ]`}></div>
}

const TreeLineCorner = ({ level, size }) => {
    return <div className={`${s.verticalLine} ml-[7.5px] h-1/2!  bg-neutral-500  left-[${level * 16 + 4}px ]`}></div>
}

const TreeLineConnect = () => {
    return <div className={`ml-2 w-2 h-[1px] content-[" "] bg-neutral-500`}></div>
}





const TreeNodeContextMenu = ({ node }) => {
    return (
        <ContextMenuContent>
            <JsonView src={node} className='text-xs bg-neutral-800 rounded-md' />
        </ContextMenuContent>
    )
}