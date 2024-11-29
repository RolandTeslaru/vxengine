import React from 'react'
import { useUIManagerAPI } from './store'
import { Dialog, DialogContent } from '@vxengine/components/shadcn/dialog';

const UIManagerDialog = () => {
    const isDialogOpen = useUIManagerAPI(state => state.isDialogOpen);
    const dialogContent = useUIManagerAPI(state => state.dialogContent);
    const closeDialog = useUIManagerAPI(state => state.closeDialog);

  return (
    <Dialog open={isDialogOpen} onOpenChange={closeDialog}>
        <DialogContent>
            {dialogContent}
        </DialogContent>
    </Dialog>
  )
}

export default UIManagerDialog
