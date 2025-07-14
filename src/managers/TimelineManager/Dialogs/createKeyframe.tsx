import { DialogHeader, Input, DialogFooter, Button, DialogTitle, Label, DialogDescription } from "@vxengine/ui/foundations";
import React, { useRef } from "react";
import { useTimelineManagerAPI } from "..";
import { pushDialogStatic, useUIManagerAPI } from "@vxengine/managers/UIManager/store";
import { extractDataFromTrackKey } from "../utils/trackDataProcessing";

export const DIALOG_createKeyframe = () => {
    const tracks = useTimelineManagerAPI((state) => state.tracks);
    const trackKeys = Object.keys(tracks);

    const trackKeyRef = useRef<HTMLInputElement>(null);
    const valueRef = useRef<HTMLInputElement>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Retrieve input values directly from refs
        const trackKey = trackKeyRef.current?.value || "";
        const {vxkey, propertyPath} = extractDataFromTrackKey(trackKey)
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

        useTimelineManagerAPI
            .getState()
            .createKeyframe({ vxkey, propertyPath, value });
    };

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
                                className="text-right font-roboto-mono"
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
                                className="text-right font-roboto-mono "
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
                <Button 
                    onClick={() => pushDialogStatic({
                        content: <DIALOG_createKeyframe />, 
                        type:"normal"})
                    }
                >OpenDialog</Button>
            </DialogHeader>
        </>
    );
};