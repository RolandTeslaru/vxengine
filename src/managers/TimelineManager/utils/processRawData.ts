import { IKeyframe, ISpline, IStaticProps, ITrack, RawObjectProps, RawSpline } from "@vxengine/AnimationEngine/types/track";
import { EditorObjectProps } from "../types/store";
import { buildTrackTree } from "./trackDataProcessing";

import { getNodeEnv } from "@vxengine/constants";

export default function processRawData(
    rawObjects: RawObjectProps[], rawSplines: Record<string, RawSpline>
) {
    const editorObjects: Record<string, EditorObjectProps> = {};
    const tracks: Record<string, ITrack> = {};
    const staticProps: Record<string, IStaticProps> = {};
    const splines: Record<string, ISpline> = {};

    // Create Records
    rawObjects.forEach((rawObj) => {
        const trackKeys: string[] = [];
        const staticPropKeys: string[] = [];

        // Create Track Record
        rawObj.tracks.forEach((rawTrack) => {
            const keyframeIds: string[] = [];
            const trackKey = `${rawObj.vxkey}.${rawTrack.propertyPath}`;

            const newTrack: ITrack = {
                keyframes: {} as Record<string, IKeyframe>,
                propertyPath: rawTrack.propertyPath,
                vxkey: rawObj.vxkey,
                orderedKeyframeKeys: []
            };
            // Create Keyframe Record
            rawTrack.keyframes.forEach((rawKeyframe) => {
                const keyframeId = rawKeyframe.id || `keyframe-${Date.now()}`;
                const newKeyframe: IKeyframe = {
                    id: keyframeId,
                    vxkey: rawObj.vxkey,
                    propertyPath: rawTrack.propertyPath,
                    time: rawKeyframe.time,
                    value: rawKeyframe.value,
                    handles: {
                        in: {
                            x: rawKeyframe.handles[0],
                            y: rawKeyframe.handles[1]
                        },
                        out: {
                            x: rawKeyframe.handles[2],
                            y: rawKeyframe.handles[3]
                        }
                    }
                }
                newTrack.keyframes[keyframeId] = newKeyframe;
                newTrack.orderedKeyframeKeys.push(keyframeId);
            });

            
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

    let trackTree;

    const IS_DEVELOPMENT = getNodeEnv() === "development"
    if(IS_DEVELOPMENT)
        trackTree = buildTrackTree(tracks);
    else 
        trackTree = {}

    // Just to be sure recreate the edSpline object
    Object.values(rawSplines).forEach(rawSpline => {
        splines[rawSpline.splineKey] = rawSpline
    })

    return { editorObjects, tracks, staticProps, splines, trackTree };
}
