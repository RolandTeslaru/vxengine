import { DialogHeader, Input, DialogFooter, Button, DialogTitle, Label } from "@vxengine/ui/foundations";
import React from "react";
import { useTimelineEditorAPI } from "../TimelineEditor/store";
import { useTimelineManagerAPI } from "..";

export const DIALOG_moveToNextKeyframe = () => {
    const moveToNextKeyframe = useTimelineEditorAPI((state) => state.moveToNextKeyframe);
    const tracks = useTimelineManagerAPI((state) => state.tracks);

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