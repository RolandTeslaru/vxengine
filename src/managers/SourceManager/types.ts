import { RawProject } from "@vxengine/types/data/rawData"
import { LocalStorageDataType } from "./store"

export interface SourceManagerAPIProps {
    autoSaveInterval: number,
    setAutoSaveInterval: (interval: number) => void,

    getLocalStorageProject: (projectName: string) => RawProject | null

    saveDataToDisk: (props?: { force?: boolean, reloadOnSuccess?: boolean}) => void,
    saveDataToLocalStorage: (props?: {force?: boolean}) => void,

    initializeLocalStorage: (diskData: RawProject) => void
    initializeProjectInLocalStorage: (localStorageData: LocalStorageDataType, diskData: RawProject) => void

    syncLocalStorage: (diskData: RawProject) => void

    handleBeforeUnload: (event: BeforeUnloadEvent) => void
}