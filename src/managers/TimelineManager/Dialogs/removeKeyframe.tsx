import { Button } from "@vxengine/components/shadcn/button";
import { DialogFooter, DialogHeader, DialogTitle } from "@vxengine/components/shadcn/dialog";
import { Input } from "@vxengine/components/shadcn/input";
import { Label } from "@vxengine/components/shadcn/label";
import React from "react";
import { useTimelineEditorAPI } from "../TimelineEditor/store";
import { useTimelineManagerAPI } from "..";
import { extractDataFromTrackKey } from "../utils/trackDataProcessing";

export const DIALOG_removeKeyframe = () => {
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


const handleSubmit = (e: any) => {
    e.preventDefault();
    const trackKey = e.target.trackKey.value;
    const {vxkey, propertyPath} = extractDataFromTrackKey(trackKey)
    const keyframeKey = e.target.keyframeKey.value;

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

    useTimelineManagerAPI
        .getState()
        .removeKeyframe({ keyframeKey, vxkey, propertyPath, reRender: true})
};