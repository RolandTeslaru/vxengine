import { EditorKeyframe, EditorObject, EditorSpline, EditorStaticProp, EditorTrack } from "@vxengine/types/data/editorData";
import { RawObject, RawSpline } from "@vxengine/types/data/rawData";

export default function processRawData(
    rawObjects: RawObject[], rawSplines: Record<string, RawSpline>
) {
    const splines: Record<string, EditorSpline> = {};

    // Just to be sure recreate the edSpline object
    Object.values(rawSplines).forEach(rawSpline => {
        splines[rawSpline.splineKey] = {
            splineKey: rawSpline.splineKey,
            vxkey: rawSpline.vxkey,
            nodes: rawSpline.nodes.map(node => [...node])
        }
    })

    return { splines };
}
