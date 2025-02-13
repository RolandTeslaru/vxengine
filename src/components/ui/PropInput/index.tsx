import React, { FC } from 'react'
import { InputProps } from '@vxengine/components/shadcn/input'
import KeyframeControl from '../KeyframeControl'
import ValueRenderer from '../ValueRenderer'
import { vxObjectProps } from '@vxengine/managers/ObjectManager/types/objectStore';
import { VXObjectParam } from '@vxengine/vxobject/types';
import PropSlider from './PropSlider';
import PropColor from './PropColor';

interface Props extends InputProps {
    vxObject: vxObjectProps
    propertyPath: string
    param: VXObjectParam
    vxkey?: string;   // spline has a vxkey with the ".spline" prefix
    horizontal?: boolean
    disableTracking?: boolean
}


const renderKeyframeControl = (props: any) => <div className='mx-auto my-auto'><KeyframeControl {...props} /></div>

const COMPONENT_MAP = {
    slider: [PropSlider, renderKeyframeControl, ValueRenderer],
    number: [renderKeyframeControl, ValueRenderer],
    color: [PropColor]
}

export const PropInput: FC<Props> = (props) => {
    const { vxObject, propertyPath, param, className, horizontal, disableTracking = false, disabled = false, ...inputProps } = props

    let { vxkey } = props
    if (!vxkey)
        vxkey = vxObject.vxkey

    const trackKey = vxkey + "." + propertyPath

    const components = COMPONENT_MAP[param.type] || []

    return (
        <div className={`flex relative ${horizontal ? "flex-col-reverse gap-1" : "flex-row gap-2"} ${className}`}>
            {components.map((Component, index) =>
                <Component
                    key={index}
                    vxkey={vxkey}
                    vxObject={vxObject}
                    propertyPath={param.overwritePropertyPath ?? propertyPath}
                    trackKey={trackKey}
                    param={param}
                    disabled={disabled || disableTracking}
                    inputProps={{ ...inputProps, disabled }}
                />
            )}
        </div>
    )
}

export default PropInput