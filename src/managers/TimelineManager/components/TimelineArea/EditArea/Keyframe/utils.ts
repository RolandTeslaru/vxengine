import { useTimelineEditorAPI } from "@vxengine/managers/TimelineManager";

export const selectAllKeyframesAfter = (trackKey: string, keyframeKey: string) => {
    const state = useTimelineEditorAPI.getState();
    const track = state.tracks[trackKey];
    const orderedKeyframeKeys = track.orderedKeyframeKeys;
    const selectKeyframe = state.selectKeyframe;

    let found = false;
    for (const kfKey of orderedKeyframeKeys) {
        if (kfKey === keyframeKey) {
            found = true;
        }
        if (found) {
            selectKeyframe(trackKey, kfKey);
        }
    }

}
export const selectAllKeyframesBefore = (trackKey: string, keyframeKey: string) => {
    const state = useTimelineEditorAPI.getState();
    const track = state.tracks[trackKey];
    const orderedKeyframeKeys = track.orderedKeyframeKeys;
    const selectKeyframe = state.selectKeyframe;

    for (const kfKey of orderedKeyframeKeys) {
        if (kfKey === keyframeKey) {
            break; // Stop iteration once we reach the specified keyframe
        }
        selectKeyframe(trackKey, kfKey);
    }
}

export const selectAllKeyframesOnTrack = (trackKey: string) => {
    const state = useTimelineEditorAPI.getState();
    const selectKeyframe = state.selectKeyframe;
    const track = state.tracks[trackKey];

    const orderedKeyframeKeys = track.orderedKeyframeKeys;

    for (const kfKey of orderedKeyframeKeys) {
        selectKeyframe(trackKey, kfKey);
    }
}

export const selectAllKeyframesOnObject = (trackKey: string) => {
    const state = useTimelineEditorAPI.getState();

    const vxkey = trackKey.split(".")[0];
    const edObject = state.editorObjects[vxkey];
    if(edObject){
        edObject.trackKeys.forEach((_trackKey) => {
            selectAllKeyframesOnTrack(_trackKey);
        })
    }
}