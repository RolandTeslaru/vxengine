import React, { useEffect, useMemo, useRef, useState, FC, memo } from 'react'
import { useObjectManagerAPI, useObjectPropertyAPI } from '@vxengine/managers/ObjectManager/stores/managerStore'
import { getNestedProperty, setNestedProperty } from '@vxengine/utils/nestedProperty'
import { useTimelineEditorAPI } from '@vxengine/managers/TimelineManager/store'
import { Input, InputProps } from '@vxengine/components/shadcn/input'
import KeyframeControl from '../KeyframeControl'
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from '@vxengine/components/shadcn/contextMenu';
import { vxKeyframeNodeProps, vxSplineNodeProps } from '@vxengine/managers/ObjectManager/types/objectStore';
import { useSplineManagerAPI } from '@vxengine/managers/SplineManager/store';
import { invalidate } from '@react-three/fiber'
import { useUIManagerAPI } from '@vxengine/managers/UIManager/store'
import { ALERT_MakePropertyStatic, ALERT_ResetProperty } from '../PopupAlerts'
import ValueRenderer from '../ValueRenderer'

interface Props extends InputProps {
    propertyPath: string
    horizontal?: boolean
    disableTracking?: boolean
}
export const PropInput: FC<Props> = (props) => {
    const { propertyPath, className, horizontal, disableTracking = false, ...inputProps } = props
    const disabled = props.disabled ? props.disabled : false;
    const vxkey = useObjectManagerAPI(state => state.selectedObjects[0]?.vxkey);
    const trackKey = vxkey + "." + propertyPath

    const isPropertyTracked = useTimelineEditorAPI(state => !!state.tracks[trackKey])

    const pushDialog = useUIManagerAPI(state => state.pushDialog);

    return (
        <ContextMenu>
            <ContextMenuTrigger className={className}>
                <div className={`flex ${horizontal ? "flex-col-reverse gap-1" : "flex-row gap-2"} `}>
                    <div className={(horizontal ? "w-auto mx-auto" : "h-auto my-auto")}>
                        <KeyframeControl
                            propertyKey={trackKey}
                            disabled={disabled || disableTracking}
                        />
                    </div>
                    <ValueRenderer
                        propertyPath={propertyPath}
                        inputProps={inputProps}
                        isPropertyTracked={isPropertyTracked}
                    />
                </div>
            </ContextMenuTrigger>
            {disabled === false &&
                <ContextMenuContent className='flex flex-col'>
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
