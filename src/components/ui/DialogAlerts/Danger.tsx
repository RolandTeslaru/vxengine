import { useTimelineManagerAPI } from "@vxengine/managers/TimelineManager";
import { AlertDialogAction, AlertDialogCancel, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "../../shadcn/alertDialog"
import React, { useMemo, useState } from "react"
import { EditorStaticProp, EditorTrack } from "@vxengine/types/data/editorData";
import { ISetting } from "@vxengine/AnimationEngine/types/engine";
import { useTimelineEditorAPI } from "@vxengine/managers/TimelineManager/TimelineEditor/store";

interface DialogProps {
    vxkey: string
    settingKey: string
    setting: ISetting | { value: boolean },
    onConfirm?: () => void
    onCancel?: () => void
}

export const DIALOG_UseSplinePath: React.FC<DialogProps> = (props) => {
    const { vxkey, settingKey, setting, onConfirm, onCancel } = props;
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
        tracks.forEach(({ vxkey, propertyPath }) => removeTrack({ vxkey, propertyPath, reRender: false }))
        staticProps.forEach(({ vxkey, propertyPath }) => removeStaticProp({ vxkey, propertyPath }))
                
        // Add Spline Action
        if (!isUsingSplinePath) {
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
                                    Track <span className="text-red-600">{`${vxkey}.${track.propertyPath}`}</span> with <span className="text-red-600">{`${Object.values(track.keyframes).length}`}</span> keyframes will be <span className="text-red-600">deleted</span>!
                                </span>
                            )}
                            {Object.values(staticProps).map((staticProp: EditorStaticProp, index) =>
                                <span className="h-auto" key={index}>
                                    StaticProp <span className="text-red-600">{`${vxkey}.${staticProp.propertyPath}`}</span> will be <span className="text-red-600">deleted</span>!
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



export const DIALOG_rotationDegrees: React.FC<DialogProps> = (props) => {
    const { vxkey, settingKey, setting, onConfirm, onCancel } = props;

    const isUsingRotationDegrees = useMemo(() => setting.value, [])
    const { tracks, staticProps } = useMemo(() => {
        const state = useTimelineManagerAPI.getState();
        const tracks = [
            state.tracks[`${vxkey}.rotation.x`],
            state.tracks[`${vxkey}.rotation.y`],
            state.tracks[`${vxkey}.rotation.z`],
            state.tracks[`${vxkey}.rotationDegrees.x`],
            state.tracks[`${vxkey}.rotationDegrees.y`],
            state.tracks[`${vxkey}.rotationDegrees.z`]
        ].filter(Boolean)

        const staticProps = [
            state.staticProps[`${vxkey}.rotation.x`],
            state.staticProps[`${vxkey}.rotation.y`],
            state.staticProps[`${vxkey}.rotation.z`],
            state.staticProps[`${vxkey}.rotationDegrees.x`],
            state.staticProps[`${vxkey}.rotationDegrees.y`],
            state.staticProps[`${vxkey}.rotationDegrees.z`]
        ].filter(Boolean);

        return { tracks, staticProps };
    }, [])

    const [ removeTrack, removeStaticProp ] = useTimelineManagerAPI(state => [
        state.removeTrack,
        state.removeStaticProp
    ]);


    const handleOnCancel = () => {
        onCancel();
    }

    const handleOnConfirm = () => {
        tracks.forEach(({ vxkey, propertyPath }) => removeTrack({ vxkey, propertyPath, reRender: false }))
        staticProps.forEach(({ vxkey, propertyPath }) => removeStaticProp({ vxkey, propertyPath }))

        onConfirm();
    }

    return (
        <div className='flex flex-col gap-4'>
            <AlertDialogHeader className='flex flex-col gap-1'>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                {isUsingRotationDegrees ? <>
                    <AlertDialogDescription>Switching to radian degrees will delete the current rotation tracks</AlertDialogDescription>
                </> : <>
                    <AlertDialogDescription>{`By default, Three.js uses Euler angles in radians for rotations. This means that when you animate an object's rotation (using properties like object.rotation.x), the values are in radians and are automatically re-wrapped to the range of [-π, π]. This can make it hard to work with multiple full revolutions.`}</AlertDialogDescription>
                    <AlertDialogDescription>Switching to rotationDegrees will delete the current rotation tracks and staticProps.</AlertDialogDescription>
                </>}
                <AlertDialogDescription className="flex flex-col">
                    {tracks.map((track, index) =>
                        <span className="h-auto" key={index}>
                             Track <span className="text-red-600">{`${vxkey}.${track.propertyPath}`}</span> with <span className="text-red-600">{`${Object.values(track.keyframes).length}`}</span> keyframes will be <span className="text-red-600">deleted</span>!
                        </span>
                    )}
                    {Object.values(staticProps).map((staticProp: EditorStaticProp, index) =>
                        <span className="h-auto" key={index}>
                            StaticProp <span className="text-red-600">{`${vxkey}.${staticProp.propertyPath}`}</span> will be <span className="text-red-600">deleted</span>!
                        </span>
                    )}
                </AlertDialogDescription>
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


const DeletionDescription = (
    { vxkey, tracks, staticProps }: { vxkey: string, tracks: EditorTrack[], staticProps: EditorStaticProp[] }
) => {
    return (
        <AlertDialogDescription className='flex flex-col'>
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
    )
}