import { useTimelineManagerAPI } from "@vxengine/managers/TimelineManager";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "../../shadcn/alertDialog"
import React, { useState } from "react"
import { useObjectSettingsAPI } from "@vxengine/managers/ObjectManager";
import { EditorStaticProp, EditorTrack } from "@vxengine/types/data/editorData";

export const DANGER_UseSplinePath = ({ objVxKey, isUsingSplinePath }: {objVxKey: string, isUsingSplinePath: boolean}) => {
    const { tracks, staticProps, removeTrack, removeStaticProp, createSpline, removeSpline }
        = useTimelineManagerAPI(state => ({
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
                        {Object.values(staticProps).map((staticProp: EditorStaticProp, index) =>
                            <p className="h-auto" key={index}>
                                <br></br> StaticProp <span className="text-red-600">{`${objVxKey}.${staticProp.propertyPath}`}</span> will be <span className="text-red-600">deleted</span>!
                            </p>

                        )}
                    </> : <>
                    {/* Remove Spline Actin */}
                        <p>Deleting the spline will also remove the spline progress track, allowing position tracks and keyframes to be created.</p>
                        <br />
                        <p>Spline <span className="text-red-600">{`${objVxKey}.spline`}</span> will be <span className="text-red-600">deleted</span>! </p>
                        {tracks.map((track: EditorTrack, index) =>
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
