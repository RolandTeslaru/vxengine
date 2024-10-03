'use client'
import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { CssBaseline, GeistProvider } from '@geist-ui/core'
import { VXEngineCoreUI } from './core'
import { EffectComposer } from 'three-stdlib'
import { EngineContextProps, VXEngineProviderProps, VXEngineStoreProps } from './types/engine'
import { ThemeProvider as NextThemesProvider } from "next-themes"
import { type ThemeProviderProps } from "next-themes/dist/types"
import { AnimationEngine } from "@vxengine/AnimationEngine/engine"
import { useTimelineEditorAPI } from './managers/TimelineManager/store'
import { createStore, useStore, StoreApi } from 'zustand'

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
    return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
const VXEngineContext = createContext<ReturnType<typeof createVXEngineStore> | null>(null);

let VXEngineStore: StoreApi<VXEngineStoreProps> | null = null; 

const createVXEngineStore = (props: VXEngineProviderProps) => {
    const { mount, animations_json } = props;
    
    VXEngineStore = createStore<VXEngineStoreProps>((set) => ({
      mountEngineUI: mount ? mount : true,
      setMountEngineUI: (value) => set({ mountEngineUI: value }),
  
      composer: useRef<EffectComposer | null>(null),
      
      animationEngine: (() => {
        const engine = new AnimationEngine();
        engine.loadTimelines(animations_json);
        return engine;
      })(),
    }));

    return VXEngineStore
  };

export const VXEngineProvider: React.FC<VXEngineProviderProps> = (props) => {
    const { children, } = props;
    
    // Initialize the store with the given props
    const store = useRef(createVXEngineStore(props)).current;
    const mountEngineUI = store.getState().mountEngineUI
    
    return (
      <VXEngineContext.Provider value={store}>
        <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
        >
            {mountEngineUI && (
                <VXEngineCoreUI />
            )}
        </ThemeProvider>
        {children}
      </VXEngineContext.Provider>
    );
  };

  export function useVXEngine<T>(selector: (state: VXEngineStoreProps) => T){
    const store = useContext(VXEngineContext);
    if(!store) throw new Error("VXEngineProvider FATAL: Missing VXEngineContext.Provider in the tree!")
    return useStore(store, selector)
};

export const getVXEngineState = () => {
    if(!VXEngineStore) {
        throw new Error("VXEngineStore is not initialized. Make sure to initialize it inside VXEngineProvider.");
    }
    return VXEngineStore
}
// export const VXEngineProvider: React.FC<VXEngineProviderProps> = ({
//     children,
//     mount = true,
//     animations_json
// }) => {
//     const [mountEngineUI, setMountEngineUI] = useState(false);
//     const composer = useRef<EffectComposer | null>(null);

//     useEffect(() => {
//         setMountEngineUI(mount)
//     }, [])

//     const [themeType, setThemeType] = useState('dark')
//     const switchThemes = () => {
//         setThemeType(last => (last === 'dark' ? 'light' : 'dark'))
//     }

//     const animationEngine = useMemo(() => {
//         const engine = new AnimationEngine();
//         engine.loadTimelines(animations_json)

//         return engine
//     }, [])
    
//     useEffect(() => {
//         useTimelineEditorAPI.getState().animationEngineRef.current = animationEngine;
//     }, [animationEngine])

//     return (
//         <VXEngineContext.Provider value={{
//             mountEngineUI, composer,
//             animationEngine
//         }}>
//             <ThemeProvider
//                 attribute="class"
//                 defaultTheme="dark"
//                 enableSystem
//                 disableTransitionOnChange
//             >
//                 {mountEngineUI && (
//                     <VXEngineCoreUI />
//                 )}
//             </ThemeProvider>
//             {children}
//         </VXEngineContext.Provider>
//     )
// }


