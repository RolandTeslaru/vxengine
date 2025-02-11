import { buildTrackTree } from "./trackDataProcessing";

import { useTimelineEditorAPI } from "../TimelineEditor/store";
import { v4 as uuidv4 } from 'uuid';
import { EditorKeyframe, EditorObject, EditorSpline, EditorStaticProp, EditorTrack } from "@vxengine/types/data/editorData";
import { RawObject, RawSpline } from "@vxengine/types/data/rawData";

export default function processRawData(
    rawObjects: RawObject[], rawSplines: Record<string, RawSpline>
) {
    const editorObjects: Record<string, EditorObject> = {};
    const tracks: Record<string, EditorTrack> = {};
    const staticProps: Record<string, EditorStaticProp> = {};
    const splines: Record<string, EditorSpline> = {};

    // Create Records
    rawObjects.forEach((rawObj) => {
        const trackKeys: string[] = [];
        const staticPropKeys: string[] = [];

        // Create Track Record
        rawObj.tracks.forEach((rawTrack) => {
            const trackKey = `${rawObj.vxkey}.${rawTrack.propertyPath}`;

            const newTrack: EditorTrack = {
                keyframes: {} as Record<string, EditorKeyframe>,
                propertyPath: rawTrack.propertyPath,
                vxkey: rawObj.vxkey,
                orderedKeyframeKeys: []
            };
            // Create Keyframe Record
            rawTrack.keyframes.forEach((rawKeyframe) => {
                const keyframeKey = rawKeyframe.keyframeKey || `keyframe-${uuidv4()}`;
                if(!rawKeyframe.keyframeKey)
                    rawKeyframe.keyframeKey = keyframeKey;
                const newKeyframe: EditorKeyframe = {
                    id: keyframeKey,
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
                newTrack.keyframes[keyframeKey] = newKeyframe;
                newTrack.orderedKeyframeKeys.push(keyframeKey);
            });

            
            trackKeys.push(trackKey);
            tracks[trackKey] = newTrack;
        });

        // Create StaticProp Record 
        rawObj.staticProps.forEach((prop) => {
            const staticPropKey = `${rawObj.vxkey}.${prop.propertyPath}`;
            staticPropKeys.push(staticPropKey);

            const newStaticProp: EditorStaticProp = {
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

    // Just to be sure recreate the edSpline object
    Object.values(rawSplines).forEach(rawSpline => {
        splines[rawSpline.splineKey] = {
            splineKey: rawSpline.splineKey,
            vxkey: rawSpline.vxkey,
            nodes: rawSpline.nodes.map(node => [...node]) 
        }
    })

    return { editorObjects, tracks, staticProps, splines };
}
