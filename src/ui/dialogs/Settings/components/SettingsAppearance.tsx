import { useUIManagerAPI } from '@vxengine/managers/UIManager/store';
import { Tabs, TabsList, TabsTrigger, Text } from '@vxengine/ui/foundations';
import React from 'react'
import { shallow } from 'zustand/shallow';

export const SettingsAppearance = () => {
  const {theme, setTheme} = useUIManagerAPI(state => ({
    theme: state.theme,
    setTheme: state.setTheme
  }), shallow)
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