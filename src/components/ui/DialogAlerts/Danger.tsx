import { useTimelineEditorAPI } from "@vxengine/managers/TimelineManager";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "../../shadcn/alertDialog"
import React, { useState } from "react"
import { useObjectSettingsAPI } from "@vxengine/managers/ObjectManager";
import { IStaticProps, ITrack } from "@vxengine/AnimationEngine/types/track";

export const DANGER_UseSplinePath = ({ objVxKey, isUsingSplinePath }: {objVxKey: string, isUsingSplinePath: boolean}) => {
    const { tracks, staticProps, removeTrack, removeStaticProp, createSpline, removeSpline }
        = useTimelineEditorAPI(state => ({
            tracks: [
                state.tracks[`${objVxKey}.position.x`],
                state.tracks[`${objVxKey}.position.y`],
                state.tracks[`${objVxKey}.position.z`],
                state.tracks[`${objVxKey}.splineProgress`]
            ].filter(Boolean),
            staticProps: [
                state.staticProps[`${objVxKey}.position.x`],
                state.staticProps[`${objVxKey}.position.y`],
                state.staticProps[`${objVxKey}.position.z`],
            ].filter(Boolean),
            removeTrack: state.removeTrack,
            removeStaticProp: state.removeStaticProp,
            createSpline: state.createSpline,
            removeSpline: state.removeSpline
        }));

    const setSetting = useObjectSettingsAPI(state => state.setSetting)

    const handleOnClick = () => {
        // Add Spline Action
        if (!isUsingSplinePath) {
            tracks.forEach(({ vxkey, propertyPath }) => removeTrack({ trackKey: `${vxkey}.${propertyPath}`, reRender: false }))

            staticProps.forEach(({ vxkey, propertyPath }) => removeStaticProp({ staticPropKey: `${vxkey}.${propertyPath}` }))

            createSpline({ vxkey:objVxKey })
            setSetting(objVxKey, "useSplinePath", true)

        }
        // Remove Spline Action
        else{
            removeSpline({ vxkey:objVxKey });
            setSetting(objVxKey, "useSplinePath", false)
        }
    }

    return (
        <div className='flex flex-col gap-4'>
            <AlertDialogHeader className='flex flex-col'>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                    {/* Add Spline Action */}
                    {!isUsingSplinePath ? <>
                        <p>
                            Switching to a spline path for position will permanently delete the existing position tracks and keyframes. This action cannot be undone.
                        </p>

                        {tracks.map((track, index) =>
                            <p className="h-auto" key={index}>
                                <br></br> Track <span className="text-red-600">{`${objVxKey}.${track.propertyPath}`}</span> with <span className="text-red-600">{`${Object.values(track.keyframes).length}`}</span> keyframes will be <span className="text-red-600">deleted</span>!
                            </p>
                        )}
                        {Object.values(staticProps).map((staticProp: IStaticProps, index) =>
                            <p className="h-auto" key={index}>
                                <br></br> StaticProp <span className="text-red-600">{`${objVxKey}.${staticProp.propertyPath}`}</span> will be <span className="text-red-600">deleted</span>!
                            </p>

                        )}
                    </> : <>
                    {/* Remove Spline Actin */}
                        <p>Disabling the spline path will remove the current spline and allow position tracks and keyframes to be created. </p>
                        <br />
                        <p>Spline <span className="text-red-600">{`${objVxKey}.spline`}</span> will be <span className="text-red-600">deleted</span>! </p>
                        {tracks.map((track: ITrack, index) =>
                            <p className="h-auto" key={index}>
                                <br></br> Track <span className="text-red-600">{`${objVxKey}.${track.propertyPath}`}</span> with <span className="text-red-600">{`${Object.values(track.keyframes).length}`}</span> keyframes will be <span className="text-red-600">deleted</span>!
                            </p>
                        )}
                    </>}
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                    // @ts-expect-error
                    type="error"
                    onClick={handleOnClick}
                >Continue</AlertDialogAction>
            </AlertDialogFooter>
        </div>
    )
}

