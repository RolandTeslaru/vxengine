import { useTimelineManagerAPI } from "@vxengine/managers/TimelineManager";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "../../shadcn/alertDialog"
import React, { useState } from "react"

interface Props {
    vxkey: string,
    propertyPath: string
}

export const ALERT_MakePropertyStatic: React.FC<Props> = ({ vxkey, propertyPath }) => {
    const trackKey = vxkey + "." + propertyPath
    const track = useTimelineManagerAPI(state => state.tracks[trackKey]);
    const keyframesLengthForTrack = Object.entries(track?.keyframes || {}).length;

    const makePropertyStatic = useTimelineManagerAPI(state => state.makePropertyStatic)

    return (
        <>
            <div className='flex flex-col gap-4'>
                <AlertDialogHeader className='flex flex-col'>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Track <span className='text-yellow-500'>{trackKey}</span> with <span className='text-yellow-500'>{keyframesLengthForTrack}</span> keyframes will be deleted!
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <p className='text-neutral-600 text-opacity-40 text-sm font-sans-menlo mr-auto my-auto '>{`MakePropertyStatic()`}</p>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        //@ts-expect-error
                        type="warning"
                        onClick={() => makePropertyStatic(trackKey)}
                    >Continue</AlertDialogAction>
                </AlertDialogFooter>
            </div>
        </>
    )
}

export const ALERT_ResetProperty: React.FC<Props> = ({ vxkey, propertyPath }) => {
    const key = vxkey + "." + propertyPath
    const trackKey = vxkey + "." + propertyPath
    const track = useTimelineManagerAPI(state => state.tracks[trackKey]);
    const keyframes = track?.keyframes;
    const staticProp = useTimelineManagerAPI(state => state.staticProps[key])
    const removeProperty = useTimelineManagerAPI(state => state.removeProperty)

    return (

        <div className='flex flex-col gap-4'>
            <AlertDialogHeader className='flex flex-col'>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                    {track && (
                        <>
                            Track <span className='text-yellow-500'>{key}</span> with <span className='text-yellow-500'>{Object.values(keyframes).length}</span> keyframes will be erased!
                        </>
                    )}
                    {staticProp && (
                        <>
                            StaticProp <span className='text-yellow-500'>{key}</span> will be erased!
                        </>
                    )}
                    {!track && !staticProp && (
                        <>
                            Property path <span className='text-yellow-500'>{key}</span> isnt a track nor a staticProp. Nothing to reset!
                        </>
                    )}
                    <p>
                        <br/> This function returns the property to its default value defined in code.
                    </p>
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