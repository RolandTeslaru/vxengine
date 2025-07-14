import { DialogHeader, Input, DialogFooter, Button, DialogTitle, Label } from "@vxengine/ui/foundations";
import React from "react";
import { useTimelineEditorAPI } from "../TimelineEditor/store";
import { useTimelineManagerAPI } from "..";
import { extractDataFromTrackKey } from "../utils/trackDataProcessing";

export const DIALOG_makePropertyTracked = () => {
    const handleSubmit = (e: any) => {
        e.preventDefault();
        const staticPropKey = e.target.staticPropKey.value;
        const {vxkey, propertyPath} = extractDataFromTrackKey(staticPropKey)

        if (!staticPropKey) {
            alert("Please provide a valid StaticProp key!");
            return;
        }

        useTimelineManagerAPI
            .getState()
            .makePropertyTracked(vxkey, propertyPath, true)
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