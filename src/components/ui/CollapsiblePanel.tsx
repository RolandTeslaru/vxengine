import { ChevronRight } from '@geist-ui/icons'
import { motion } from "framer-motion";
import React, { useState } from 'react'

interface Props {
    title: string,
    children?: React.ReactNode
    defaultOpen?: boolean
    className?: string
}

const CollapsiblePanel: React.FC<Props> = ({ title, children, className, defaultOpen = true }) => {

    const [open, setOpen] = useState(defaultOpen);

    return (
        <div className={`bg-neutral-950 overflow-hidden z-20 w-full h-fit transition-all ease-in-out duration-500 
                            rounded-2xl p-2 pt-0 pb-0 border border-neutral-800 border-opacity-70 ${open === false && "!h-[40px]"} ` +
            className }
            // style={{ boxShadow: "0px 0px 5px 3px rgba(0,0,0, 0.6)" }}
        >
            {/* Title */}
            <div className="py-2 h-[40px] relative">
                <button className={"absolute top-[7px] h-6 w-6 flex hover:bg-neutral-800 rounded-lg cursor-pointer "}
                    onClick={() => setOpen(!open)}
                >
                    <ChevronRight className={`${open === true && " rotate-90 "}  scale-[60%] m-auto`} />
                </button>
                <p className='text-center text-xs font-sans-menlo py-1'>{title}</p>
            </div>
            {open && (
                <motion.div className='text-xs border-t flex flex-col py-2 border-neutral-700 bg-none transition-all text-neutral-400'
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                    {children}
                </motion.div>
            )}
            {/* Contents */}
        </div>
    )
}

export default CollapsiblePanel
