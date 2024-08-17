"use client"
import React, { createContext, useContext, useEffect, useRef, useState } from 'react'
import { CssBaseline, GeistProvider } from '@geist-ui/core'
import { VXEngineCoreUI } from './core'
import { EffectComposer } from 'three-stdlib'
import { EngineContextProps } from './types/engine'
import { ThemeProvider as NextThemesProvider } from "next-themes"
import { type ThemeProviderProps } from "next-themes/dist/types"

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
    return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
const VXEngineContext = createContext<EngineContextProps>({
    onScreenTransform: false,
    setOnScreenTransform: () => { },
    mountEngineUI: false,
    composer: { current: null },
    transformMode: "move",
    setTransformMode: () => { }
})

export const useVXEngine = () => useContext(VXEngineContext)
export const VXEngineProvider = ({ children }: any, mount = true) => {
    const [mountEngineUI, setMountEngineUI] = useState(false);
    const composer = useRef<EffectComposer | null>(null);

    useEffect(() => {
        setMountEngineUI(mount)
    }, [])

    const [onScreenTransform, setOnScreenTransform] = useState(false);
    const [themeType, setThemeType] = useState('dark')
    const switchThemes = () => {
        setThemeType(last => (last === 'dark' ? 'light' : 'dark'))
    }

    const [transformMode, setTransformMode] = useState<"translate" | "scale" | "rotate">("translate")
    return (
        <VXEngineContext.Provider value={{
            onScreenTransform, setOnScreenTransform, mountEngineUI, composer, transformMode, setTransformMode
        }}>
            {mountEngineUI && (
                <ThemeProvider
                    attribute="class"
                    defaultTheme="dark"
                    enableSystem
                    disableTransitionOnChange
                >
                    <VXEngineCoreUI />
                </ThemeProvider>
            )}
            {children}
        </VXEngineContext.Provider>
    )
}