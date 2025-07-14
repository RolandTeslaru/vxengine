import { ContextMenuContent, ContextMenuItem, ContextMenuSub, ContextMenuSubContent, ContextMenuSubTrigger } from '@vxengine/ui/foundations';
import { TrackSegmentEditor } from '@vxengine/managers/TimelineManager/TrackSegmentProperties';
import { extractDataFromTrackKey } from '@vxengine/managers/TimelineManager/utils/trackDataProcessing';
import { pushDialogStatic } from '@vxengine/managers/UIManager/store';
import React from 'react'
import { ALERT_MakePropertyStatic } from '@vxengine/ui/dialogs/Alert';

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
                <ContextMenuSubTrigger>Curve Editor</ContextMenuSubTrigger>
                <ContextMenuSubContent>
                    <p className='text-xs antialiased font-medium font-roboto-mono text-center mb-1 text-label-primary'>Bezier Curve Editor</p>
                    <TrackSegmentEditor/>
                </ContextMenuSubContent>
            </ContextMenuSub>
            {/* <ContextMenuSub>
                <ContextMenuSubTrigger>Show Track Data</ContextMenuSubTrigger>
                <ContextMenuContent>
                    <TrackData trackKey={trackKey}/>
                </ContextMenuContent>
            </ContextMenuSub>
            <ContextMenuSub>
                <ContextMenuSubTrigger>Show Segment Data</ContextMenuSubTrigger>
                <ContextMenuSubContent>
                    <TrackSegmentData {...props}/>
                </ContextMenuSubContent>
            </ContextMenuSub> */}
            <ContextMenuItem onClick={() =>
                pushDialogStatic({content: <ALERT_MakePropertyStatic vxkey={vxkey} propertyPath={propertyPath} />, type: "alert"})}
                variant="destructive"
            >
                Make Property Static
            </ContextMenuItem>
        </ContextMenuContent>
    )
})

export default TrackSegmentContextMenu