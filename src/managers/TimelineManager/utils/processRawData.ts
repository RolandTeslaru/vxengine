import { IKeyframe, IStaticProps, ITrack, RawObjectProps } from "@vxengine/AnimationEngine/types/track";
import { EditorObjectProps } from "../types/store";
import { computeGroupPaths } from "./trackDataProcessing";

export default function processRawData(
    rawObjects: RawObjectProps[]
) {
    const editorObjects: Record<string, EditorObjectProps> = {};
    const tracks: Record<string, ITrack> = {};
    const staticProps: Record<string, IStaticProps> = {};
    const keyframes: Record<string, IKeyframe> = {};

    // Create Records
    rawObjects.forEach((rawObj) => {
        const trackKeys: string[] = [];
        const staticPropKeys: string[] = [];

        // Create Track Record
        rawObj.tracks.forEach((track) => {
            const keyframeIds: string[] = [];
            const trackKey = `${rawObj.vxkey}.${track.propertyPath}`;

            // Create Keyframe Record
            track.keyframes.forEach((kf) => {
                const keyframeId = kf.id || `keyframe-${Date.now()}`;
                const newKeyframe: IKeyframe = {
                    id: keyframeId,
                    vxkey: rawObj.vxkey,
                    propertyPath: track.propertyPath,
                    time: kf.time,
                    value: kf.value,
                    handles: kf.handles
                }
                keyframes[keyframeId] = newKeyframe
                keyframeIds.push(keyframeId);
            });

            const newTrack: ITrack = {
                keyframes: keyframeIds,
                propertyPath: track.propertyPath,
                vxkey: rawObj.vxkey,
            };
            trackKeys.push(trackKey);
            tracks[trackKey] = newTrack;
        });

        // Create StaticProp Record 
        rawObj.staticProps.forEach((prop) => {
            const staticPropKey = `${rawObj.vxkey}.${prop.propertyPath}`;
            staticPropKeys.push(staticPropKey);

            const newStaticProp: IStaticProps = {
                vxkey: rawObj.vxkey,
                value: prop.value,
                propertyPath: prop.propertyPath
            };
            staticProps[staticPropKey] = newStaticProp;
        });

        editorObjects[rawObj.vxkey] = {
            vxkey: rawObj.vxkey,
            trackKeys: trackKeys,
            staticPropKeys: staticPropKeys,
        };
    });
    const groupedPaths = computeGroupPaths(editorObjects)

    return { editorObjects, tracks, staticProps, groupedPaths, keyframes };
}
