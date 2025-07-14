import React from "react";
import { useTimelineManagerAPI } from "..";
import { DialogHeader, DialogTitle, Input, DialogFooter, Button, Label } from "@vxengine/ui/foundations";

export const DIALOG_setKeyframeValue = () => {
    const setKeyframeValue = useTimelineManagerAPI((state) => state.setKeyframeValue);

    const handleSubmit = (e: any) => {
        e.preventDefault();
        const trackKey = e.target.trackKey.value;
        const keyframeKey = e.target.keyframeKey.value;
        const newValue = parseFloat(e.target.newValue.value);

        const track = useTimelineManagerAPI.getState().tracks[trackKey]
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