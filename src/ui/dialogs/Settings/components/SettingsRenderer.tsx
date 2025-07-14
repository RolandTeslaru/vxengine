import { useUIManagerAPI } from '@vxengine/managers/UIManager/store';
import React, { useState } from 'react'
import { useVXEngine } from '@vxengine/engine';
import Search from '@vxengine/ui/components/Search';
import { BooleanText, List, ListItem, Text } from '@vxengine/ui/foundations';

export const SettingsRenderer = () => {

    const { gl: glRef } = useVXEngine();

    if (!glRef.current) {
        return null
    }
    
    const [searchQuery, setSearchQuery] = useState('');

    const filterBySearch = (key) => {
        if (!searchQuery) return true;
        return key.toLowerCase().includes(searchQuery.toLowerCase());
    };

    // Basic settings
    const basicSettings = [
        { key: 'autoclear', value: glRef.current.autoClear, isBoolean: true },
        { key: 'autoClearColor', value: glRef.current.autoClearColor, isBoolean: true },
        { key: 'autoClearDepth', value: glRef.current.autoClearDepth, isBoolean: true },
        { key: 'autoClearStencil', value: glRef.current.autoClearStencil, isBoolean: true },
    ].filter(item => filterBySearch(item.key));

    // Capabilities settings
    const capabilitySettings = [
        { key: 'isWebGL2', value: glRef.current.capabilities.isWebGL2, isBoolean: true },
        { key: 'precision', value: glRef.current.capabilities.precision, isBoolean: false },
        { key: 'logarithmicDepthBuffer', value: glRef.current.capabilities.logarithmicDepthBuffer, isBoolean: true },
        { key: 'maxAttributes', value: glRef.current.capabilities.maxAttributes, isBoolean: false },
        { key: 'maxFragmentUniforms', value: glRef.current.capabilities.maxFragmentUniforms, isBoolean: false },
        { key: 'maxSamples', value: glRef.current.capabilities.maxSamples, isBoolean: false },
        { key: 'maxTextureSize', value: glRef.current.capabilities.maxTextureSize, isBoolean: false },
        { key: 'maxTextures', value: glRef.current.capabilities.maxTextures, isBoolean: false },
        { key: 'maxVaryings', value: glRef.current.capabilities.maxVaryings, isBoolean: false },
        { key: 'maxVertexTextures', value: glRef.current.capabilities.maxVertexTextures, isBoolean: false },
        { key: 'maxVertexUniforms', value: glRef.current.capabilities.maxVertexUniforms, isBoolean: false },
        { key: 'reverseDepthBuffer', value: glRef.current.capabilities.reverseDepthBuffer, isBoolean: false },
    ].filter(item => filterBySearch(item.key));

    return (
        <div className='flex flex-col gap-2'>
            <Search searchQuery={searchQuery} setSearchQuery={setSearchQuery} className='ml-auto w-[150px]' />
            {basicSettings.length > 0 && (
                <List>
                    {basicSettings.map((setting) => (
                        <ListItem key={setting.key}>
                            <Text>{setting.key}</Text>
                            {setting.isBoolean ? (
                                <BooleanText value={setting.value as boolean} />
                            ) : (
                                <Text>{setting.value}</Text>
                            )}
                        </ListItem>
                    ))}
                </List>
            )}
            {capabilitySettings.length > 0 && (
                <>
                    <h3 className='text-sm font-roboto-mono font-semibold antialiased'>Capabilities</h3>
                    <List>
                        {capabilitySettings.map((setting) => (
                            <ListItem key={setting.key}>
                                <Text>{setting.key}</Text>
                                {setting.isBoolean ? (
                                    <BooleanText value={setting.value as boolean} />
                                ) : (
                                    <Text>{setting.value}</Text>
                                )}
                            </ListItem>
                        ))}
                    </List>
                </>
            )}
            {basicSettings.length === 0 && capabilitySettings.length === 0 && (
                <div className="text-center py-4 text-muted-foreground">
                    No settings match your search
                </div>
            )}
        </div>
    )
}