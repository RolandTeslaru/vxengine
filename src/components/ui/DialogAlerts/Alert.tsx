import { useTimelineManagerAPI } from "@vxengine/managers/TimelineManager";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "../../shadcn/alertDialog"
import React, { useMemo, useState } from "react"
import { EditorStaticProp, EditorTrack } from "@vxengine/types/data/editorData";
import animationEngineInstance from "@vxengine/singleton";

interface Props {
    vxkey: string,
    propertyPath: string
}

export const ALERT_MakePropertyStatic: React.FC<Props> = ({ vxkey, propertyPath }) => {
    const trackKey = vxkey + "." + propertyPath

    const initTrackState = useMemo(() => {
        return useTimelineManagerAPI.getState().tracks[trackKey]
    }, [vxkey, propertyPath])

    const keyframesLengthForTrack = Object.entries(initTrackState?.keyframes || {}).length;

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
                    <p className='text-neutral-600 text-opacity-40 text-sm font-roboto-mono mr-auto my-auto '>{`MakePropertyStatic()`}</p>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        //@ts-expect-error
                        type="warning"
                        onClick={() => handleMakePropertyStatic(vxkey, propertyPath)}
                    >Continue</AlertDialogAction>
                </AlertDialogFooter>
            </div>
        </>
    )
}

const handleMakePropertyStatic = (vxkey: string, propertyPath: string) => {
    useTimelineManagerAPI.getState().makePropertyStatic(vxkey, propertyPath, true)
}


export const ALERT_ResetProperty: React.FC<Props> = ({ vxkey, propertyPath }) => {
    const generalKey = `${vxkey}.${propertyPath}`

    const [initTrackState, initStaticPropState] = useMemo(() => {
        const initState = useTimelineManagerAPI.getState()
        return [initState.tracks[generalKey], initState.staticProps[generalKey]]
    }, [vxkey, propertyPath])

    const keyframes = initTrackState?.keyframes;

    return (

        <div className='flex flex-col gap-4'>
            <AlertDialogHeader className='flex flex-col'>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                    {initTrackState && (
                        <>
                            Track <span className='text-yellow-500'>{generalKey}</span> with <span className='text-yellow-500'>{Object.values(keyframes).length}</span> keyframes will be erased!
                            This function returns the property to its default value defined in code.
                        </>
                    )}
                    {initStaticPropState && (
                        <>
                            StaticProp <span className='text-yellow-500'>{generalKey}</span> will be erased!
                            This function returns the property to its default value defined in code.
                        </>
                    )}
                    {!initTrackState && !initStaticPropState && (
                        <>
                            Property path <span className='text-yellow-500'>{generalKey}</span> isn't a track nor a staticProp. Nothing to reset!
                        </>
                    )}
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <p className='text-neutral-600 text-opacity-40 text-sm font-roboto-mono mr-auto my-auto '>{`RemoveProperty()`}</p>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                    //@ts-expect-error
                    type="warning"
                    onClick={() => handleRemoveProperty(vxkey, propertyPath)}
                >Continue</AlertDialogAction>
            </AlertDialogFooter>
        </div>
    )
}

const handleRemoveProperty = (vxkey: string, propertyPath: string) => {
    useTimelineManagerAPI.getState().removeProperty(vxkey, propertyPath, true)
}


export const ALERT_ResetColor = ({ vxkey, propertyPath }) => {
    const baseKey = `${vxkey}.${propertyPath}`

    const [collectedColorTracks, collectedColorStaticProps] = useMemo(() => {
        const state = useTimelineManagerAPI.getState();
        const channels = ['r', 'g', 'b'];
        const collectedColorTracks = [];
        const collectedColorStaticProps = [];

        for (const channel of channels) {
            const generalKey = `${baseKey}.${channel}`;
            if (state.tracks[generalKey]) {
                collectedColorTracks.push(state.tracks[generalKey]);
            }
            if (state.staticProps[generalKey]) {
                collectedColorStaticProps.push(state.staticProps[generalKey]);
            }
        }

        return [
            collectedColorTracks,
            collectedColorStaticProps,
        ];
    }, [])

    const [ removeTrack, removeStaticProp ]
        = useTimelineManagerAPI(state => [
            state.removeTrack,
            state.removeStaticProp
        ]);

    const handleReset = () => {
        collectedColorTracks.forEach((track: EditorTrack) => {
            removeTrack({ vxkey, propertyPath: track.propertyPath, reRender: false})
        })
        collectedColorStaticProps.forEach((staticProps: EditorStaticProp) => {
            removeStaticProp({ vxkey, propertyPath: staticProps.propertyPath, reRender: false})
        })

        animationEngineInstance.reRender({force: true});
    }

    return (
        <>
            <div className='flex flex-col gap-4'>
                <AlertDialogHeader className='flex flex-col'>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                </AlertDialogHeader>

                <AlertDialogDescription className="flex flex-col">
                    {collectedColorTracks.map((track: EditorTrack, index) =>
                        <span className="h-auto" key={index}>
                            Track <span className="text-yellow-400">{`${vxkey}.${track.propertyPath}`}</span> with <span className="text-yellow-400">{`${Object.values(track.keyframes).length}`}</span> keyframes will be <span className="text-yellow-400">deleted</span>!
                        </span>
                    )}
                    {collectedColorStaticProps.map((staticProp: EditorStaticProp, index) =>
                        <span className="h-auto" key={index}>
                            StaticProp <span className="text-yellow-400">{`${vxkey}.${staticProp.propertyPath}`}</span> will be <span className="text-yellow-400">deleted</span>!
                        </span>
                    )}
                </AlertDialogDescription>

                <AlertDialogDescription>
                    These changes will take affect after a refresh.
                </AlertDialogDescription>

                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        //@ts-expect-error
                        type="warning"
                        onClick={handleReset}
                    >Continue</AlertDialogAction>
                </AlertDialogFooter>
            </div>
        </>
    )
}