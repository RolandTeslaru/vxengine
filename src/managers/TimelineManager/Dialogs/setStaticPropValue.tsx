import React from "react";
import { useTimelineManagerAPI } from "..";
import { DialogHeader, DialogTitle, Input, DialogFooter, Button, Label } from "@vxengine/ui/foundations";

export const DIALOG_setStaticPropValue = () => {
    const setStaticPropValue = useTimelineManagerAPI((state) => state.setStaticPropValue);
    const staticProps = useTimelineManagerAPI((state) => state.staticProps);

    const handleSubmit = (e: any) => {
        e.preventDefault();
        const staticPropKey = e.target.staticPropKey.value;
        const newValue = parseFloat(e.target.newValue.value);

        if (!staticProps[staticPropKey]) {
            alert("Invalid StaticProp key!");
            return;
        }

        if (isNaN(newValue)) {
            alert("Please provide a valid value!");
            return;
        }

        setStaticPropValue(staticPropKey, newValue, true);
    };

    return (
        <form onSubmit={handleSubmit}>
            <DialogHeader>
                <DialogTitle>Set StaticProp Value</DialogTitle>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="staticPropKey" className="text-right">
                            StaticProp Key
                        </Label>
                        <Input id="staticPropKey" name="staticPropKey" className="col-span-3" />
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