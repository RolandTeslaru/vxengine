import React, { useEffect } from 'react'
import { useUIManagerAPI } from './store'
import { Dialog, DialogContent, DialogOverlay } from '@vxengine/components/shadcn/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@vxengine/components/shadcn/alertDialog';
import classNames from 'classnames';

const DIALOG_MAP = {
  normal: ({ id, content, open, closeDialog, className, index, dialogTotal, theme }) => {
    const scale_offset = (index - (dialogTotal - 1)) * 8;
    const y_offset = (index - (dialogTotal - 1)) * 40;
    const finalScale = 1 + scale_offset / 100;

    return (
      <Dialog key={id} open={open} onOpenChange={() => closeDialog(id)}>
        <DialogContent
          style={{
            transform: `translate(-50%, -50%) translateY(${y_offset}px) scale(${finalScale})`,
            filter: `brightness(${1 / -(index - dialogTotal)})`,
          }}
          darkenBackground={index === 0}
          blockTransparency={dialogTotal - index > 1}
          className={className}
          theme={theme}
        >
          {content}
        </DialogContent>
      </Dialog>
    );
  },

  alert: ({ id, content, open, closeDialog, className, index, dialogTotal, showTriangle, type }) => {
    const scale_offset = (index - (dialogTotal - 1)) * 8;
    const y_offset = (index - (dialogTotal - 1)) * 40;
    const finalScale = 1 + scale_offset / 100;

    return (
      <AlertDialog key={id} open={open} onOpenChange={() => closeDialog(id)}>
        <AlertDialogContent
          className={`flex flex-row ${className}`}
          style={{
            transform: `translate(-50%, -50%) translateY(${y_offset}px) scale(${finalScale})`,
            filter: `brightness(${1 / -(index - dialogTotal)})`,
          }}
          darkenBackground={index === 0}
          blockTransparency={dialogTotal - index > 1}
          showTriangle={showTriangle}
          type={type}
        >
          {content}
        </AlertDialogContent>
      </AlertDialog>
    );
  },

  danger: ({ id, content, open, closeDialog, className, index, dialogTotal, showTriangle, type }) => {
    const scale_offset = (index - (dialogTotal - 1)) * 8;
    const y_offset = (index - (dialogTotal - 1)) * 40;
    const finalScale = 1 + scale_offset / 100;

    return (
      <AlertDialog key={id} open={open} onOpenChange={() => closeDialog(id)}>
        <AlertDialogContent
          className={`flex flex-row ${className}`}
          style={{
            transform: `translate(-50%, -50%) translateY(${y_offset}px) scale(${finalScale})`,
            filter: `brightness(${1 / -(index - dialogTotal)})`,
          }}
          darkenBackground={index === 0}
          blockTransparency={dialogTotal - index > 1}
          showTriangle={showTriangle}
          type={type}
        >
          {content}
        </AlertDialogContent>
      </AlertDialog>
    );
  },
};

export const UIManagerDialogLayer = () => {
  const dialogContentMap = useUIManagerAPI(state => state.dialogContent);
  // Convert the Map values to an array while preserving order.
  const dialogContent = Array.from(dialogContentMap.values());
  const dialogTotal = dialogContent.length;
  const closeDialog = useUIManagerAPI(state => state.closeDialog);

  const theme = useUIManagerAPI(state => state.theme)

  return (
    <>
      {dialogContent.map(({ id, content, type, className, showTriangle, open }, index) => {
        const DialogComponent = DIALOG_MAP[type] || DIALOG_MAP.normal; // Default to normal dialog
        return (
          <DialogComponent
            key={id}
            id={id}
            content={content}
            open={open}
            closeDialog={closeDialog}
            className={className}
            index={index}
            dialogTotal={dialogTotal}
            theme={theme}
            showTriangle={showTriangle}
            type={type}
          />
        );
      })}
    </>
  )
}
