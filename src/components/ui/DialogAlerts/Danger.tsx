import { useTimelineManagerAPI } from "@vxengine/managers/TimelineManager";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "../../shadcn/alertDialog"
import React, { useMemo, useState } from "react"
import { useObjectSettingsAPI } from "@vxengine/managers/ObjectManager";
import { EditorStaticProp, EditorTrack } from "@vxengine/types/data/editorData";
import { useObjectSetting } from "@vxengine/managers/ObjectManager/stores/settingsStore";
import { ISetting } from "@vxengine/AnimationEngine/types/engine";

interface Props {
    vxkey: string
    settingKey: string
    setting: ISetting,
    onConfirm?: () => void
    onCancel?: () => void
}

export const DIALOG_UseSplinePath: React.FC<Props> = ({ vxkey, settingKey, setting, onConfirm, onCancel }) => {
    const isUsingSplinePath = useMemo(() => setting.value, [])

    const { tracks, staticProps } = useMemo(() => {
        const state = useTimelineManagerAPI.getState();
        const tracks = [
            state.tracks[`${vxkey}.position.x`],
            state.tracks[`${vxkey}.position.y`],
            state.tracks[`${vxkey}.position.z`],
            state.tracks[`${vxkey}.splineProgress`],
            state.tracks[`${vxkey}.splineTension`]
        ].filter(Boolean)

        const staticProps = [
            state.staticProps[`${vxkey}.position.x`],
            state.staticProps[`${vxkey}.position.y`],
            state.staticProps[`${vxkey}.position.z`],
            state.staticProps[`${vxkey}.splineProgress`],
            state.staticProps[`${vxkey}.splineTension`]
        ].filter(Boolean);

        return { tracks, staticProps };
    }, [])

    const { removeTrack, removeStaticProp, createSpline, removeSpline }
        = useTimelineManagerAPI(state => ({
            removeTrack: state.removeTrack,
            removeStaticProp: state.removeStaticProp,
            createSpline: state.createSpline,
            removeSpline: state.removeSpline
        }));

    const handleOnCancel = () => {
        onCancel();
    }

    const handleOnConfirm = () => {
        // Add Spline Action
        if (!isUsingSplinePath) {
            tracks.forEach(({ vxkey, propertyPath }) => removeTrack({ trackKey: `${vxkey}.${propertyPath}`, reRender: false }))
            staticProps.forEach(({ vxkey, propertyPath }) => removeStaticProp({ staticPropKey: `${vxkey}.${propertyPath}` }))

            createSpline({ vxkey })

        }
        // Remove Spline Action
        else {
            removeSpline({ vxkey });
        }

        onConfirm();
    }

    return (
        <div className='flex flex-col gap-4'>
            <AlertDialogHeader className='flex flex-col gap-1'>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                {isUsingSplinePath ? (
                    <>
                        <AlertDialogDescription>
                            Deleting the spline will also remove the spline progress track, allowing position tracks and keyframes to be created.
                        </AlertDialogDescription>
                        <AlertDialogDescription className='flex flex-col'>
                            <span>
                                Spline <span className="text-red-600">{`${vxkey}.spline`}</span> will be <span className="text-red-600">deleted</span>!
                            </span>
                            {tracks.map((track: EditorTrack, index) =>
                                <span className="h-auto" key={index}>
                                    <br></br> Track <span className="text-red-600">{`${vxkey}.${track.propertyPath}`}</span> with <span className="text-red-600">{`${Object.values(track.keyframes).length}`}</span> keyframes will be <span className="text-red-600">deleted</span>!
                                </span>
                            )}
                            {staticProps.map((staticProp: EditorStaticProp, index) =>
                                <span className="h-auto" key={index}>
                                    <br></br> StaticProp <span className="text-red-600">{`${vxkey}.${staticProp.propertyPath}`}</span> will be <span className="text-red-600">deleted</span>!
                                </span>)}
                        </AlertDialogDescription>
                    </>
                ) : (
                    <>
                        <AlertDialogDescription>
                            Switching to a spline path for position will permanently delete the existing position tracks and keyframes. This action cannot be undone.
                        </AlertDialogDescription>
                        <AlertDialogDescription className="flex flex-col">
                            {tracks.map((track, index) =>
                                <span className="h-auto" key={index}>
                                    <br></br> Track <span className="text-red-600">{`${vxkey}.${track.propertyPath}`}</span> with <span className="text-red-600">{`${Object.values(track.keyframes).length}`}</span> keyframes will be <span className="text-red-600">deleted</span>!
                                </span>
                            )}
                            {Object.values(staticProps).map((staticProp: EditorStaticProp, index) =>
                                <span className="h-auto" key={index}>
                                    <br></br> StaticProp <span className="text-red-600">{`${vxkey}.${staticProp.propertyPath}`}</span> will be <span className="text-red-600">deleted</span>!
                                </span>
                            )}
                        </AlertDialogDescription>
                    </>
                )
                }

            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel onClick={handleOnCancel}>Cancel</AlertDialogCancel>
                <AlertDialogAction
                    // @ts-expect-error
                    type="error"
                    onClick={handleOnConfirm}
                >Continue</AlertDialogAction>
            </AlertDialogFooter>
        </div>
    )
}





export const DANGER_ProjectNameUnSync = ({ diskJsonProjectName, providerProjectName }: any) => {
    return (
        <div className='flex flex-col gap-4'>
            <AlertDialogHeader className='flex flex-col'>
                <AlertDialogTitle>Project Name Sync Conflict</AlertDialogTitle>
                <AlertDialogDescription>
                    <div className='gap-2 flex flex-col'>
                        <p>
                            Project Name from Disk Json is not the same as the one from config provider!
                        </p>
                        <div className='flex flex-col gap-2'>
                            <p>Disk Json projectName = <span className='text-red-600'>{`${diskJsonProjectName}`}</span></p>
                            <p>Provider projectName = <span className='text-red-600'>{`${providerProjectName}`}</span></p>
                        </div>
                    </div>
                </AlertDialogDescription>
            </AlertDialogHeader>
        </div>
    )
}
