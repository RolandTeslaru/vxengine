import React, { useEffect, useRef, useState } from 'react'
import { useTimelineEditorAPI } from '..';
import { DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@vxengine/components/shadcn/dialog';
import { Button } from '@vxengine/components/shadcn/button';
import { Input } from '@vxengine/components/shadcn/input';
import { Label } from '@vxengine/components/shadcn/label';
import { useUIManagerAPI } from '@vxengine/managers/UIManager/store';
import { ALERT_ResetProperty } from '@vxengine/components/ui/PopupAlerts';

export const DIALOG_createKeyframe = () => {
    const tracks = useTimelineEditorAPI((state) => state.tracks);
    const trackKeys = Object.keys(tracks);

    const trackKeyRef = useRef<HTMLInputElement>(null);
    const valueRef = useRef<HTMLInputElement>(null);

    const createKeyframe = useTimelineEditorAPI((state) => state.createKeyframe);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Retrieve input values directly from refs
        const trackKey = trackKeyRef.current?.value || "";
        const value = valueRef.current?.value ? parseFloat(valueRef.current.value) : undefined;

        // Validate the track key
        if (!trackKeys.includes(trackKey)) {
            alert("Invalid track key!");
            return;
        }

        if (value === undefined) {
            alert("Please fill in the value!");
            return;
        }

        // Call the createKeyframe function
        createKeyframe({ trackKey, value });
    };

    const pushDialog = useUIManagerAPI(state => state.pushDialog);

    return (
        <>
            <DialogHeader>
                <DialogTitle>Create Keyframe</DialogTitle>
                <DialogDescription>
                    {`useTimelineEditorAPI.createKeyframe()`}
                </DialogDescription>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        {/* TrackKey Input */}
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label
                                htmlFor="trackKey"
                                className="text-right font-sans-menlo text-neutral-400"
                            >
                                trackKey
                            </Label>
                            <Input
                                id="trackKey"
                                ref={trackKeyRef}
                                className="col-span-3"
                            />
                        </div>

                        {/* Value Input */}
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label
                                htmlFor="value"
                                className="text-right font-sans-menlo text-neutral-400"
                            >
                                value
                            </Label>
                            <Input
                                id="value"
                                type="number"
                                ref={valueRef}
                                className="col-span-3"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit">Execute</Button>
                    </DialogFooter>
                </form>
                <Button onClick={() => pushDialog(<DIALOG_createKeyframe />, "normal")}>OpenDialog</Button>
                <Button variant="warning" onClick={() => pushDialog(<ALERT_ResetProperty vxkey="dasd" propertyPath="dad" />, "alert")}>Alert OpenDialog</Button>
            </DialogHeader>
        </>
    );
};

export const DIALOG_setKeyframeTime = () => {
    const setKeyframeTime = useTimelineEditorAPI((state) => state.setKeyframeTime);

    const handleSubmit = (e: any) => {
        e.preventDefault();
        const trackKey = e.target.trackKey.value;
        const keyframeKey = e.target.keyframeKey.value;
        const newTime = parseFloat(e.target.newTime.value);

        const track = useTimelineEditorAPI.getState().tracks[trackKey]
        if (!track) {
            alert("Invalid Track!");
            return;
        }

        const keyframe = track.keyframes[keyframeKey];

        if (!keyframe) {
            alert("Invalid keyframe!");
            return;
        }

        setKeyframeTime(keyframeKey, trackKey, newTime);
    };

    return (
        <form onSubmit={handleSubmit}>
            <DialogHeader>
                <DialogTitle>Set Keyframe Time</DialogTitle>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="trackKey" className="text-right">
                            Track Key
                        </Label>
                        <Input id="trackKey" name="keyframeKey" className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="keyframeKey" className="text-right">
                            Keyframe Key
                        </Label>
                        <Input id="keyframeKey" name="keyframeKey" className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="newTime" className="text-right">
                            New Time
                        </Label>
                        <Input id="newTime" name="newTime" type="number" className="col-span-3" />
                    </div>
                </div>
                <DialogFooter>
                    <Button type="submit">Set Time</Button>
                </DialogFooter>
            </DialogHeader>
        </form>
    );
};

export const DIALOG_setKeyframeValue = () => {
    const setKeyframeValue = useTimelineEditorAPI((state) => state.setKeyframeValue);

    const handleSubmit = (e: any) => {
        e.preventDefault();
        const trackKey = e.target.trackKey.value;
        const keyframeKey = e.target.keyframeKey.value;
        const newValue = parseFloat(e.target.newValue.value);

        const track = useTimelineEditorAPI.getState().tracks[trackKey]
        if (!track) {
            alert("Invalid Track!");
            return;
        }

        const keyframe = track.keyframes[keyframeKey];

        if (!keyframe) {
            alert("Invalid keyframe!");
            return;
        }

        setKeyframeValue(keyframeKey, trackKey, newValue);
    };

    return (
        <form onSubmit={handleSubmit}>
            <DialogHeader>
                <DialogTitle>Set Keyframe Value</DialogTitle>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="trackKey" className="text-right">
                            Track Key
                        </Label>
                        <Input id="trackKey" name="keyframeKey" className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="keyframeKey" className="text-right">
                            Keyframe Key
                        </Label>
                        <Input id="keyframeKey" name="keyframeKey" className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="newValue" className="text-right">
                            New Value
                        </Label>
                        <Input id="newValue" name="newValue" type="number" className="col-span-3" />
                    </div>
                </div>
                <DialogFooter>
                    <Button type="submit">Set Value</Button>
                </DialogFooter>
            </DialogHeader>
        </form>
    );
};

export const DIALOG_removeKeyframe = () => {
    const removeKeyframe = useTimelineEditorAPI((state) => state.removeKeyframe);

    const handleSubmit = (e: any) => {
        e.preventDefault();
        const trackKey = e.target.trackKey.value;
        const keyframeKey = e.target.keyframeKey.value;

        const track = useTimelineEditorAPI.getState().tracks[trackKey]
        if (!track) {
            alert("Invalid Track!");
            return;
        }

        const keyframe = track.keyframes[keyframeKey];

        if (!keyframe) {
            alert("Invalid keyframe!");
            return;
        }

        removeKeyframe({ keyframeKey, trackKey, reRender: true });
    };

    return (
        <form onSubmit={handleSubmit}>
            <DialogHeader>
                <DialogTitle>Remove Keyframe</DialogTitle>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="trackKey" className="text-right">
                            Track Key
                        </Label>
                        <Input id="trackKey" name="keyframeKey" className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="keyframeKey" className="text-right">
                            Keyframe Key
                        </Label>
                        <Input id="keyframeKey" name="keyframeKey" className="col-span-3" />
                    </div>
                </div>
                <DialogFooter>
                    <Button type="submit">Remove Keyframe</Button>
                </DialogFooter>
            </DialogHeader>
        </form>
    );
};

export const DIALOG_createStaticProp = () => {
    const createStaticProp = useTimelineEditorAPI((state) => state.createStaticProp);

    const handleSubmit = (e: any) => {
        e.preventDefault();
        const vxkey = e.target.vxkey.value;
        const propertyPath = e.target.propertyPath.value;
        const value = parseFloat(e.target.value.value);

        createStaticProp({ vxkey, propertyPath, value, reRender: true });
    };

    return (
        <form onSubmit={handleSubmit}>
            <DialogHeader>
                <DialogTitle>Create StaticProp</DialogTitle>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="vxkey" className="text-right">
                            Object Key
                        </Label>
                        <Input id="vxkey" name="vxkey" className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="propertyPath" className="text-right">
                            Property Path
                        </Label>
                        <Input id="propertyPath" name="propertyPath" className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="value" className="text-right">
                            Value
                        </Label>
                        <Input id="value" name="value" type="number" className="col-span-3" />
                    </div>
                </div>
                <DialogFooter>
                    <Button type="submit">Create StaticProp</Button>
                </DialogFooter>
            </DialogHeader>
        </form>
    );
};

export const DIALOG_setStaticPropValue = () => {
    const setStaticPropValue = useTimelineEditorAPI((state) => state.setStaticPropValue);
    const staticProps = useTimelineEditorAPI((state) => state.staticProps);

    const handleSubmit = (e: any) => {
        e.preventDefault();
        const staticPropKey = e.target.staticPropKey.value;
        const newValue = parseFloat(e.target.newValue.value);

        if (!staticProps[staticPropKey]) {
            alert("Invalid StaticProp key!");
            return;
        }

        if (isNaN(newValue)) {
            alert("Please provide a valid value!");
            return;
        }

        setStaticPropValue(staticPropKey, newValue, true);
    };

    return (
        <form onSubmit={handleSubmit}>
            <DialogHeader>
                <DialogTitle>Set StaticProp Value</DialogTitle>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="staticPropKey" className="text-right">
                            StaticProp Key
                        </Label>
                        <Input id="staticPropKey" name="staticPropKey" className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="newValue" className="text-right">
                            New Value
                        </Label>
                        <Input id="newValue" name="newValue" type="number" className="col-span-3" />
                    </div>
                </div>
                <DialogFooter>
                    <Button type="submit">Set Value</Button>
                </DialogFooter>
            </DialogHeader>
        </form>
    );
};

export const DIALOG_removeStaticProp = () => {
    const removeStaticProp = useTimelineEditorAPI((state) => state.removeStaticProp);
    const staticProps = useTimelineEditorAPI((state) => state.staticProps);

    const handleSubmit = (e: any) => {
        e.preventDefault();
        const staticPropKey = e.target.staticPropKey.value;

        if (!staticProps[staticPropKey]) {
            alert("Invalid StaticProp key!");
            return;
        }

        removeStaticProp({ staticPropKey, reRender: true });
    };

    return (
        <form onSubmit={handleSubmit}>
            <DialogHeader>
                <DialogTitle>Remove StaticProp</DialogTitle>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="staticPropKey" className="text-right">
                            StaticProp Key
                        </Label>
                        <Input id="staticPropKey" name="staticPropKey" className="col-span-3" />
                    </div>
                </div>
                <DialogFooter>
                    <Button type="submit">Remove StaticProp</Button>
                </DialogFooter>
            </DialogHeader>
        </form>
    );
};

export const DIALOG_makePropertyTracked = () => {
    const makePropertyTracked = useTimelineEditorAPI((state) => state.makePropertyTracked);

    const handleSubmit = (e: any) => {
        e.preventDefault();
        const staticPropKey = e.target.staticPropKey.value;

        if (!staticPropKey) {
            alert("Please provide a valid StaticProp key!");
            return;
        }

        makePropertyTracked(staticPropKey, true);
    };

    return (
        <form onSubmit={handleSubmit}>
            <DialogHeader>
                <DialogTitle>Make Property Tracked</DialogTitle>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="staticPropKey" className="text-right">
                            StaticProp Key
                        </Label>
                        <Input id="staticPropKey" name="staticPropKey" className="col-span-3" />
                    </div>
                </div>
                <DialogFooter>
                    <Button type="submit">Make Tracked</Button>
                </DialogFooter>
            </DialogHeader>
        </form>
    );
};

export const DIALOG_makePropertyStatic = () => {
    const makePropertyStatic = useTimelineEditorAPI((state) => state.makePropertyStatic);

    const handleSubmit = (e: any) => {
        e.preventDefault();
        const trackKey = e.target.trackKey.value;

        if (!trackKey) {
            alert("Please provide a valid Track key!");
            return;
        }

        makePropertyStatic(trackKey, true);
    };

    return (
        <form onSubmit={handleSubmit}>
            <DialogHeader>
                <DialogTitle>Make Property Static</DialogTitle>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="trackKey" className="text-right">
                            Track Key
                        </Label>
                        <Input id="trackKey" name="trackKey" className="col-span-3" />
                    </div>
                </div>
                <DialogFooter>
                    <Button type="submit">Make Static</Button>
                </DialogFooter>
            </DialogHeader>
        </form>
    );
};

export const DIALOG_moveToNextKeyframe = () => {
    const moveToNextKeyframe = useTimelineEditorAPI((state) => state.moveToNextKeyframe);
    const tracks = useTimelineEditorAPI((state) => state.tracks);

    const handleSubmit = (e: any) => {
        e.preventDefault();
        const trackKey = e.target.trackKey.value;

        if (!tracks[trackKey]) {
            alert("Invalid Track key!");
            return;
        }

        moveToNextKeyframe(trackKey);
    };

    return (
        <form onSubmit={handleSubmit}>
            <DialogHeader>
                <DialogTitle>Move to Next Keyframe</DialogTitle>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="trackKey" className="text-right">
                            Track Key
                        </Label>
                        <Input id="trackKey" name="trackKey" className="col-span-3" />
                    </div>
                </div>
                <DialogFooter>
                    <Button type="submit">Move Cursor</Button>
                </DialogFooter>
            </DialogHeader>
        </form>
    );
};

export const DIALOG_moveToPreviousKeyframe = () => {
    const moveToPreviousKeyframe = useTimelineEditorAPI((state) => state.moveToPreviousKeyframe);
    const tracks = useTimelineEditorAPI((state) => state.tracks);

    const handleSubmit = (e: any) => {
        e.preventDefault();
        const trackKey = e.target.trackKey.value;

        if (!tracks[trackKey]) {
            alert("Invalid Track key!");
            return;
        }

        moveToPreviousKeyframe(trackKey);
    };

    return (
        <form onSubmit={handleSubmit}>
            <DialogHeader>
                <DialogTitle>Move to Previous Keyframe</DialogTitle>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="trackKey" className="text-right">
                            Track Key
                        </Label>
                        <Input id="trackKey" name="trackKey" className="col-span-3" />
                    </div>
                </div>
                <DialogFooter>
                    <Button type="submit">Move Cursor</Button>
                </DialogFooter>
            </DialogHeader>
        </form>
    );
};