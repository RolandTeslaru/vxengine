export interface VXEngineWindowProps extends StandardWindowStylingProps {
    title?: string;
    noPadding?: boolean
    vxWindowId: string;
    windowClasses: string;
    noStyling?: boolean
    isAttached?: boolean
    isOpen?: boolean
}

export interface WindowContextProps {
    vxWindowId: string
    externalContainer: HTMLElement | null
    setExternalContainer: (element: HTMLElement | null) => void
}

export interface StandardWindowStylingProps extends React.HTMLAttributes<HTMLDivElement> {
    isDetached?: boolean
    detachedClassName?: string
    detachedStyling?: React.CSSProperties
}


export interface DetachableWindowProps {
    vxWindowId: string
    children: React.ReactNode;
    onClose: () => void;
    windowClasses: string;
    title: string;
}
