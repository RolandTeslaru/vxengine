import { ITrack } from "vxengine/AnimationEngine/types/track";


export interface PathGroup {
    children: Record<string, PathGroup>;
    track: ITrack | null;
    rowIndex?: number;
    prevRowIndex?: number;
    nextRowIndex?: number;
    localFinalTrackIndex?: number;
}