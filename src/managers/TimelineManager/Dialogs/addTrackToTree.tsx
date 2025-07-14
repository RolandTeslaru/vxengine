import { DialogHeader, Input, DialogFooter, Button, DialogTitle, Label } from "@vxengine/ui/foundations";
import React from 'react'
import { useTimelineEditorAPI } from '../TimelineEditor/store'

const DIALOG_addTrackToTree = () => {
    

    return (
        <form onSubmit={handleSubmit}>
            <DialogHeader>
                <DialogTitle>Add Track To Tree</DialogTitle>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="vxkey" className="text-right">
                            vxkey
                        </Label>
                        <Input id="vxkey" name="vxkey" className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="propertyPath" className="text-right">
                            Property Path
                        </Label>
                        <Input id="propertyPath" name="propertyPath" className="col-span-3" />
                    </div>
                </div>
                <DialogFooter>
                    <Button type="submit">Add to Tree</Button>
                </DialogFooter>
            </DialogHeader>
        </form>
    )
}

export default DIALOG_addTrackToTree

const handleSubmit = (e: any) => {
    e.preventDefault();
    const vxkey = e.target.vxkey.value;
    const propertyPath = e.target.propertyPath.value;

    useTimelineEditorAPI.getState().addTrackToTrackTree({vxkey, propertyPath})
};