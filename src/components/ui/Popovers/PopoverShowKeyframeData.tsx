import Info from '@geist-ui/icons/info';
import { Input } from '@vxengine/components/shadcn/input';
import { Popover, PopoverContent, PopoverTrigger } from '@vxengine/components/shadcn/popover';
import { useTimelineEditorAPI } from '@vxengine/managers/TimelineManager';
import React, { useCallback } from 'react'
import JsonView from 'react18-json-view';

interface Props {
    trackKey: string;
    keyframeKey: string
    children: React.ReactNode
    triggerClassName?: string
    contentClassName?: string
    side?: "left" | "right" | "top" | "bottom"
    align?: "center" | "end" | "start"
}

export const PopoverShowKeyframeData: React.FC<Props> = (props) => {
    const { children, triggerClassName } = props

    return (
        <Popover>
            <PopoverTrigger className={triggerClassName}>
                <Info size={15}/>
                {children}
            </PopoverTrigger>
            <Content {...props} />
        </Popover>
    )
}


const Content: React.FC<Props> = (props) => {
    const { trackKey, keyframeKey, contentClassName, side, align } = props

    const customizeNode = useCallback(({ node, indexOrName, depth }) => {
        const key = indexOrName
        const value = node;
        // Check if the key is "time" or "value"
        if (key === "time" || key === "value") {
            const handleChange = (e) => {
                const newValue = parseFloat(e.target.value);
                if (key === "value") {
                    const setKeyframeValue = useTimelineEditorAPI.getState().setKeyframeValue;
                    setKeyframeValue(keyframeKey, trackKey, newValue, true);
                } else if (key === "time") {
                    const setKeyframeTime = useTimelineEditorAPI.getState().setKeyframeTime;
                    setKeyframeTime(keyframeKey, trackKey, newValue, true);
                }
            };

            return (
                <div className="flex flex-row">
                    <Input
                        type="number"
                        value={value}
                        onChange={handleChange}
                        className="h-fit ml-2 text-neutral-400 text-[10px] bg-neutral-800 border border-neutral-700 p-0.5 max-w-[60px]"
                        style={{ boxShadow: "1px 1px 5px 1px rgba(1,1,1,0.2)" }}
                    />
                </div>
            );
        }

        // Default rendering for other keys
        return undefined;
    }, [trackKey, keyframeKey]);

    const keyframe = useTimelineEditorAPI(state => state.tracks[trackKey]?.keyframes[keyframeKey]);

    return (
        <PopoverContent className={contentClassName} side={side} align={align}>
            <p className='font-sans-menlo text-xs text-center mb-2'>Keyframe Data</p>
            <div className='max-h-[70vh] overflow-y-scroll flex flex-col w-full mt-2 text-xs bg-neutral-900 p-1 rounded-md shadow-lg'>
                <JsonView src={keyframe} customizeNode={customizeNode} collapsed={({ depth }) => depth > 1} />
            </div>
        </PopoverContent>
    )
}

export default PopoverShowKeyframeData
