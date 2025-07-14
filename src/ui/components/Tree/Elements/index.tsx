import React, { memo } from "react"
import s from "../s.module.scss"
import classNames from "classnames"
import { ContextMenuContent } from "@radix-ui/react-context-menu";
import JsonView from "react18-json-view";

interface TreeCollapseButtonProps { 
    onClick: () => void;
    level: number;
    isExpanded: boolean;
    isFinalSibling: boolean;
    size: "sm" | "md";
}

export const TreeCollapseButton = memo(({ onClick, level, isExpanded, isFinalSibling, size }: TreeCollapseButtonProps) => {
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
})


interface TreeLineProps {
    level: number;
    size: "sm" | "md";
}

export const TreeLine = memo(({ level, size }: TreeLineProps) => {
    return <div className={`${s.verticalLine} ml-[7.5px]  bg-neutral-500 left-[${level * 16 + 4}px ]`}></div>
})


interface TreeLineCornerProps {
    level: number;
    size: "sm" | "md";
}


export const TreeLineCorner = memo(({ level, size }: TreeLineCornerProps) => {
    return <div className={`${s.verticalLine} ml-[7.5px] h-1/2!  bg-neutral-500  left-[${level * 16 + 4}px ]`}></div>
})

export const TreeLineConnect = memo(() => {
    return <div className={`ml-2 w-2 min-w-2 h-[1px] content-[" "] bg-neutral-500`}></div>
})





const TreeNodeContextMenu = ({ vxkey, node }) => {
    return (
        <ContextMenuContent>
            <p className='text-xs font-roboto-mono'>generalKey {`${vxkey}.${node.param.propertyPath}`}</p>
            <JsonView src={node} className='text-xs bg-neutral-900 rounded-md' />
        </ContextMenuContent>
    )
}