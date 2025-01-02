import { useTimelineEditorAPI } from '@vxengine/managers/TimelineManager';
import { keyframesRef, trackSegmentsRef } from '@vxengine/utils/useRefStore';
import { handleKeyframeDrag } from '../Keyframe/utils';
import { segmentStartLeft } from './TrackSegment';


export interface updateUIProps {
    firstKeyframeKey: string;
    secondKeyframeKey: string;
    newLeft?: number;
    newWidth?: number;
}


export const handleTrackSegmentMutation = ({
    firstKeyframeKey, 
    secondKeyframeKey, 
    newLeft, 
    newWidth
}: updateUIProps) => {
    const trackSegmentKey = `${firstKeyframeKey}.${secondKeyframeKey}`

    const tsElement = trackSegmentsRef.get(trackSegmentKey);
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
    secondKeyframeKey: string
) => {
    const { selectedKeyframeKeys, selectKeyframe, clearSelectedKeyframes , setSelectedTrackSegment} = useTimelineEditorAPI.getState();

    if(!selectedKeyframeKeys[trackKey]){
        clearSelectedKeyframes();

        selectKeyframe(trackKey, firstKeyframeKey)
        selectKeyframe(trackKey, secondKeyframeKey)

        setSelectedTrackSegment(firstKeyframeKey, secondKeyframeKey, trackKey)
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
        setSelectedTrackSegment(firstKeyframeKey, secondKeyframeKey, trackKey)
    }

    const staleFirstKfLeft = parseFloat(keyframesRef.get(firstKeyframeKey).dataset.left);
    const deltaPixel = newLeft - prevLeft;
    const hydratedFirstKfLeft = staleFirstKfLeft + deltaPixel;

    handleKeyframeDrag(
        hydratedFirstKfLeft,
        staleFirstKfLeft,
        trackKey,
        firstKeyframeKey,
        true,
        true
    )
}
