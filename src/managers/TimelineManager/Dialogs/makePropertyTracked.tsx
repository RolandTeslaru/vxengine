import { Button } from "@vxengine/components/shadcn/button";
import { DialogFooter, DialogHeader, DialogTitle } from "@vxengine/components/shadcn/dialog";
import { Input } from "@vxengine/components/shadcn/input";
import { Label } from "@vxengine/components/shadcn/label";
import React from "react";
import { useTimelineEditorAPI } from "../TimelineEditor/store";
import { useTimelineManagerAPI } from "..";

export const DIALOG_makePropertyTracked = () => {
    const makePropertyTracked = useTimelineManagerAPI((state) => state.makePropertyTracked);

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