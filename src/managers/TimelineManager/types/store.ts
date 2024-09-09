import { ITrack } from "vxengine/AnimationEngine/types/track";

export interface TimelineEditorStoreProps {
    editorData: ITrack[]
    scale: number
    setScale: (count: number) => void
    cursorTime: number
    width: number
    setWidth: (width: number) => void
    activeTool: string
    setActiveTool: (tool: string) => void
    snap: boolean
    setSnap: (value: boolean) => void
    scaleCount: number
    setScaleCount: (count: number) => void
}