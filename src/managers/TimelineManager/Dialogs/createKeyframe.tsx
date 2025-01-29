import { Button } from "@vxengine/components/shadcn/button";
import { DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@vxengine/components/shadcn/dialog";
import { Input } from "@vxengine/components/shadcn/input";
import { Label } from "@vxengine/components/shadcn/label";
import React, { useRef } from "react";
import { useTimelineEditorAPI } from "../TimelineEditor/store";
import { useTimelineManagerAPI } from "..";
import { useUIManagerAPI } from "@vxengine/managers/UIManager/store";
import { ALERT_ResetProperty } from "@vxengine/components/ui/DialogAlerts/Alert";

export const DIALOG_createKeyframe = () => {
    const tracks = useTimelineManagerAPI((state) => state.tracks);
    const trackKeys = Object.keys(tracks);

    const trackKeyRef = useRef<HTMLInputElement>(null);
    const valueRef = useRef<HTMLInputElement>(null);

    const createKeyframe = useTimelineManagerAPI((state) => state.createKeyframe);

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
                    {`useTimelineManagerAPI.createKeyframe()`}
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