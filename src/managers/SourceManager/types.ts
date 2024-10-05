import { ITimeline } from "@vxengine/AnimationEngine/types/track"

export interface SourceManagerAPIProps {
    diskFilePath: string,
    setDiskFilePath: (path: string) => void

    autoSaveInterval: number,
    setAutoSaveInterval: (interval: number) => void,

    showSyncPopup: boolean,
    setShowSyncPopup: (value: boolean) => void

    saveDataToDisk: () => void,
    saveDataToLocalStorage: () => void

    syncLocalStorage: (timelines: ITimeline[]) => void

    overwriteLocalStorageData: (data: ITimeline[]) => void
    overwriteDiskData: (data: ITimeline[]) => void

    addBeforeUnloadListener: () => void
    removeBeforeUnloadListener: () => void
    handleBeforeUnload: (event: BeforeUnloadEvent) => void
}