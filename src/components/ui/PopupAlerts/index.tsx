import { useTimelineEditorAPI } from "@vxengine/managers/TimelineManager";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "../../shadcn/alertDialog"
import { ContextMenuItem } from "../../shadcn/contextMenu"
import React, { useState } from "react"

interface Props {
    vxkey: string,
    propertyPath: string
}


export const ALERT_MakePropertyStatic: React.FC<Props> = ({ vxkey, propertyPath }) => {
    const key = vxkey + "." + propertyPath

    const makePropertyStatic = useTimelineEditorAPI(state => state.makePropertyStatic)
    const keyframeLengthForTrack = useTimelineEditorAPI(state => state.getKeyframesForTrack(key)?.length)

    return (
        <>
            <div className='flex flex-col gap-4'>
                <AlertDialogHeader className='flex flex-col'>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Track <span className='text-yellow-500'>{key}</span> with <span className='text-yellow-500'>{keyframeLengthForTrack}</span> keyframes will be deleted!
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <p className='text-neutral-600 text-opacity-40 text-sm font-sans-menlo mr-auto my-auto '>{`MakePropertyStatic()`}</p>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        //@ts-expect-error
                        type="warning"
                        onClick={() => makePropertyStatic(key)}
                    >Continue</AlertDialogAction>
                </AlertDialogFooter>
            </div>
        </>
    )
}

export const ALERT_ResetProperty: React.FC<Props> = ({ vxkey, propertyPath }) => {
    const key = vxkey + "." + propertyPath

    const track = useTimelineEditorAPI(state => state.tracks[key])
    const staticProp = useTimelineEditorAPI(state => state.staticProps[key])
    const removeProperty = useTimelineEditorAPI(state => state.removeProperty)

    const keyframeLengthForTrack = useTimelineEditorAPI(state => state.getKeyframesForTrack(key)?.length)

    return (

        <div className='flex flex-col gap-4'>
            <AlertDialogHeader className='flex flex-col'>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                    {track && (
                        <>
                            Track <span className='text-yellow-500'>{key}</span> with <span className='text-yellow-500'>{keyframeLengthForTrack}</span> keyframes will be deleted!
                        </>
                    )}
                    {staticProp && (
                        <>
                            StaticProp <span className='text-yellow-500'>{key}</span> will be deleted!
                        </>
                    )}
                    {!track && !staticProp && (
                        <>
                            Property path <span className='text-yellow-500'>{key}</span> isnt a track nor a staticProp. Nothing to reset!
                        </>
                    )}
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <p className='text-neutral-600 text-opacity-40 text-sm font-sans-menlo mr-auto my-auto '>{`RemoveProperty()`}</p>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                    //@ts-expect-error
                    type="warning"
                    onClick={() => removeProperty(vxkey, propertyPath)}
                >Continue</AlertDialogAction>
            </AlertDialogFooter>
        </div>
    )
}