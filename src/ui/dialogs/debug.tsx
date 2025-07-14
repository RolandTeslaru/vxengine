import { pushDialogStatic } from '@vxengine/managers/UIManager/store'
import { AlertDialogAction, AlertDialogCancel, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, Button, DialogDescription, DialogFooter, DialogHeader, DialogTitle, Input, Label } from '@vxengine/ui/foundations'
import React from 'react'


export const DEBUG_NORMAL_dialog = () => {
    return (
        <>
            <DialogHeader>
                <DialogTitle>Normal Dialog Title</DialogTitle>
                <DialogDescription className='max-w-[500px]'>
                    Normal Dialog Description
                    Lorem ipsum dolor sit amet consectetur adipisicing elit. Reprehenderit, delectus voluptas ex velit nam at? Tempora molestiae quam minus atque itaque reiciendis fugit? Quos quibusdam ea nemo reiciendis, suscipit ducimus.
                </DialogDescription>
                <Button
                    onClick={() => pushDialogStatic({
                        content: <DEBUG_NORMAL_dialog />,
                        type: "normal"
                    })
                    }
                >Open Normal Dialog</Button>
                <Button
                    onClick={() => pushDialogStatic({
                        content: <DEBUG_DANGER_dialog />,
                        type: "danger"
                    })
                    }
                >Open Danger Dialog</Button>
                <Button
                    onClick={() => pushDialogStatic({
                        content: <DEBUG_ALERT_dialog />,
                        type: "alert"
                    })
                    }
                >Open Alert Dialog</Button>
            </DialogHeader>
        </>
    );
};


export const DEBUG_DANGER_dialog = () => {
    return (
        <div className='flex flex-col gap-4'>
            <AlertDialogHeader className='flex flex-col'>
                <AlertDialogTitle>DANGER Dialog Title</AlertDialogTitle>
                <AlertDialogDescription>
                    Danger Dialog Description
                    Lorem ipsum dolor sit amet consectetur adipisicing elit. Id aperiam maxime quas magnam accusantium delectus nemo, reiciendis repellendus veritatis cum. Qui repellat dignissimos vitae ad, beatae maiores aspernatur quia et?
                </AlertDialogDescription>
                <Button
                    onClick={() => pushDialogStatic({
                        content: <DEBUG_NORMAL_dialog />,
                        type: "normal"
                    })
                    }
                >Open Normal Dialog</Button>
                <Button
                    onClick={() => pushDialogStatic({
                        content: <DEBUG_DANGER_dialog />,
                        type: "danger"
                    })
                    }
                >Open Danger Dialog</Button>
                <Button
                    onClick={() => pushDialogStatic({
                        content: <DEBUG_ALERT_dialog />,
                        type: "alert"
                    })
                    }
                >Open Alert Dialog</Button>

            </AlertDialogHeader>
        </div>
    )
}

export const DEBUG_ALERT_dialog = () => {

    return (
        <>
            <div className='flex flex-col gap-4'>
                <AlertDialogHeader className='flex flex-col'>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Alert Dialog Description
                        Lorem, ipsum dolor sit amet consectetur adipisicing elit. At veniam culpa autem, suscipit accusamus atque numquam magnam provident cum? A ad delectus eveniet et! Atque nam dolor eos veritatis consectetur.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <Button
                    onClick={() => pushDialogStatic({
                        content: <DEBUG_NORMAL_dialog />,
                        type: "normal"
                    })
                    }
                >Open Normal Dialog</Button>
                <Button
                    onClick={() => pushDialogStatic({
                        content: <DEBUG_DANGER_dialog />,
                        type: "danger"
                    })
                    }
                >Open Danger Dialog</Button>
                <Button
                    onClick={() => pushDialogStatic({
                        content: <DEBUG_ALERT_dialog />,
                        type: "alert"
                    })
                    }
                >Open Alert Dialog</Button>
                <AlertDialogFooter>
                    <p className='text-neutral-600 text-opacity-40 text-sm font-roboto-mono mr-auto my-auto '>{`MakePropertyStatic()`}</p>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                </AlertDialogFooter>
            </div>
        </>
    )
}