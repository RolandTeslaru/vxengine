import { ContextMenuContent, ContextMenuItem, ContextMenuSub, ContextMenuSubContent, ContextMenuSubTrigger } from '@vxengine/components/shadcn/contextMenu';
import TrackSegmentData from '@vxengine/components/ui/DataContextContext/TrackSegment';
import { ALERT_MakePropertyStatic } from '@vxengine/components/ui/DialogAlerts/Alert';
import { TrackSegmentEditor } from '@vxengine/managers/TimelineManager/TrackSegmentProperties';
import { extractDataFromTrackKey } from '@vxengine/managers/TimelineManager/utils/trackDataProcessing';
import { pushDialogStatic, useUIManagerAPI } from '@vxengine/managers/UIManager/store';
import React from 'react'

interface Props {
    trackKey: string;
    firstKeyframeKey: string;
    secondKeyframeKey: string
}

const TrackSegmentContextMenu: React.FC<Props> = React.memo((props) => {
    const { trackKey, firstKeyframeKey, secondKeyframeKey } = props;
    const { vxkey, propertyPath } = extractDataFromTrackKey(trackKey);

    return (
        <ContextMenuContent>
            <ContextMenuSub>
                <ContextMenuSubTrigger>Curve Editor</ContextMenuSubTrigger>
                <ContextMenuSubContent>
                    <p className='text-xs antialiased font-medium font-roboto-mono text-center mb-1'>Bezier Curve Editor</p>
                    <TrackSegmentEditor trackSegment={{
                        firstKeyframeKey, secondKeyframeKey, trackKey
                    }}/>
                </ContextMenuSubContent>
            </ContextMenuSub>
            {/* <ContextMenuSub>
                <ContextMenuSubTrigger>Show Data...</ContextMenuSubTrigger>
                <ContextMenuSubContent>
                    <TrackSegmentData {...props}/>
                </ContextMenuSubContent>
            </ContextMenuSub> */}
            <ContextMenuItem onClick={() =>
                pushDialogStatic({content: <ALERT_MakePropertyStatic vxkey={vxkey} propertyPath={propertyPath} />, type: "alert"})}
            >
                <p className='text-xs antialiased font-medium font-roboto-mono text-red-500'>Make Property Static </p>
            </ContextMenuItem>
        </ContextMenuContent>
    )
})

export default TrackSegmentContextMenu