import React, { useEffect } from 'react'
import { useUIManagerAPI } from './store'
import { Dialog, DialogContent, DialogOverlay } from '@vxengine/components/shadcn/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@vxengine/components/shadcn/alertDialog';

export const UIManagerDialogLayer = () => {
  const dialogContentMap = useUIManagerAPI(state => state.dialogContent);
  // Convert the Map values to an array while preserving order.
  const dialogContent = Array.from(dialogContentMap.values());
  const dialogTotal = dialogContent.length;
  const closeDialog = useUIManagerAPI(state => state.closeDialog);

  return (
    <>
      {dialogContent.map(({ id, content, type, className, showTriangle, open }, index) => {
        const scale_offset = (index - (dialogTotal - 1)) * 8;
        const y_offset = (index - (dialogTotal - 1)) * 40;

        if (type === "normal") {
          return (
            <Dialog key={id} open={open} onOpenChange={() => closeDialog(id)}>
              <DialogContent
                style={{
                  transform: `translate(-50%, -50%) translateY(${y_offset}px) scale(${1 + scale_offset / 100})`,
                  filter: `brightness(${1 / -(index - dialogTotal)})`,
                }}
                darkenBackground={index === 0}
                blockTransparency={dialogTotal - index > 1}
                className={className}
              >
                {content}
              </DialogContent>
            </Dialog>
          )
        }
        else  {
          return (
            <AlertDialog key={id} open={open} onOpenChange={() => closeDialog(id)}>
              <AlertDialogContent
                className={"flex flex-row" + " " + className}
                style={{
                  transform: `translate(-50%, -50%) translateY(${y_offset}px) scale(${1 + scale_offset / 100})`,
                  filter: `brightness(${1 / -(index - dialogTotal)})`,
                }}
                darkenBackground={index === 0}
                blockTransparency={dialogTotal - index > 1}
                type={type}
              >
                {/* <HazardStripes opacity={0.05}/> */}
                {content}
                {/* <HazardStripes opacity={0.05} /> */}
              </AlertDialogContent>
            </AlertDialog>
          )
        }
      })}
    </>
  )
}
