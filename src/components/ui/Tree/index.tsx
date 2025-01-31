import React, { useState } from 'react'
import s from "./s.module.scss"
import classNames from 'classnames'

type TreeNodeType = {
    key: string
    children: Record<string, TreeNodeType>
}

interface NodeTemplateProps {
    NodeTemplate: React.FC<{ 
        children: React.ReactNode, 
        className?: string, 
        onClick?: (e: React.MouseEvent<HTMLElement, MouseEvent>) => void, 
        onContextMenu?: (e:  React.MouseEvent<HTMLElement, MouseEvent>) => void, 
        listClassNames?: string
    }>;
}

export type RenderNodeContentProps = (node: any, NodeTemplate: NodeTemplateProps) => React.ReactNode;

interface TreeProps {
    tree: Record<string, TreeNodeType>
    renderNodeContent: RenderNodeContentProps
    size?: "sm" | "md",
    defaultExpandedKeys?: Record<string, any>
    className?: string
}

const Tree: React.FC<TreeProps> = ({ tree, defaultExpandedKeys, className, ...restNodeProps }) => {
    const childrenLength = Object.values(tree).length

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
                    defaultExpandedNodes={defaultExpandedKeys?.[node.key]}
                    {...restNodeProps}
                />
            )}
        </ul>
    );
}

export default Tree


interface TreeNodeProps {
    node: TreeNodeType
    level: number
    siblings: number
    indexToParent: number
    size?: "sm" | "md"
    renderNodeContent?: RenderNodeContentProps
    defaultExpandedNodes?: { key: string, children: Record<string, TreeNodeType> }
}
const TreeNode: React.FC<TreeNodeProps> =
    ({ node, level, siblings, indexToParent, renderNodeContent, size = "sm", defaultExpandedNodes }) => {
        const [isExpanded, setIsExpanded] = useState(defaultExpandedNodes ? true : false);
        const isFinalSibling = siblings - 1 === indexToParent

        const childrenLength = Object.keys(node.children).length
        const hasChildren = childrenLength > 0;

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
                                    {hasChildren ?
                                        <TreeCollapseButton
                                            onClick={() => setIsExpanded(!isExpanded)}
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
                                {isExpanded && hasChildren && (
                                    <ul role="group" className='m-0 p-0'>
                                        {Object.values(node.children).map((child, i) =>
                                            <TreeNode
                                                key={`tree-${node.key}-${i}`}
                                                node={child}
                                                siblings={childrenLength}
                                                indexToParent={i}
                                                level={level + 1}
                                                renderNodeContent={renderNodeContent}
                                                size={size}
                                                defaultExpandedNodes={defaultExpandedNodes?.[child.key]}
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



const TreeCollapseButton = ({ onClick, level, isExpanded, isFinalSibling, size }) => {
    return (
        <>
            <div className={
                classNames(s.groupVerticalLine, `bg-neutral-500 ml-[7.5px] !h-[9px] left-[${level * 12}px]`,
                    { "!h-[10.2px]": size === "md" }
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
                    { "mt-[21px] !h-[9px]": size === "sm" },
                    { "mt-[22px] !h-[10px]": size === "md" },
                )} />
            )}
        </>
    )
}

const TreeLine = ({ level, size }) => {
    return <div className={`${s.verticalLine} ml-[7.5px]  bg-neutral-500 left-[${level * 16 + 4}px ]`}></div>
}

const TreeLineCorner = ({ level, size }) => {
    return <div className={`${s.verticalLine} ml-[7.5px] !h-1/2  bg-neutral-500  left-[${level * 16 + 4}px ]`}></div>
}

const TreeLineConnect = () => {
    return <div className={`ml-2 w-2 h-[1px] content-[" "] bg-neutral-500`}></div>
}
