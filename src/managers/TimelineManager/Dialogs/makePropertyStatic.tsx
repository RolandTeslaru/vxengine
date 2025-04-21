import { Button } from "@vxengine/components/shadcn/button";
import { DialogFooter, DialogHeader, DialogTitle } from "@vxengine/components/shadcn/dialog";
import { Input } from "@vxengine/components/shadcn/input";
import { Label } from "@vxengine/components/shadcn/label";
import React from "react";
import { useTimelineEditorAPI } from "../TimelineEditor/store";
import { useTimelineManagerAPI } from "..";

export const DIALOG_makePropertyStatic = () => {
    const makePropertyStatic = useTimelineManagerAPI((state) => state.makePropertyStatic);

    const handleSubmit = (e: any) => {
        e.preventDefault();
        const vxkey = e.target.vxkey.value;
        const propertyPath = e.target.propertyPath.value

        if (!vxkey) {
            alert("Please provide a valid vxkey!");
            return;
        }
        if (!propertyPath) {
            alert("Please provide a valid propertyPath!");
            return;
        }

        makePropertyStatic(vxkey, propertyPath, true);
    };

    return (
        <form onSubmit={handleSubmit}>
            <DialogHeader>
                <DialogTitle>Make Property Static</DialogTitle>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="trackKey" className="text-right">
                            vxkey
                        </Label>
                        <Input id="vxkey" name="vxkey" className="col-span-3" />
                        <Label htmlFor="propertyPath" className="text-right">
                            propertyPath
                        </Label>
                        <Input id="propertyPath" name="propertyPath" className="col-span-3" />
                    </div>
                </div>
                <DialogFooter>
                    <Button type="submit">Make Static</Button>
                </DialogFooter>
            </DialogHeader>
        </form>
    );
};
