import { useUIManagerAPI } from '@vxengine/managers/UIManager/store';
import React from 'react'
import { Text } from '@vxengine/components/shadcn/Text';
import { Tabs, TabsList, TabsTrigger } from '@vxengine/components/shadcn/tabs';

export const SettingsAppearance = () => {
  const theme = useUIManagerAPI(state => state.theme);
  const setTheme = useUIManagerAPI(state => state.setTheme)
  return (
    <>
      <div className='flex flex-row justify-between'>
        <Text>theme</Text>
        <Tabs defaultValue={theme}>
          <TabsList>
            <TabsTrigger value="light" onClick={() => setTheme("light")} className="text-white text-xs font-roboto-mono">
              Light
            </TabsTrigger>
            <TabsTrigger value="dark" onClick={() => setTheme("dark")} className="text-white text-xs font-roboto-mono">
              dark
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
    </>
  )
}