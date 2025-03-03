import React, { useState, memo } from 'react'
import classNames from "classnames"
import { ChevronRight } from '@vxengine/components/ui/icons'

interface Props {
    title: string,
    children?: React.ReactNode
    defaultOpen?: boolean
    className?: string
    contentClassName?: string;
    noPadding?: boolean
}

const  CollapsiblePanel: React.FC<Props> = memo(
    ({ title, children, className, defaultOpen = true, noPadding = false, contentClassName }) => {

    const [open, setOpen] = useState(defaultOpen);

    return (
        <div className={
            classNames(className, {"h-[40px]!": open === false}, {"px-1": noPadding === false}, 
                        `z-50 h-fit relative !transform-gpu rounded-2xl bg-neutral-900/90 overflow-hidden
                         shadow-md shadow-neutral-900 border border-neutral-400/15
                      `)}
        >
            {/* Title */}
            <div className={`py-2 ${noPadding ? "px-2" : "px-0"} relative`}>
                <button className={"absolute top-[7px] h-6 w-6 flex hover:bg-neutral-800 rounded-xl cursor-pointer "}
                    onClick={() => setOpen(!open)}
                >
                    <ChevronRight className={`${open === true && " rotate-90 "}  scale-[60%] m-auto`} />
                </button>
                <p className='text-center text-xs font-roboto-mono text-neutral-200 font-bold antialiased py-1'>
                    {title}
                </p>
            </div>
            {open && 
                <div className={
                    classNames(contentClassName, {"px-1": noPadding === false},
                               'text-xs h-auto border-t  flex flex-col py-2 bg-none transition-all text-neutral-400')}
                    style={{ borderImage: "linear-gradient(90deg, rgba(64,64,64,0) 0%, rgba(64,64,64,1) 50%, rgba(64,64,64,0) 100%) 1" }}
                >
                    {children}
                </div>
            }
        </div>
    )
})

export default CollapsiblePanel
