import { ContextMenuContent, ContextMenuItem, ContextMenuSub, ContextMenuSubContent, ContextMenuSubTrigger } from '@vxengine/components/shadcn/contextMenu';
import TrackSegmentData from '@vxengine/components/ui/DataContextContext/TrackSegment';
import { ALERT_MakePropertyStatic } from '@vxengine/components/ui/DialogAlerts/Alert';
import { extractDataFromTrackKey } from '@vxengine/managers/TimelineManager/utils/trackDataProcessing';
import { pushDialogStatic, useUIManagerAPI } from '@vxengine/managers/UIManager/store';
import React from 'react'

interface Props {
    trackKey: string;
    firstKeyframeKey: string;
    secondKeyframeKey: string
}

const TrackSegmentContextMenu: React.FC<Props> = React.memo((props) => {
    const { trackKey } = props;
    const { vxkey, propertyPath } = extractDataFromTrackKey(trackKey);

    return (
        <ContextMenuContent>
            <ContextMenuSub>
                <ContextMenuSubTrigger>Show Data...</ContextMenuSubTrigger>
                <ContextMenuSubContent>
                    <TrackSegmentData {...props}/>
                </ContextMenuSubContent>
            </ContextMenuSub>
            <ContextMenuItem onClick={() =>
                pushDialogStatic({content: <ALERT_MakePropertyStatic vxkey={vxkey} propertyPath={propertyPath} />, type: "alert"})}
            >
                <p className='text-xs font-roboto-mono text-red-500'>Make Property Static </p>
            </ContextMenuItem>
        </ContextMenuContent>
    )
})

export default TrackSegmentContextMenu