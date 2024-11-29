import React, { useEffect, useRef, useState } from "react";
import { useObjectManagerAPI, useObjectPropertyAPI } from "../stores/managerStore";
import CollapsiblePanel from "@vxengine/components/ui/CollapsiblePanel";
import PropInput from "@vxengine/components/ui/PropInput";
import { Switch } from "@vxengine/components/shadcn/switch";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@vxengine/components/shadcn/alertDialog";
import { useTimelineEditorAPI } from "@vxengine/managers/TimelineManager/store";
import { IStaticProps, ITrack } from "@vxengine/AnimationEngine/types/track";
import { useSplineManagerAPI } from "@vxengine/managers/SplineManager/store";
import { Slider } from "@vxengine/components/shadcn/slider";
import { getNestedProperty } from "@vxengine/utils";
import { vxObjectProps } from "@vxengine/managers/ObjectManager/types/objectStore";
import { useObjectSettingsAPI } from "../stores/settingsStore";
import { invalidate } from "@react-three/fiber";

interface Props {
    vxobject: vxObjectProps
}

export const TransformProperties: React.FC<Props> = ({ vxobject }) => {
    const vxkey = vxobject.vxkey
    const disabledParams = vxobject.disabledParams;

    const settings = useObjectSettingsAPI(state => state.settings[vxkey])
    const additionalSettings = useObjectSettingsAPI(state => state.additionalSettings[vxkey])
    const toggleAdditionalSetting = useObjectSettingsAPI(state => state.toggleAdditionalSetting)

    const isUsingSplinePath = settings?.useSplinePath
    const isRotationDisabled = disabledParams?.includes("rotation");
    const isScaleDisabled = disabledParams?.includes("scale");

    const renderInputs = (property, disabled = false) => {
        return ['x', 'y', 'z'].map((axis) => (
            <PropInput
                key={`${property}-${axis}`}
                type="number"
                propertyPath={`${property}.${axis}`}
                horizontal={true}
                disabled={disabled}
            />
        ));
    };

    return (
        <CollapsiblePanel
            title="Transform"
        >
            <div className="w-full h-auto flex flex-col gap-2">
                <div className="flex gap-1 flex-row ml-auto">
                    <p className="mx-[16.5px] text-red-400"
                        style={{ textShadow: "#f87171 0px 0px 10px" }}
                    >x</p>
                    <p className="mx-[16.5px] text-green-400"
                        style={{ textShadow: "#4ade80 0px 0px 10px" }}
                    >y</p>
                    <p className="mx-[16.5px] text-blue-400"
                        style={{ textShadow: "#60a5fa 0px 0px 10px " }}
                    >z</p>
                </div>
                <div className='flex flex-row'>
                    <p className="text-xs font-light text-neutral-500" >position</p>
                    <div className='flex flex-row gap-1 max-w-36 ml-auto'>
                        {renderInputs('position', isUsingSplinePath)}
                    </div>
                </div>

                <div className='flex flex-row'>
                    <p className="text-xs font-light text-neutral-500">scale</p>
                    <div className='flex flex-row gap-1 max-w-36 ml-auto'>
                        {renderInputs('scale', isScaleDisabled)}
                    </div>
                </div>

                <div className='flex flex-row gap-2'>
                    <p className="text-xs font-light text-neutral-500">rotation</p>
                    <div className='flex flex-row gap-1 max-w-36 ml-auto'>
                        {renderInputs('rotation', isRotationDisabled)}
                    </div>
                </div>
                {additionalSettings && <>
                    {"showPositionPath" in additionalSettings && (
                        <div className="flex flex-row mb-1">
                            <p className="text-xs font-light text-neutral-500">show postion path</p>
                            <Switch
                                onClick={() => toggleAdditionalSetting(vxkey, "showPositionPath")}
                                checked={additionalSettings["showPositionPath"]}
                                className='ml-auto my-auto scale-[80%]'
                            />
                        </div>
                    )}

                    {/* Other additional settings */}

                </>
                }
                {settings && <>
                    {"useSplinePath" in settings && <>
                        <BTN_useSplinePath vxkey={vxkey} />
                        {settings.useSplinePath &&
                            <SplineProgress vxkey={vxkey} />
                        }
                    </>}
                </>}
            </div>
        </CollapsiblePanel>
    );
}

const getDefaultValue = ({vxkey, propertyPath}: {vxkey: string, propertyPath: string}) => {
    const getProperty = useObjectPropertyAPI.getState().getProperty;
    const val = getProperty(vxkey, propertyPath) 
    return val;
}

const SplineProgress = React.memo(({ vxkey }: any) => {
    const propertyPath = "splineProgress"
    const trackKey = `${vxkey}.splineProgress`
    const inputRef = useRef();
    const [value, setValue] = useState(getDefaultValue({vxkey, propertyPath}));

    useEffect(() => {
        const unsubscribe = useObjectPropertyAPI.subscribe((state, prevState) => {
            const newValue = state.getProperty(vxkey, propertyPath);
            const prevValue = prevState.getProperty(vxkey, propertyPath);

            if (newValue !== undefined) {
                setValue(newValue);
            }
        })

        return () => unsubscribe();
    }, [])

    const handleChange = (newValue) => {
        useTimelineEditorAPI.getState().handlePropertyValueChange(vxkey, propertyPath, newValue)
        setValue(newValue);
        invalidate();
    }

    return (
        <div className="flex flex-col gap-2">
            <p className="text-xs font-light text-neutral-500">spline progress</p>
            <div className="w-full flex flex-row">
                <Slider
                    max={100}
                    step={0.5}
                    min={0}
                    className='w-24 mr-auto'
                    value={[value]}
                    onValueChange={(newValue) => handleChange(newValue[0])}
                />
                <PropInput propertyPath={propertyPath} />
            </div>
        </div>
    )
})

const BTN_useSplinePath = React.memo(({ vxkey }: any) => {
    const settings = useObjectSettingsAPI(state => state.settings[vxkey])

    const [alertDialogOpen, setAlertDialogOpen] = useState(false);
    const [alertType, setAlertType] = useState<"addSpline" | "removeSpline">("addSpline")

    const handleSwitchToggle = () => {
        const currentValue = settings["useSplinePath"];
        setAlertDialogOpen(true);
        if (currentValue === true) {
            // user wants to remove the spline path
            setAlertType("removeSpline");
        }
        else {
            // user wants to add the spline path
            setAlertType("addSpline");
        }
    }

    return (
        <div className="flex flex-row mb-1">
            <p className="text-xs font-light text-neutral-500">use spline path</p>
            <Switch
                onClick={handleSwitchToggle}
                checked={settings["useSplinePath"]}
                className='ml-auto my-auto scale-[80%]'
            />
            <UseSplinePathAlertDialog open={alertDialogOpen} setOpen={setAlertDialogOpen} alertType={alertType} vxkey={vxkey} />
        </div>
    )
})

const UseSplinePathAlertDialog = ({ open, setOpen, alertType, vxkey }) => {
    const getTracksForObject = useTimelineEditorAPI(state => state.getTracksForObject)
    const getStaticPropsForObject = useTimelineEditorAPI(state => state.getStaticPropsForObject)
    const removeTrack = useTimelineEditorAPI(state => state.removeTrack);
    const removeStaticProp = useTimelineEditorAPI(state => state.removeStaticProp);

    const tracks = getTracksForObject(vxkey)
    const staticProps = getStaticPropsForObject(vxkey);

    const setSetting = useObjectSettingsAPI(state => state.setSetting)

    const removeSpline = useSplineManagerAPI(state => state.removeSpline);
    const createSpline = useSplineManagerAPI(state => state.createSpline);

    const splineKey = `${vxkey}.spline`

    const isPositionProperty = (propertyPath) => {
        return (
            propertyPath === "position.x" ||
            propertyPath === "position.y" ||
            propertyPath === "position.z"
        );
    };
    const handleOnClick = () => {
        if (alertType === "addSpline") {
            // Remove all position tracks
            tracks.forEach((track: ITrack) => {
                const trackKey = `${track.vxkey}.${track.propertyPath}`;
                if (isPositionProperty(track.propertyPath)) {
                    removeTrack({ trackKey, reRender: true });
                }
            });

            // Remove all position static props
            staticProps.forEach((staticProp: IStaticProps) => {
                const staticPropKey = `${staticProp.vxkey}.${staticProp.propertyPath}`;
                if (isPositionProperty(staticProp.propertyPath)) {
                    removeStaticProp({ staticPropKey, reRender: true });
                }
            });
            createSpline(vxkey, splineKey)
            setSetting(vxkey, "useSplinePath", true)

        }
        else if (alertType === "removeSpline") {
            removeSpline(splineKey);
            setSetting(vxkey, "useSplinePath", false)
        }
    }

    return (
        <AlertDialog open={open} onOpenChange={(value) => setOpen(value)}>
            <AlertDialogContent className='flex flex-row'>
                {/* <HazardStripes opacity={0.05}/> */}
                <div className='flex ml-2 h-auto mx-5 mb-auto mt-5'>
                    <svg className='animate-ping absolute fill-red-600' width="60" height="60" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8.4449 0.608765C8.0183 -0.107015 6.9817 -0.107015 6.55509 0.608766L0.161178 11.3368C-0.275824 12.07 0.252503 13 1.10608 13H13.8939C14.7475 13 15.2758 12.07 14.8388 11.3368L8.4449 0.608765ZM7.4141 1.12073C7.45288 1.05566 7.54712 1.05566 7.5859 1.12073L13.9798 11.8488C14.0196 11.9154 13.9715 12 13.8939 12H1.10608C1.02849 12 0.980454 11.9154 1.02018 11.8488L7.4141 1.12073ZM6.8269 4.48611C6.81221 4.10423 7.11783 3.78663 7.5 3.78663C7.88217 3.78663 8.18778 4.10423 8.1731 4.48612L8.01921 8.48701C8.00848 8.766 7.7792 8.98664 7.5 8.98664C7.2208 8.98664 6.99151 8.766 6.98078 8.48701L6.8269 4.48611ZM8.24989 10.476C8.24989 10.8902 7.9141 11.226 7.49989 11.226C7.08567 11.226 6.74989 10.8902 6.74989 10.476C6.74989 10.0618 7.08567 9.72599 7.49989 9.72599C7.9141 9.72599 8.24989 10.0618 8.24989 10.476Z" fillRule="evenodd" clipRule="evenodd"></path></svg>
                    <svg className=' fill-red-600' width="60" height="60" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8.4449 0.608765C8.0183 -0.107015 6.9817 -0.107015 6.55509 0.608766L0.161178 11.3368C-0.275824 12.07 0.252503 13 1.10608 13H13.8939C14.7475 13 15.2758 12.07 14.8388 11.3368L8.4449 0.608765ZM7.4141 1.12073C7.45288 1.05566 7.54712 1.05566 7.5859 1.12073L13.9798 11.8488C14.0196 11.9154 13.9715 12 13.8939 12H1.10608C1.02849 12 0.980454 11.9154 1.02018 11.8488L7.4141 1.12073ZM6.8269 4.48611C6.81221 4.10423 7.11783 3.78663 7.5 3.78663C7.88217 3.78663 8.18778 4.10423 8.1731 4.48612L8.01921 8.48701C8.00848 8.766 7.7792 8.98664 7.5 8.98664C7.2208 8.98664 6.99151 8.766 6.98078 8.48701L6.8269 4.48611ZM8.24989 10.476C8.24989 10.8902 7.9141 11.226 7.49989 11.226C7.08567 11.226 6.74989 10.8902 6.74989 10.476C6.74989 10.0618 7.08567 9.72599 7.49989 9.72599C7.9141 9.72599 8.24989 10.0618 8.24989 10.476Z" fillRule="evenodd" clipRule="evenodd"></path></svg>
                </div>
                <div className='flex flex-col gap-4'>
                    <AlertDialogHeader className='flex flex-col'>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            {alertType === "addSpline" ? <>
                                <p>
                                    Switching to a spline path for position will permanently delete the existing position tracks and keyframes. This action cannot be undone.
                                </p>

                                {tracks.map((track, index) => {
                                    if (isPositionProperty(track.propertyPath)) {
                                        return (<p className="h-auto" key={index}>
                                            <br></br> Track <span className="text-red-600">{`${vxkey}.${track.propertyPath}`}</span> with <span className="text-red-600">{`${track.keyframes.length}`}</span> keyframes will be <span className="text-red-600">deleted</span>!
                                        </p>)
                                    }
                                })}
                                {staticProps.map((staticProp: IStaticProps, index) => {
                                    if (isPositionProperty(staticProp.propertyPath)) {
                                        return (<p className="h-auto" key={index}>
                                            <br></br> StaticProp <span className="text-red-600">{`${vxkey}.${staticProp.propertyPath}`}</span> will be <span className="text-red-600">deleted</span>!
                                        </p>)
                                    }
                                })}
                            </> : <>
                                <p>Disabling the spline path will remove the current spline and allow position tracks and keyframes to be created. </p>
                                <br />
                                <p>Spline <span className="text-red-600">{`${vxkey}.spline`}</span> will be <span className="text-red-600">deleted</span>! </p>
                                {tracks.map((track, index) => {
                                    return (<p className="h-auto" key={index}>
                                        <br></br> Track <span className="text-red-600">{`${vxkey}.${track.propertyPath}`}</span> with <span className="text-red-600">{`${track.keyframes.length}`}</span> keyframes will be <span className="text-red-600">deleted</span>!
                                    </p>)
                                })}
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
                {/* <HazardStripes opacity={0.05} /> */}
            </AlertDialogContent>
        </AlertDialog>
    )
}

