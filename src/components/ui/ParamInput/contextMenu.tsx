import { useTimelineManagerAPI } from '@vxengine/managers/TimelineManager'
import { pushDialogStatic } from '@vxengine/managers/UIManager/store'
import animationEngineInstance from '@vxengine/singleton'
import { VXElementParam } from '@vxengine/vxobject/types'
import React, { memo, useMemo } from 'react'
import SideEffectData from '../DataContextContext/SideEffect'
import StaticPropData from '../DataContextContext/StaticProp'
import { TrackData } from '../DataContextContext/Track'
import { ALERT_MakePropertyStatic, ALERT_ResetColor, ALERT_ResetProperty } from '../DialogAlerts/Alert'
import { handleOnCopyNumber, handleOnPasteNumber, handleOnCopyColor, handleOnPasteColor, isOverKeyframe } from './utils'
import { ContextMenuContent, ContextMenuItem, ContextMenuSub, ContextMenuSubContent, ContextMenuSubTrigger } from '@vxengine/components/shadcn/contextMenu'
import { useClipboardManagerAPI } from '@vxengine/managers/ClipboardManager/store'

interface Props {
    param: VXElementParam
    vxkey: string
    vxRefObj: React.RefObject<any>
}

const ParamInputContextMenuContent = memo(({ param, vxkey, vxRefObj }: Props) => {
    const paramType = param.type ?? "number"

    return CONTEXT_TYPES[paramType]({param, vxkey, vxRefObj})
})

export default ParamInputContextMenuContent

const ColorParamContextMenu = ({ param, vxkey, vxRefObj }: Props) => {
    const propertyPath = param.propertyPath
    const trackKey = `${vxkey}.${propertyPath}` // vxkey.color


    const isParamInClipboard = useClipboardManagerAPI(state => state.items.has("color"));

    const [isColorTracked, isColorStatic] = useTimelineManagerAPI(s => {
        const channels = ['r', 'g', 'b'];
        let isTracked = false;
        let isStatic = false;
        
        for (const channel of channels) { // Changed from 'in' to 'of' for array iteration
            const generalKey = `${trackKey}.${channel}`;
            if (s.tracks[generalKey]) {
                isTracked = true;
            }
            if (s.staticProps[generalKey]) {
                isStatic = true;
            }
            if (isTracked && isStatic) {
                break;
            }
        }
        
        return [
            isTracked,
            isStatic,
        ];
    })

    return (
        <>
            <ContextMenuItem onClick={() => handleOnCopyColor(vxkey, param, vxRefObj)}>
                Copy Color
            </ContextMenuItem>
            {isParamInClipboard &&
                <ContextMenuItem onClick={() => handleOnPasteColor(vxkey, param, vxRefObj)}>
                    Paste Color
                </ContextMenuItem>
            }
            {(isColorTracked || isColorStatic) &&
                <ContextMenuItem onClick={() => pushDialogStatic({
                    content: <ALERT_ResetColor vxkey={vxkey} propertyPath={propertyPath}/>,
                    type: "alert"
                })}
                    variant="destructive"
                >
                    Reset Color
                </ContextMenuItem>
            }
        </>
    )
}

const NumberParamContextMenu = ({ param, vxkey, vxRefObj }: Props) => {
    const propertyPath = param.propertyPath
    const trackKey = `${vxkey}.${propertyPath}`
    const paramType = param.type ?? "number"

    const isParamInClipboard = useClipboardManagerAPI(state => state.items.has(paramType as any));

    const hasSideEffect = animationEngineInstance.propertyControlService
                                                 .hasSideEffect(trackKey)

    const [isPropertyTracked, isPropertyStatic, removeKeyframe, orderedKeyframeKeys] = useTimelineManagerAPI(s => {
        const track = s.tracks[trackKey];
        return [
            !!track,
            !!s.staticProps[trackKey],
            s.removeKeyframe,
            track?.orderedKeyframeKeys
        ]
    });

    const onKeyframeKey = useMemo(() => isOverKeyframe(trackKey, orderedKeyframeKeys), [trackKey, orderedKeyframeKeys])


    return (
        <>
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
                            Show StaticProp Data
                        </ContextMenuSubTrigger>
                        <ContextMenuSubContent>
                            <StaticPropData staticPropKey={trackKey} />
                        </ContextMenuSubContent>
                    </>
                }
            </ContextMenuSub>
            {isPropertyTracked &&
                <>
                    {onKeyframeKey &&
                        <ContextMenuItem
                            onClick={() => removeKeyframe({ keyframeKey: onKeyframeKey, vxkey, propertyPath, reRender: true })}
                            variant="warning"
                        >
                            Delete Keyframe
                        </ContextMenuItem>
                    }
                    <ContextMenuItem
                        onClick={(e) => pushDialogStatic({
                            content: <ALERT_MakePropertyStatic vxkey={vxkey} propertyPath={propertyPath} />,
                            type: "alert"
                        })}
                        variant="destructive"
                    >
                        Make Property Static
                    </ContextMenuItem>
                </>
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
    )
}



const CONTEXT_TYPES = {
    "number": NumberParamContextMenu,
    "slider": NumberParamContextMenu,
    "color": ColorParamContextMenu
}