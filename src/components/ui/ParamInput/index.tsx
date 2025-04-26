import React, { FC, memo, useMemo } from 'react'
import { InputProps } from '@vxengine/components/shadcn/input'
import KeyframeControl from '../KeyframeControl'
import ValueRenderer from '../ValueRenderer'
import { vxObjectProps } from '@vxengine/managers/ObjectManager/types/objectStore';
import { VXElementParam } from '@vxengine/vxobject/types';
import ParamSlider from './ParamSlider';
import ParamColor from './ParamColor';
import { ContextMenu, ContextMenuContent, ContextMenuTrigger } from '@vxengine/components/shadcn/contextMenu';
import ParamInputContextMenuContent from './contextMenu';

interface Props extends InputProps {
    vxkey: string;
    vxRefObj: React.RefObject<any>
    param: VXElementParam
    horizontal?: boolean
    disableTracking?: boolean
}


const renderKeyframeControl = (props: any) => <div className='mx-auto my-auto'><KeyframeControl {...props} /></div>

const COMPONENT_MAP = {
    slider: [ParamSlider, renderKeyframeControl, ValueRenderer],
    number: [renderKeyframeControl, ValueRenderer],
    color: [ParamColor]
}

export const ParamInput: FC<Props> = memo((props) => {
    const { vxkey, vxRefObj, param, className, horizontal, disableTracking = false, disabled = false, ...inputProps } = props

    const components = COMPONENT_MAP[param.type ?? "number"] || []


    return (
        <ContextMenu>
            <ContextMenuTrigger style={props.style} className={`flex ${horizontal ? "flex-col-reverse gap-1" : "flex-row gap-2"} ${className}`}>
                {components.map((Component, index) =>
                    <Component
                        key={index}
                        vxkey={vxkey}
                        vxRefObj={vxRefObj}
                        param={param}
                        disabled={disabled || disableTracking}
                        horizontal={horizontal}
                        inputProps={{ ...inputProps, disabled }}
                    />
                )}
            </ContextMenuTrigger>
            <ContextMenuContent forceMount={false as true}>
                <ParamInputContextMenuContent param={param} vxkey={vxkey} vxRefObj={vxRefObj} />
            </ContextMenuContent>
        </ContextMenu>
    )
})
export default ParamInput