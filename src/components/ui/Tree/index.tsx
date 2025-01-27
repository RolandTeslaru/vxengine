import React, { useState } from 'react'
import s from "./s.module.scss"

type TreeNodeType = {
    key: string
    children: Record<string, TreeNodeType>
}

interface TreeProps {
    tree: Record<string, TreeNodeType>
    renderNodeContent?: (node: TreeNodeType, level: number, siblings: number, indexToParent: number) => React.ReactNode;
}

const Tree: React.FC<TreeProps> = ({ tree, renderNodeContent }) => {
    const childrenLength = Object.values(tree).length

    return (
        <ul
            role="tree"
            className={`${s.tree_container} o`}
        >
            {Object.values(tree).map((node, i) => 
                 <TreeNode node={node} siblings={childrenLength} indexToParent={i} level={0} renderNodeContent={renderNodeContent}/>
            )}
        </ul>
    );
}

export default Tree

interface TreeNodeProps {
    node: TreeNodeType
    level:number
    siblings: number
    indexToParent: number
    renderNodeContent?: (node: TreeNodeType, level: number, siblings: number, indexToParent: number) => React.ReactNode;
}
const TreeNode:React.FC<TreeNodeProps> = ({node, level, siblings, indexToParent, renderNodeContent}) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const isFinalSibling = siblings - 1 === indexToParent

    const childrenLength = Object.keys(node.children).length
    const hasChildren = childrenLength > 0;

    return (
        <li
            role="treeitem"
            aria-selected="false"
            aria-expanded={isExpanded}
            aria-level={level}
            tabIndex={-1}
            className={`relative w-full`}
        >
            <div
                className={s.listItem + " " + ` w-full flex items-center gap-2 py-1 bg-transparent`}
                style={{ paddingLeft: `${level * 24}px` }}
            >
                {/* Toggle Button for Groups */}
                {hasChildren ?
                    <TreeCollapseButton 
                        onClick={() => setIsExpanded(!isExpanded)} 
                        isFinalSibling={isFinalSibling}
                        isExpanded={isExpanded} 
                        level={level} 
                    />
                    :
                    <>
                        {isFinalSibling ?
                            <TreeLineCorner level={level} />
                            :
                            <TreeLine level={level} />
                        }
                        <TreeLineConnect />
                    </>

                }

                {/* Node Name */}
                {renderNodeContent ? (
                    renderNodeContent(node, level, siblings, indexToParent)
                ) : (
                    <p className={`text-xs font-light text-neutral-400`}>{node.key}</p>
                )}
            </div>


            {/* Render Children */}
            {isExpanded && hasChildren && (
                <ul role="group" className='m-0 p-0'>
                    {Object.values(node.children).map((child, i) =>
                        <TreeNode node={child} siblings={childrenLength} indexToParent={i} level={level + 1} renderNodeContent={renderNodeContent}/>
                    )}
                </ul>
            )}
        </li>
    )
}



const TreeCollapseButton = ({ onClick, level, isExpanded, isFinalSibling }) => {
    return (
        <>
            <div className={`${s.groupVerticalLine}  bg-neutral-500 ml-[7.5px] !h-[6px] left-[${level * 12}px ]`}></div>
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
                <div className={`${s.groupVerticalLine} bg-neutral-500  ml-[7.5px] mt-[18px] !h-[6px] left-[${level * 16 + 4}px ]`}></div>
            )}
        </>
    )
}

const TreeLine = ({ level }) => {
    return <div className={`${s.verticalLine} ml-[7.5px]  bg-neutral-500 left-[${level * 16 + 4}px ]`}></div>
}

const TreeLineCorner = ({ level }) => {
    return <div className={`${s.verticalLine} ml-[7.5px] !h-1/2  bg-neutral-500  left-[${level * 16 + 4}px ]`}></div>
}

const TreeLineConnect = () => {
    return <div className={`ml-2 w-2 h-[1px] content-[" "] bg-neutral-500`}></div>
}
