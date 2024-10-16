'use client'

import { CanvasProps } from "@react-three/fiber";

export interface RendererCoreProps {
    canvasProps?: CanvasProps;
    children?: React.ReactNode;
    mount?: boolean;
    powerPreferences?: 'high-performance' | 'low-power';
}