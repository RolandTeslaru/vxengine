import React, { FC, memo, useMemo } from 'react'
import { vxObjectProps } from '@vxengine/managers/ObjectManager/types/objectStore';
import { VXElementParam } from '@vxengine/vxobject/types';
import ParamSlider from './ParamSlider';
import ParamColor from './ParamColor';
import ParamInputContextMenuContent from './contextMenu';
import { InputProps } from '@vxengine/ui/foundations/input';
import KeyframeControl from '../KeyframeControl';
import ValueRenderer from '../ValueRenderer';
import { ContextMenu, ContextMenuContent, ContextMenuTrigger } from '@vxengine/ui/foundations/contextMenu';

interface Props extends InputProps {
    vxkey: string;
    vxRefObj: React.RefObject<any>
    param: VXElementParam
    horizontal?: boolean
    disableTracking?: boolean
    showTitle?: boolean
    titleClassname?: string
    paramSliderRangeClassname?: string
}


const renderKeyframeControl = (props: any) => <div className='mx-auto my-auto'><KeyframeControl {...props} /></div>

const COMPONENT_MAP = {
    slider: [ParamSlider, renderKeyframeControl, ValueRenderer],
    number: [renderKeyframeControl, ValueRenderer],
    color: [ParamColor]
}

export const ParamInput: FC<Props> = memo((props) => {
    const { vxkey, vxRefObj, param, className, horizontal, disableTracking = false, disabled = false, showTitle = true, titleClassname, paramSliderRangeClassname, ...inputProps } = props

    const components = COMPONENT_MAP[param.type ?? "number"] || []

    return (
        <div className={`w-full flex ${param.type !== "slider" ? "flex-row" : "flex-col"}`}>
            {param.type !== "slider" && showTitle &&
                <p className={'text-xs font-normal antialiased w-auto mr-auto my-auto text-label-quaternary ' + titleClassname}>
                    {param.title ?? param.propertyPath}
                </p>
            }
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
                            paramSliderRangeClassname={paramSliderRangeClassname}
                            titleClassname={titleClassname}
                            inputProps={{ ...inputProps, disabled }}
                        />
                    )}
                </ContextMenuTrigger>
                <ContextMenuContent forceMount={false as true}>
                    <ParamInputContextMenuContent param={param} vxkey={vxkey} vxRefObj={vxRefObj} />
                </ContextMenuContent>
            </ContextMenu>
        </div>
    )
})
export default ParamInput