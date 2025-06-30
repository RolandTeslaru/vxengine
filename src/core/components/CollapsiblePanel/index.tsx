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
    icon?: React.ReactNode
    iconClassName?: string
}

const  CollapsiblePanel: React.FC<Props> = memo(
    ({ title, children, className, defaultOpen = true, noPadding = false, contentClassName, icon, iconClassName }) => {

    const [open, setOpen] = useState(defaultOpen);

    return (
        <div className={
            classNames(className, {"max-h-[40px]!": open === false}, {"max-h-[650px]": open === true}, {"px-1": noPadding === false}, 
                        `z-50 h-fit relative !transform-gpu rounded-2xl bg-foreground overflow-hidden duration-500 ease
                         shadow-md shadow-foreground-shadow border border-neutral-400/15
                      `)}
        >
            {/* Title */}
            <div className={`py-2 ${noPadding ? "px-2" : "px-0"} min-h-[37px] relativ`}>
                <button className={"absolute top-[7px] h-6 w-6 flex hover:bg-neutral-800 rounded-xl cursor-pointer "}
                    onClick={() => setOpen(!open)}
                >
                    <ChevronRight className={`${open === true && " rotate-90 "} stroke-label-primary scale-[60%] m-auto`} />
                </button>
                <p className='absolute left-1/2 -translate-x-1/2 text-nowrap top-[7px] text-xs font-roboto-mono text-label-secondary/90 font-extrabold antialiased py-1'>
                    {title}
                </p>
                <div className='absolute top-[9px] h-5 w-5 right-3 !rounded-md overflow-hidden opacity-30'>
                    {icon && React.isValidElement(icon) && iconClassName 
                        ? React.cloneElement(icon as React.ReactElement<any>, { className: iconClassName, width:20, height: 20 })
                        : icon
                    }
                </div>
            </div>
                <div className={
                    classNames(contentClassName, 
                        {"scale-[30%] opacity-0 pointer-events-none": open === false }, 
                        {"scale-100 opacity-100": open === true}, 
                        {"px-1": noPadding === false},
                               'text-xs h-auto border-t  flex flex-col py-2 bg-none !transform-gpu transition-all text-label-quaternary')}
                    style={{ borderImage: "linear-gradient(90deg, rgba(64,64,64,0) 0%, rgba(64,64,64,1) 50%, rgba(64,64,64,0) 100%) 1" }}
                >
                    {children}
                </div>
        </div>
    )
})

export default CollapsiblePanel
