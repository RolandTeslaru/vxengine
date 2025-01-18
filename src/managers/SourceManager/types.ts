import { ITimeline } from "@vxengine/AnimationEngine/types/track"
import { DiskProjectProps } from "@vxengine/types/engine"
import { LocalStorageDataType } from "./store"

export interface SourceManagerAPIProps {
    autoSaveInterval: number,
    setAutoSaveInterval: (interval: number) => void,

    showSyncPopup: boolean,
    setShowSyncPopup: (value: boolean) => void

    saveDataToDisk: (props?: { force?: boolean, reloadOnSuccess?: boolean}) => void,
    saveDataToLocalStorage: (props?: {force?: boolean}) => void,

    initializeLocalStorage: (diskData: DiskProjectProps) => void
    initializeProjectInLocalStorage: (localStorageData: LocalStorageDataType, diskData: DiskProjectProps) => void

    syncLocalStorage: (diskData: DiskProjectProps) => void

    handleBeforeUnload: (event: BeforeUnloadEvent) => void
}