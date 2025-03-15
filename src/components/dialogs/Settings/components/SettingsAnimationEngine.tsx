import { useUIManagerAPI } from '@vxengine/managers/UIManager/store';
import React from 'react'
import { BooleanText, Text } from '@vxengine/components/shadcn/Text';
import { Tabs, TabsList, TabsTrigger } from '@vxengine/components/shadcn/tabs';
import { List, ListItem } from '@vxengine/components/shadcn/list';
import { AnimationEngine } from '@vxengine/AnimationEngine/engine';
import animationEngineInstance from '@vxengine/singleton';

export const SettingsAnimationEngine = () => {
    return (
        <>
            <List className='bg-tertiary-opaque border border-border-background rounded-xl overflow-hidden shadow-md shadow-black/20'>
                <ListItem>
                    <Text>{`(static) ENGINE_PRECISION`}</Text>
                    <Text>{AnimationEngine.ENGINE_PRECISION}</Text>
                </ListItem>
                <ListItem>
                    <Text>{`(static) VALUE_CHANGE_THRESHOLD`}</Text>
                    <Text>{AnimationEngine.VALUE_CHANGE_THRESHOLD}</Text>
                </ListItem>
                <ListItem>
                    <Text>{`(instance) cameraRequiresProjectionMatrixRecalculation`}</Text>
                    <BooleanText value={animationEngineInstance.cameraRequiresProjectionMatrixRecalculation} />
                </ListItem>
                <ListItem>
                    <Text>{`(instance) environmentRequiresUpdate`}</Text>
                    <BooleanText value={animationEngineInstance.environmentRequiresUpdate} />
                </ListItem>
            </List>
        </>
    )
}