import { Button } from "@vxengine/components/shadcn/button";
import { DialogFooter, DialogHeader, DialogTitle } from "@vxengine/components/shadcn/dialog";
import { Input } from "@vxengine/components/shadcn/input";
import { Label } from "@vxengine/components/shadcn/label";
import React from "react";
import { useTimelineEditorAPI } from "../TimelineEditor/store";
import { useTimelineManagerAPI } from "..";

export const DIALOG_createStaticProp = () => {
    const createStaticProp = useTimelineManagerAPI((state) => state.createStaticProp);

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
