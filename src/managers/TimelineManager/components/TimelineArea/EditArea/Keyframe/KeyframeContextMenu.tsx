import { ContextMenuContent, ContextMenuItem } from '@vxengine/components/shadcn/contextMenu'
import { Input } from '@vxengine/components/shadcn/input'
import { Popover, PopoverContent, PopoverTrigger } from '@vxengine/components/shadcn/popover'
import { useTimelineEditorAPI } from '@vxengine/managers/TimelineManager'
import React from 'react'

interface Props {
    trackKey: string,
    keyframeKey: string
}

const KeyframeContextMenu: React.FC<Props> = React.memo(({ trackKey, keyframeKey }) => {
    const removeKeyframe = useTimelineEditorAPI(state => state.removeKeyframe)
    const selectedKeyframesFlatMap = useTimelineEditorAPI(state => state.selectedKeyframesFlatMap)

    return (
        <ContextMenuContent>
            <Popover>
                <PopoverTrigger className='w-full hover:bg-neutral-800 rounded-md'
                >
                    <ContextMenuItem
                        className='!pointer-events-none '
                    >
                        <p className='font-sans-menlo text-xs'>
                            Show Data
                        </p>
                    </ContextMenuItem>
                </PopoverTrigger>
                <ShowDataPopover trackKey={trackKey} keyframeKey={keyframeKey} />
            </Popover>
            <ContextMenuItem
                onClick={() => {
                    const selectedKeyframeKeys = useTimelineEditorAPI.getState().selectedKeyframeKeys
                    selectedKeyframesFlatMap.forEach(kf => {
                        removeKeyframe({
                            keyframeKey: kf.keyframeKey,
                            trackKey: kf.trackKey,
                            reRender: true
                        })
                    })
                }}
            >
                <p className='font-sans-menlo text-xs text-red-600'>
                    {selectedKeyframesFlatMap.length < 2 
                    ? <>Delete Keyframe</>
                    : <>Delete Keyframes</>    
                    }
                </p>
            </ContextMenuItem>
        </ContextMenuContent>
    )
})

export default KeyframeContextMenu


const ShowDataPopover = ({ trackKey, keyframeKey }) => {
    const keyframe = useTimelineEditorAPI(state => state.tracks[trackKey]?.keyframes[keyframeKey]);
    const setKeyframeValue = useTimelineEditorAPI(state => state.setKeyframeValue)
    const setKeyframeTime = useTimelineEditorAPI(state => state.setKeyframeTime);

    return (
        <PopoverContent className='gap-2' style={{boxShadow: "0px 0px 5px 10px rgba(0,0,0, 0.3)",}}>
            <p className='font-sans-menlo text-xs text-center mb-2'>Keyframe Data</p>
            <div className='flex flex-col font-sans-menlo text-xs gap-2'>
                <div className='flex flex-row'>
                    <p>value</p>
                    <Input
                        type="number"
                        value={keyframe.value}
                        onChange={(e) => setKeyframeValue(keyframeKey, trackKey, e.target.value as any, true)}
                        className="h-fit ml-auto border-none text-[10px] bg-neutral-800 p-0.5 max-w-[60px]"
                        style={{ boxShadow: "1px 1px 5px 1px rgba(1,1,1,0.2)" }}
                    />
                </div>
                <div className='flex flex-row'>
                    <p>time</p>
                    <Input
                        type="number"
                        value={keyframe.time}
                        onChange={(e) => setKeyframeTime(keyframeKey, trackKey, e.target.value as any, true)}
                        className="h-fit ml-auto border-none text-[10px] bg-neutral-800 p-0.5 max-w-[60px]"
                        style={{ boxShadow: "1px 1px 5px 1px rgba(1,1,1,0.2)" }}
                    />
                </div>
                <div className='flex flex-row'>
                    <p>keyframeKey</p>
                    <p className='ml-auto text-neutral-300'>
                        {keyframeKey}
                    </p>
                </div>
                <div className='flex flex-row'>
                    <p>trackKey</p>
                    <p className='ml-auto text-neutral-300'>
                        {trackKey}
                    </p>
                </div>
            </div>
        </PopoverContent>
    )
}