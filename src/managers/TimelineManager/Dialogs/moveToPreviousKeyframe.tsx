import { Button } from "@vxengine/components/shadcn/button";
import { DialogFooter, DialogHeader, DialogTitle } from "@vxengine/components/shadcn/dialog";
import { Input } from "@vxengine/components/shadcn/input";
import { Label } from "@vxengine/components/shadcn/label";
import React from "react";
import { useTimelineEditorAPI } from "../TimelineEditor/store";
import { useTimelineManagerAPI } from "..";

export const DIALOG_moveToPreviousKeyframe = () => {
    const moveToPreviousKeyframe = useTimelineEditorAPI((state) => state.moveToPreviousKeyframe);
    const tracks = useTimelineManagerAPI((state) => state.tracks);

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