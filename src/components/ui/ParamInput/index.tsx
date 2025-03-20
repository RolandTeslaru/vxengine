import React, { FC } from 'react'
import { InputProps } from '@vxengine/components/shadcn/input'
import KeyframeControl from '../KeyframeControl'
import ValueRenderer from '../ValueRenderer'
import { vxObjectProps } from '@vxengine/managers/ObjectManager/types/objectStore';
import { VXElementParam } from '@vxengine/vxobject/types';
import ParamSlider from './ParamSlider';
import ParamColor from './ParamColor';

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

export const ParamInput: FC<Props> = (props) => {
    const { vxkey, vxRefObj, param, className, horizontal, disableTracking = false, disabled = false, ...inputProps } = props

    const components = COMPONENT_MAP[param.type ?? "number"] || []

    return (
        <div className={`flex relative ${horizontal ? "flex-col-reverse gap-1" : "flex-row gap-2"} ${className}`}>
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
        </div>
    )
}

export default ParamInput