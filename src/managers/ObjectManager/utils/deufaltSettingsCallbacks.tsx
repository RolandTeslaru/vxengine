import { ISetting, OnBeforeToggleType } from "@vxengine/AnimationEngine/types/engine"
import { DIALOG_UseSplinePath } from "@vxengine/components/ui/DialogAlerts/Danger"
import { pushDialogStatic } from "@vxengine/managers/UIManager/store"
import React from "react"

export const splinePathToggleCallback: OnBeforeToggleType = (vxkey: string, settingKey: string, setting: ISetting) => {
    return new Promise<boolean>((resolve) => {
        pushDialogStatic({
            content: <DIALOG_UseSplinePath 
                        vxkey={vxkey} 
                        settingKey={settingKey}
                        setting={setting}
                        onCancel={() => resolve(false)}
                        onConfirm={() => resolve(true)}
                    />,
            type: "danger"
        })
    })
}