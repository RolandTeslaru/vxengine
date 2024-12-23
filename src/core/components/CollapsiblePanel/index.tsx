import ChevronRight from "@geist-ui/icons/chevronRight"
import React, { useState, memo } from 'react'
import styles from "./styles.module.scss"

interface Props {
    title: string,
    children?: React.ReactNode
    defaultOpen?: boolean
    className?: string
    contentClassName?: string;
    noPadding?: boolean
}

const CollapsiblePanel: React.FC<Props> = memo(
    ({ title, children, className, defaultOpen = true, noPadding = false, contentClassName }) => {

    const [open, setOpen] = useState(defaultOpen);

    return (
        <div className={`z-20 w-full h-fit relative !transform-gpu rounded-2xl ${noPadding === false && "px-1"} border border-neutral-800 bg-neutral-900
            ${open === false && "!h-[40px]"} ` +
            className}
        style={{ boxShadow: "0px 0px 5px 1px rgba(0,0,0, 0.6)" }}
        >
            {/* Title */}
            <div className={`py-2 ${noPadding ? "px-2" : "px-0"} relative`}>
                <button className={"absolute top-[7px] h-6 w-6 flex hover:bg-neutral-800 rounded-xl cursor-pointer "}
                    onClick={() => setOpen(!open)}
                >
                    <ChevronRight className={`${open === true && " rotate-90 "}  scale-[60%] m-auto`} />
                </button>
                <p className='text-center text-xs font-sans-menlo text-neutral-200 font-light py-1'>
                    {title}
                </p>
            </div>
            {open && 
                <div className={'text-xs max-h-full border-t flex flex-col py-2 bg-none transition-all text-neutral-400 px-1 ' + contentClassName}
                    style={{ borderImage: "linear-gradient(90deg, rgba(64,64,64,0) 0%, rgba(64,64,64,1) 50%, rgba(64,64,64,0) 100%) 1" }}
                >
                    {children}
                </div>
            }
        </div>
    )
})

export default CollapsiblePanel
