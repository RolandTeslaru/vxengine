import React from 'react'
import { Input, InputProps } from '../shadcn/input'
import KeyframeControl from './KeyframeControl'

interface Props extends InputProps {
    horizontal?: boolean
}
export const PropInput: React.FC<Props> = (props) => {
    const { className, horizontal, ...restProps } = props
    return (
        <div className={`flex gap-1 ${horizontal ? "flex-col-reverse" : "flex-row"} ` + className}>
            <div className={horizontal ? "w-auto mx-auto" : "h-auto my-auto"}>
                <KeyframeControl/>
            </div>
            <Input
                className={"h-fit border-none text-xs bg-neutral-800 p-0.5 max-w-10 " + className}
                {...restProps}
            />
        </div>
    )
}


export default PropInput
