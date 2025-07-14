import React from 'react'
import { AnimationEngine } from '@vxengine/AnimationEngine/engine';
import animationEngineInstance from '@vxengine/singleton';
import { BooleanText, List, ListItem, Text } from '@vxengine/ui/foundations';

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