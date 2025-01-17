import React, { useEffect, useMemo, useRef, useState, FC, memo } from 'react'
import { useTimelineEditorAPI } from '@vxengine/managers/TimelineManager/store'
import { Input, InputProps } from '@vxengine/components/shadcn/input'
import KeyframeControl from '../KeyframeControl'
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from '@vxengine/components/shadcn/contextMenu';
import { useUIManagerAPI } from '@vxengine/managers/UIManager/store'
import { ALERT_MakePropertyStatic, ALERT_ResetProperty } from '../DialogAlerts/Alert'
import ValueRenderer from '../ValueRenderer'
import { vxObjectProps } from '@vxengine/managers/ObjectManager/types/objectStore';
import PopoverShowTrackData from '../Popovers/PopoverShowTrackData';
import PopoverShowStaticPropData from '../Popovers/PopoverShowStaticPropData';
import { Slider } from '@vxengine/components/shadcn/slider';
import { VXParamInputType } from '@vxengine/vxobject/types';
import PropSlider from './PropSlider';

interface Props extends InputProps {
    vxObject: vxObjectProps
    propertyPath: string
    param: VXParamInputType
    vxkey?: string;   // spline has a vxkey with the ".spline" prefix
    horizontal?: boolean
    disableTracking?: boolean
}
export const PropInput: FC<Props> = (props) => {
    const { vxObject, propertyPath, param, className, horizontal, disableTracking = false, disabled = false, ...inputProps } = props

    let { vxkey } = props
    if (!vxkey)
        vxkey = vxObject.vxkey

    const trackKey = vxkey + "." + propertyPath

    const isPropertyTracked = useTimelineEditorAPI(state => !!state.tracks[trackKey])

    const pushDialog = useUIManagerAPI(state => state.pushDialog);

    return (
        <ContextMenu>
            <ContextMenuTrigger className={className}>
                <div className={`flex relative ${horizontal ? "flex-col-reverse gap-1" : "flex-row gap-2"} `}>
                    {param.type === "slider" &&
                        <PropSlider 
                            param={param}
                            vxkey={vxkey}
                            propertyPath={propertyPath}
                        />
                    }
                    <div className={(horizontal ? "w-auto mx-auto" : "h-auto my-auto")}>
                        <KeyframeControl
                            propertyKey={trackKey}
                            disabled={disabled || disableTracking}
                        />
                    </div>
                    <ValueRenderer
                        vxObject={vxObject}
                        vxkey={vxkey}
                        propertyPath={propertyPath}
                        inputProps={{ ...inputProps, disabled }}
                        isPropertyTracked={isPropertyTracked}
                    />
                </div>
            </ContextMenuTrigger>
            {disabled === false &&
                <ContextMenuContent className='flex flex-col'>
                    {isPropertyTracked ?
                        <PopoverShowTrackData trackKey={trackKey}>
                            <p>Show Data</p>
                        </PopoverShowTrackData>
                        :
                        <PopoverShowStaticPropData staticPropKey={trackKey}>
                            <p>Show Data</p>
                        </PopoverShowStaticPropData>
                    }
                    {isPropertyTracked &&
                        <ContextMenuItem
                            onClick={(e) => {
                                pushDialog(<ALERT_MakePropertyStatic vxkey={vxkey} propertyPath={propertyPath} />, "alert")
                            }}
                        >
                            <p className=' text-red-600'>
                                Make Property Static
                            </p>
                        </ContextMenuItem>
                    }
                    <ContextMenuItem
                        onClick={() => pushDialog(<ALERT_ResetProperty vxkey={vxkey} propertyPath={propertyPath} />, "alert")}
                    >
                        <p className=' text-red-600'>
                            Remove Property
                        </p>
                    </ContextMenuItem>
                </ContextMenuContent>
            }
        </ContextMenu>
    )
}

export default PropInput


interface NumberInputProps extends Props {
    trackKey: string
    disabled: boolean
    inputProps: any
    isPropertyTracked: boolean
}
