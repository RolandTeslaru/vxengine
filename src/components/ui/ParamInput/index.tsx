import React, { FC } from 'react'
import { InputProps } from '@vxengine/components/shadcn/input'
import KeyframeControl from '../KeyframeControl'
import ValueRenderer from '../ValueRenderer'
import { vxObjectProps } from '@vxengine/managers/ObjectManager/types/objectStore';
import { VXElementParam } from '@vxengine/vxobject/types';
import ParamSlider from './ParamSlider';
import ParamColor from './ParamColor';
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuSub, ContextMenuSubContent, ContextMenuSubTrigger, ContextMenuTrigger } from '@vxengine/components/shadcn/contextMenu';
import { useClipboardManagerAPI } from '@vxengine/managers/ClipboardManager/store';
import { useTimelineManagerAPI } from '@vxengine/managers/TimelineManager/store';
import animationEngineInstance from '@vxengine/singleton';
import SideEffectData from '../DataContextContext/SideEffect';
import { getProperty } from '@vxengine/managers/ObjectManager/stores/managerStore';
import { TrackData } from '../DataContextContext/Track';
import StaticPropData from '../DataContextContext/StaticProp';
import { pushDialogStatic } from '@vxengine/managers/UIManager/store';
import { ALERT_MakePropertyStatic, ALERT_ResetProperty } from '../DialogAlerts/Alert';
import { getNestedProperty } from '@vxengine/utils';

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
        <ContextMenu>
            <ContextMenuTrigger className={`flex relative ${horizontal ? "flex-col-reverse gap-1" : "flex-row gap-2"} ${className}`}>
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
            <ParamInputContextMenuContent param={param} vxkey={vxkey} vxRefObj={vxRefObj} />
        </ContextMenu>
    )
}

export default ParamInput

interface ParamInputContextMenuContentProps {
    param: VXElementParam
    vxkey: string
    vxRefObj:  React.RefObject<any>
}




const ParamInputContextMenuContent = ({ param, vxkey, vxRefObj }: ParamInputContextMenuContentProps) => {
    const propertyPath = param.propertyPath
    const trackKey = `${vxkey}.${propertyPath}`
    const paramType = param.type ?? "number"
    // @ts-expect-error
    const isParamInClipboard = useClipboardManagerAPI(state => state.items.has(paramType));

    const hasSideEffect = animationEngineInstance.propertyControlService.hasSideEffect(trackKey)

    const isPropertyTracked = useTimelineManagerAPI(state => !!state.tracks[trackKey])
    const isPropertyStatic = useTimelineManagerAPI(state => !!state.staticProps[trackKey])

    return (
        <ContextMenuContent>
            {hasSideEffect && (
                <ContextMenuSub>
                    <ContextMenuSubTrigger>
                        Show SideEffect
                    </ContextMenuSubTrigger>
                    <ContextMenuSubContent>
                        <SideEffectData trackKey={trackKey} />
                    </ContextMenuSubContent>
                </ContextMenuSub>
            )}
            {paramType !== "color" ? <>
                <ContextMenuItem onClick={() => handleOnCopyNumber(vxkey, param, vxRefObj)}>
                    Copy Value
                </ContextMenuItem>
                {isParamInClipboard &&
                    <ContextMenuItem onClick={() => handleOnPasteNumber(vxkey, param, vxRefObj)}>
                        Paste Value
                    </ContextMenuItem>
                }
                <ContextMenuSub>
                    {isPropertyTracked ?
                        <>
                            <ContextMenuSubTrigger>
                                Show Track Data
                            </ContextMenuSubTrigger>
                            <ContextMenuSubContent>
                                <TrackData trackKey={trackKey} />
                            </ContextMenuSubContent>
                        </>
                        :
                        <>
                            <ContextMenuSubTrigger>
                                <p>Show StaticProp Data</p>
                            </ContextMenuSubTrigger>
                            <ContextMenuSubContent>
                                <StaticPropData staticPropKey={trackKey} />
                            </ContextMenuSubContent>
                        </>
                    }
                </ContextMenuSub>
                {isPropertyTracked &&
                    <ContextMenuItem
                        onClick={(e) => pushDialogStatic({
                            content: <ALERT_MakePropertyStatic vxkey={vxkey} propertyPath={propertyPath} />,
                            type: "alert"
                        })}
                        variant="destructive"
                    >
                        Make Property Static
                    </ContextMenuItem>
                }
                {(isPropertyTracked || isPropertyStatic) &&
                    <ContextMenuItem
                        onClick={() => pushDialogStatic({
                            content: <ALERT_ResetProperty vxkey={vxkey} propertyPath={propertyPath} />,
                            type: "alert"
                        })}
                        variant="destructive"
                    >
                        Remove Property
                    </ContextMenuItem>
                }
            </>
                :
                <>
                    <ContextMenuItem onClick={() => handleOnCopyColor(vxkey, param, vxRefObj)}>
                        Copy Color
                    </ContextMenuItem>
                    {isParamInClipboard &&
                        <ContextMenuItem onClick={() => handleOnPasteColor(vxkey, param, vxRefObj)}>
                            Paste Color
                        </ContextMenuItem>
                    }
                </>
            }
        </ContextMenuContent>
    )
}

const handleOnCopyNumber = (vxkey: string, param: VXElementParam, vxRefObj:  React.RefObject<any>) => {
    const propertyPath = param.propertyPath
    const value = getProperty(vxkey, propertyPath) || getNestedProperty(vxRefObj.current, propertyPath);
    useClipboardManagerAPI.getState().addItem("number", value);
}

const handleOnPasteNumber = (vxkey: string, param: VXElementParam, vxRefObj:  React.RefObject<any>) => {
    const value = useClipboardManagerAPI.getState().getItemByType("number") as number;
    animationEngineInstance.propertyControlService.modifyParam("press", vxkey, param.propertyPath, value)
}

const handleOnCopyColor = (vxkey: string, param: VXElementParam, vxRefObj:  React.RefObject<any>) => {
    const propertyPath = param.propertyPath;
    const rPropertyPath = propertyPath !== "" ? `${propertyPath}.r` : "r"
    const gPropertyPath = propertyPath !== "" ? `${propertyPath}.g` : "g"
    const bPropertyPath = propertyPath !== "" ? `${propertyPath}.b` : "b"

    const redValue = getProperty(vxkey, rPropertyPath) || getNestedProperty(vxRefObj.current, rPropertyPath)
    const greenValue = getProperty(vxkey, gPropertyPath) || getNestedProperty(vxRefObj.current, gPropertyPath)
    const blueValue = getProperty(vxkey, bPropertyPath) || getNestedProperty(vxRefObj.current, bPropertyPath)

    useClipboardManagerAPI.getState().addItem("color", {
        redValue, greenValue, blueValue
    })
}

const handleOnPasteColor = (vxkey: string, param: VXElementParam, vxRefObj:  React.RefObject<any>) => {
    const propertyPath = param.propertyPath;
    const rPropertyPath = propertyPath !== "" ? `${propertyPath}.r` : "r"
    const gPropertyPath = propertyPath !== "" ? `${propertyPath}.g` : "g"
    const bPropertyPath = propertyPath !== "" ? `${propertyPath}.b` : "b"

    const { redValue, greenValue, blueValue } = useClipboardManagerAPI.getState().getItemByType("color")

    animationEngineInstance.propertyControlService.modifyParam("press", vxkey, rPropertyPath, redValue, false);
    animationEngineInstance.propertyControlService.modifyParam("press", vxkey, gPropertyPath, greenValue, false);
    animationEngineInstance.propertyControlService.modifyParam("press", vxkey, bPropertyPath, blueValue, true);
}