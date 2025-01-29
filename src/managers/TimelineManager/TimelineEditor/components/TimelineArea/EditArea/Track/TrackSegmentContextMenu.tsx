import { ContextMenuContent, ContextMenuItem } from '@vxengine/components/shadcn/contextMenu';
import { ALERT_MakePropertyStatic } from '@vxengine/components/ui/DialogAlerts/Alert';
import PopoverShowTrackSegmentData from '@vxengine/components/ui/Popovers/PopoverShowTrackSegmentData';
import { extractDataFromTrackKey } from '@vxengine/managers/TimelineManager/utils/trackDataProcessing';
import { useUIManagerAPI } from '@vxengine/managers/UIManager/store';
import React from 'react'

interface Props {
    trackKey: string;
    firstKeyframeKey: string;
    secondKeyframeKey: string
}

const TrackSegmentContextMenu: React.FC<Props> = React.memo((props) => {
    const { trackKey } = props;
    const { vxkey, propertyPath } = extractDataFromTrackKey(trackKey);
    const pushDialog = useUIManagerAPI(state => state.pushDialog);

    return (
        <ContextMenuContent>
            <PopoverShowTrackSegmentData {...props}>
                <p className='text-xs font-sans-menlo'>Show Data...</p>
            </PopoverShowTrackSegmentData>
            <ContextMenuItem onClick={() =>
                pushDialog(<ALERT_MakePropertyStatic vxkey={vxkey} propertyPath={propertyPath} />, "alert")}
            >
                <p className='text-xs font-sans-menlo text-red-600'>Make Property Static </p>
            </ContextMenuItem>
        </ContextMenuContent>
    )
})

export default TrackSegmentContextMenu