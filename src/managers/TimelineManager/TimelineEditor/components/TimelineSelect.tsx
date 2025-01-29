import { useAnimationEngineAPI } from '@vxengine/AnimationEngine';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@vxengine/components/shadcn/select';
import { useVXEngine } from '@vxengine/engine';
import React from 'react'


const TimelineSelect = () => {
    const currentTimelineID = useAnimationEngineAPI(state => state.currentTimelineID);
    const timelines = useAnimationEngineAPI(state => state.timelines)

    const animationEngine = useVXEngine(state => state.animationEngine)

    return (
        <Select
            defaultValue={currentTimelineID}
            onValueChange={(value) => {
                animationEngine.setCurrentTimeline(value)
            }}
            value={currentTimelineID}
        >
            <SelectTrigger className="w-[180px] h-7 my-auto">
                <SelectValue className='!text-xs' placeholder="Select a Timeline" />
            </SelectTrigger>
            <SelectContent>
                <SelectGroup>
                    {Object.entries(timelines).map(([key, timeline]) =>
                        <SelectItem value={timeline.id} key={key}>
                            <p style={{ fontSize: "11px" }} >
                                {timeline.name}
                            </p>
                        </SelectItem>
                    )}
                </SelectGroup>
            </SelectContent>
        </Select>
    )
}

export default TimelineSelect
