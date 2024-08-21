"use client"
import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { CssBaseline, GeistProvider } from '@geist-ui/core'
import { VXEngineCoreUI } from './core'
import { EffectComposer } from 'three-stdlib'
import { EngineContextProps, VXEngineProviderProps } from './types/engine'
import { ThemeProvider as NextThemesProvider } from "next-themes"
import { type ThemeProviderProps } from "next-themes/dist/types"
import { AnimationEngine } from "vxengine/AnimationEngine/engine"

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
    return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
const VXEngineContext = createContext<EngineContextProps>({
    onScreenTransform: false,
    setOnScreenTransform: () => { },
    mountEngineUI: false,
    composer: { current: null },
    transformMode: "translate",
    setTransformMode: () => { },
    animationEngine: null
})

export const useVXEngine = () => useContext(VXEngineContext)
export const VXEngineProvider: React.FC<VXEngineProviderProps> = ({
    children,
    mount = true,
    animations_json
}) => {
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

    const animationEngine = useMemo(() => {
        const engine = new AnimationEngine();
        engine.loadTimelines(animations_json)
        return engine
    }, [])


    return (
        <VXEngineContext.Provider value={{
            onScreenTransform, setOnScreenTransform, mountEngineUI, composer, transformMode, setTransformMode,
            animationEngine
        }}>
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
    )
}