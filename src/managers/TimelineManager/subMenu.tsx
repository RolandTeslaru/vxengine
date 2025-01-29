import React from 'react'
import { useUIManagerAPI } from '../UIManager/store';
import { MenubarItem, MenubarSub, MenubarSubContent, MenubarSubTrigger } from '@vxengine/components/shadcn/menubar';
import { DIALOG_createKeyframe, DIALOG_createStaticProp, DIALOG_makePropertyStatic, DIALOG_makePropertyTracked, DIALOG_moveToNextKeyframe, DIALOG_moveToPreviousKeyframe, DIALOG_removeKeyframe, DIALOG_removeStaticProp, DIALOG_setKeyframeTime, DIALOG_setKeyframeValue, DIALOG_setStaticPropValue } from './Dialogs';


export const TimelineManagerSubMenu = () => {
    const pushDialog = useUIManagerAPI(state => state.pushDialog);

    return (
        <MenubarSub>
            <MenubarSubTrigger>Timeline Editor API</MenubarSubTrigger>
            <MenubarSubContent>
                {/* Keyframe sub menu */}
                <MenubarSub>
                    <MenubarSubTrigger>Keyframe</MenubarSubTrigger>
                    <MenubarSubContent>
                        <MenubarItem onClick={() => pushDialog(<DIALOG_createKeyframe />, "normal")}>Create Keyframe</MenubarItem>
                        <MenubarItem onClick={() => pushDialog(<DIALOG_setKeyframeTime />, "normal")}>Set Keyframe Time</MenubarItem>
                        <MenubarItem onClick={() => pushDialog(<DIALOG_setKeyframeValue />, "normal")}>Set Keyframe Value</MenubarItem>
                        <MenubarItem onClick={() => pushDialog(<DIALOG_removeKeyframe />, "normal")}>Remove Keyframe</MenubarItem>
                    </MenubarSubContent>
                </MenubarSub>
                {/* Static Prop Sub menu */}
                <MenubarSub>
                    <MenubarSubTrigger>StaticProp</MenubarSubTrigger>
                    <MenubarSubContent>
                        <MenubarItem onClick={() => pushDialog(<DIALOG_createStaticProp />, "normal")}>
                            Create StaticProp
                        </MenubarItem>
                        <MenubarItem onClick={() => pushDialog(<DIALOG_setStaticPropValue />, "normal")}>
                            Set StaticProp Value
                        </MenubarItem>
                        <MenubarItem onClick={() => pushDialog(<DIALOG_removeStaticProp />, "normal")}>
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
                        <MenubarItem onClick={() => pushDialog(<DIALOG_moveToNextKeyframe />, "normal")}>
                            Move To Next Keyframe
                        </MenubarItem>
                        <MenubarItem onClick={() => pushDialog(<DIALOG_moveToPreviousKeyframe />, "normal")}>
                            Move To Previous Keyframe
                        </MenubarItem>
                    </MenubarSubContent>
                </MenubarSub>
                {/* Make */}
                <MenubarSub>
                    <MenubarSubTrigger>Make</MenubarSubTrigger>
                    <MenubarSubContent>
                        <MenubarItem onClick={() => pushDialog(<DIALOG_makePropertyTracked />, "normal")}>
                            Make Property Tracked
                        </MenubarItem>
                        <MenubarItem onClick={() => pushDialog(<DIALOG_makePropertyStatic />, "normal")}>
                            Make Property Static
                        </MenubarItem>
                    </MenubarSubContent>
                </MenubarSub>
            </MenubarSubContent>
        </MenubarSub>
    )
}


export default TimelineManagerSubMenu
