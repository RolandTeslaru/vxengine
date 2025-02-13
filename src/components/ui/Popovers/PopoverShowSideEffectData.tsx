import { Popover, PopoverContent, PopoverTrigger } from '@vxengine/components/shadcn/popover';
import Lambda from '@geist-ui/icons/lambda'
import React from 'react'
import JsonView from 'react18-json-view';
import animationEngineInstance from '@vxengine/singleton';

interface Props {
    trackKey: string;
    children: React.ReactNode
    triggerClassName?: string
    contentClassName?: string
    side?: "left" | "right" | "top" | "bottom"
    align?: "center" | "end" | "start"
}

const PopoverShowSideEffectData: React.FC<Props> = (props) => {
    const { children, triggerClassName } = props;
    return (
        <Popover>
            <PopoverTrigger className={triggerClassName} icon={<Lambda size={15} />}>
                {children}
            </PopoverTrigger>
            <Content {...props} />
        </Popover>
    )
}

export default PopoverShowSideEffectData



const Content: React.FC<Props> = (props) => {
    const { trackKey, contentClassName, side, align } = props;

    const sideEffect = animationEngineInstance.getSideEffect(trackKey);

    const data = {
        callback: sideEffect.toString()
    }

    return (
        <PopoverContent className={contentClassName + " !w-[auto] max-w-[600px]"} side={side || "left"} align={align}>
            <p className='font-sans-menlo text-xs text-center mb-2'>SideEffect Data</p>
            <div className='max-h-[70vh] overflow-y-scroll flex flex-col w-full mt-2 text-xs bg-neutral-900 p-1 rounded-md shadow-lg'>
                <p className='font-sans-menlo'>
                    <pre>
                        <code className="whitespace-pre-wrap">{sideEffect.toString()}</code>
                    </pre>
                </p>
            </div>
        </PopoverContent>
    )
}