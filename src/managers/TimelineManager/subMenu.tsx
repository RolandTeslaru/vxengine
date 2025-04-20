import React from 'react'
import { useUIManagerAPI } from '../UIManager/store';
import { MenubarItem, MenubarSub, MenubarSubContent, MenubarSubTrigger } from '@vxengine/components/shadcn/menubar';
import { DIALOG_createKeyframe, DIALOG_createStaticProp, DIALOG_makePropertyStatic, DIALOG_makePropertyTracked, DIALOG_moveToNextKeyframe, DIALOG_moveToPreviousKeyframe, DIALOG_removeKeyframe, DIALOG_removeStaticProp, DIALOG_setKeyframeTime, DIALOG_setKeyframeValue, DIALOG_setStaticPropValue } from './Dialogs';


export const TimelineManagerSubMenu = () => {
    const pushDialog = useUIManagerAPI(state => state.pushDialog);

    return (
        <MenubarSub>
            <MenubarSubTrigger>Timeline Manager API</MenubarSubTrigger>
            <MenubarSubContent>
                {/* Keyframe sub menu */}
                <MenubarSub>
                    <MenubarSubTrigger>Keyframe</MenubarSubTrigger>
                    <MenubarSubContent>
                        <MenubarItem onClick={() => pushDialog({content: <DIALOG_createKeyframe />,type:  "normal"})}>Create Keyframe</MenubarItem>
                        <MenubarItem onClick={() => pushDialog({content: <DIALOG_setKeyframeTime />,type:  "normal"})}>Set Keyframe Time</MenubarItem>
                        <MenubarItem onClick={() => pushDialog({content: <DIALOG_setKeyframeValue />,type:  "normal"})}>Set Keyframe Value</MenubarItem>
                        <MenubarItem onClick={() => pushDialog({content: <DIALOG_removeKeyframe />,type:  "normal"})}>Remove Keyframe</MenubarItem>
                    </MenubarSubContent>
                </MenubarSub>
                {/* Static Prop Sub menu */}
                <MenubarSub>
                    <MenubarSubTrigger>StaticProp</MenubarSubTrigger>
                    <MenubarSubContent>
                        <MenubarItem onClick={() => pushDialog({content: <DIALOG_createStaticProp />,type:  "normal"})}>
                            Create StaticProp
                        </MenubarItem>
                        <MenubarItem onClick={() => pushDialog({content: <DIALOG_setStaticPropValue />,type:  "normal"})}>
                            Set StaticProp Value
                        </MenubarItem>
                        <MenubarItem onClick={() => pushDialog({content: <DIALOG_removeStaticProp />,type:  "normal"})}>
                            Remove StaticProp
                        </MenubarItem>
                    </MenubarSubContent>
                </MenubarSub>
                {/* Get */}
                <MenubarSub>
                    <MenubarSubTrigger>Get</MenubarSubTrigger>
                    <MenubarSubContent>
                        <MenubarItem>get Track</MenubarItem>
                        <MenubarItem>get Keyframe</MenubarItem>
                        <MenubarItem>get StaticProp</MenubarItem>
                        <MenubarItem>get Tracks For Object</MenubarItem>
                        <MenubarItem>get StaticProps For Object</MenubarItem>
                        <MenubarItem>get Keyframes For Track</MenubarItem>
                    </MenubarSubContent>
                </MenubarSub>
                {/* Move Cursor */}
                <MenubarSub>
                    <MenubarSubTrigger>Move Cursor</MenubarSubTrigger>
                    <MenubarSubContent>
                        <MenubarItem onClick={() => pushDialog({content: <DIALOG_moveToNextKeyframe />,type:  "normal"})}>
                            Move To Next Keyframe
                        </MenubarItem>
                        <MenubarItem onClick={() => pushDialog({content: <DIALOG_moveToPreviousKeyframe />,type:  "normal"})}>
                            Move To Previous Keyframe
                        </MenubarItem>
                    </MenubarSubContent>
                </MenubarSub>
                {/* Make */}
                <MenubarSub>
                    <MenubarSubTrigger>Make</MenubarSubTrigger>
                    <MenubarSubContent>
                        <MenubarItem onClick={() => pushDialog({content: <DIALOG_makePropertyTracked />,type:  "normal"})}>
                            Make Property Tracked
                        </MenubarItem>
                        <MenubarItem onClick={() => pushDialog({content: <DIALOG_makePropertyStatic />,type:  "normal"})}>
                            Make Property Static
                        </MenubarItem>
                    </MenubarSubContent>
                </MenubarSub>
            </MenubarSubContent>
        </MenubarSub>
    )
}


export default TimelineManagerSubMenu
