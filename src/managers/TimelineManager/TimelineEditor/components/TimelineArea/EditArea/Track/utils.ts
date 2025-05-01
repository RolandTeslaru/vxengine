import { useTimelineManagerAPI } from '@vxengine/managers/TimelineManager';
import { handleKeyframeDrag } from '../Keyframe/utils';
import { segmentStartLeft } from './TrackSegment';
import { useTimelineEditorAPI } from '@vxengine/managers/TimelineManager/TimelineEditor/store';


export interface updateUIProps {
    firstKeyframeKey: string;
    secondKeyframeKey: string;
    trackSegmentsMap: Map<string, HTMLElement>;
    newLeft?: number;
    newWidth?: number;
}


export const handleTrackSegmentMutation = ({
    firstKeyframeKey, 
    secondKeyframeKey, 
    trackSegmentsMap,
    newLeft, 
    newWidth,
}: updateUIProps) => {
    const trackSegmentKey = `${firstKeyframeKey}.${secondKeyframeKey}`

    const tsElement = trackSegmentsMap.get(trackSegmentKey);
    if(newLeft){
        tsElement.style.left = `${newLeft}px`
        Object.assign(tsElement.dataset, { left: newLeft + segmentStartLeft })
    }
    if(newWidth){
        tsElement.style.width = `${newWidth}px`;
        Object.assign(tsElement.dataset, {width: newWidth})
    }
}


export const handleTrackDrag = (
    newLeft: number, 
    prevLeft: number, 
    trackKey: string, 
    firstKeyframeKey: string, 
    secondKeyframeKey: string,
    keyframesMap: Map<string, HTMLElement>,
    trackSegmentsMap: Map<string, HTMLElement>
) => {
    const { selectedKeyframeKeys, selectKeyframe, clearSelectedKeyframes , clearSelectedTrackSegments, selectTrackSegment, selectedTrackSegments} = useTimelineEditorAPI.getState();

    const segmentKey = `${firstKeyframeKey}.${secondKeyframeKey}`

    if(!selectedKeyframeKeys[trackKey]){
        clearSelectedKeyframes();

        selectKeyframe(trackKey, firstKeyframeKey)
        selectKeyframe(trackKey, secondKeyframeKey)
    }
    else{
        const isFirstKfSelected = firstKeyframeKey in selectedKeyframeKeys[trackKey];
        const isSecondKfSelected = firstKeyframeKey in selectedKeyframeKeys[trackKey];
    
        if(!isFirstKfSelected || !isSecondKfSelected){
            clearSelectedKeyframes();
            if(!isFirstKfSelected)
                selectKeyframe(trackKey, firstKeyframeKey)
            if(!isSecondKfSelected)
                selectKeyframe(trackKey, secondKeyframeKey)
        }
    }

    // Ensure only one track is selected while dragging
    if(!(segmentKey in selectedTrackSegments)){
        if(Object.keys(selectedTrackSegments).length > 0)
            clearSelectedTrackSegments();
        selectTrackSegment(firstKeyframeKey, secondKeyframeKey, trackKey);
    } else {
        if(Object.keys(selectedTrackSegments).length > 1){
            clearSelectedTrackSegments()
            selectTrackSegment(firstKeyframeKey, secondKeyframeKey, trackKey)
        }
    }


    const staleFirstKfLeft = parseFloat(keyframesMap.get(firstKeyframeKey).dataset.left);
    const deltaPixel = newLeft - prevLeft;
    const hydratedFirstKfLeft = staleFirstKfLeft + deltaPixel;

    handleKeyframeDrag(
        hydratedFirstKfLeft,
        staleFirstKfLeft,
        trackKey,
        firstKeyframeKey,
        true,
        true,
        keyframesMap,
        trackSegmentsMap
    )
}
