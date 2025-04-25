import { useTimelineManagerAPI } from '@vxengine/managers/TimelineManager'
import { pushDialogStatic } from '@vxengine/managers/UIManager/store'
import animationEngineInstance from '@vxengine/singleton'
import { VXElementParam } from '@vxengine/vxobject/types'
import React, { memo, useMemo } from 'react'
import SideEffectData from '../DataContextContext/SideEffect'
import StaticPropData from '../DataContextContext/StaticProp'
import { TrackData } from '../DataContextContext/Track'
import { ALERT_MakePropertyStatic, ALERT_ResetProperty } from '../DialogAlerts/Alert'
import { handleOnCopyNumber, handleOnPasteNumber, handleOnCopyColor, handleOnPasteColor } from './utils'
import { ContextMenuContent, ContextMenuItem, ContextMenuSub, ContextMenuSubContent, ContextMenuSubTrigger } from '@vxengine/components/shadcn/contextMenu'
import { useClipboardManagerAPI } from '@vxengine/managers/ClipboardManager/store'

interface Props {
    param: VXElementParam
    vxkey: string
    vxRefObj: React.RefObject<any>
}


const ParamInputContextMenuContent = memo(({ param, vxkey, vxRefObj }: Props) => {
    const propertyPath = param.propertyPath
    const trackKey = `${vxkey}.${propertyPath}`
    const paramType = param.type ?? "number"

    const isParamInClipboard = useClipboardManagerAPI(state => state.items.has(paramType as any));

    const hasSideEffect = animationEngineInstance
        .propertyControlService
        .hasSideEffect(trackKey)

    const [ isPropertyTracked, isPropertyStatic, removeKeyframe, orderedKeyframeKeys ] = useTimelineManagerAPI(s => {
        const track = s.tracks[trackKey];
        return [
            !!track,
            !!s.staticProps[trackKey],
            s.removeKeyframe,
            track?.orderedKeyframeKeys
        ]
    });

    const onKeyframeKey = useMemo(() => isOverKeyframe(trackKey, orderedKeyframeKeys), [orderedKeyframeKeys])

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
        </>
    )
})

export default ParamInputContextMenuContent

// return the keyframeKey if found, else return null
const isOverKeyframe = (trackKey: string, orderedKeyframeKeys: string[]) => {
    const currentTime = animationEngineInstance.currentTime
    const track = useTimelineManagerAPI.getState().tracks[trackKey]
    if (!track) return false

    let leftIndex = 0;
    let rightIndex = orderedKeyframeKeys.length - 1
    let foundIndex = -1;

    while (leftIndex <= rightIndex) {
        const mid = Math.floor((leftIndex + rightIndex) / 2)
        const midKey = orderedKeyframeKeys[mid];
        const midTime = track.keyframes[midKey].time;

        if (midTime === currentTime) {
            foundIndex = mid;
            break
        } else if (midTime < currentTime) {
            leftIndex = mid + 1;
        } else {
            rightIndex = mid - 1;
        }
    }

    return foundIndex !== -1 ? orderedKeyframeKeys[foundIndex] : null
}