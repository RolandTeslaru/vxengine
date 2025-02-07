import { IKeyframe, ISpline, IStaticProps, ITrack, RawObjectProps, RawSpline } from "@vxengine/AnimationEngine/types/track";
import { EditorObjectProps } from "../types/store";
import { buildTrackTree } from "./trackDataProcessing";

import { useTimelineEditorAPI } from "../TimelineEditor/store";
import { v4 as uuidv4 } from 'uuid';
import { IS_DEVELOPMENT } from "@vxengine/engine";

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
            const trackKey = `${rawObj.vxkey}.${rawTrack.propertyPath}`;

            const newTrack: ITrack = {
                keyframes: {} as Record<string, IKeyframe>,
                propertyPath: rawTrack.propertyPath,
                vxkey: rawObj.vxkey,
                orderedKeyframeKeys: []
            };
            // Create Keyframe Record
            rawTrack.keyframes.forEach((rawKeyframe) => {
                const keyframeKey = rawKeyframe.keyframeKey || `keyframe-${uuidv4()}`;
                if(!rawKeyframe.keyframeKey)
                    rawKeyframe.keyframeKey = keyframeKey;
                const newKeyframe: IKeyframe = {
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

    if(IS_DEVELOPMENT){
        useTimelineEditorAPI.getState().rebuildTrackTree(tracks)
    }

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
