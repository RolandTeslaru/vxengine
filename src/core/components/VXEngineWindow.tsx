import { useUIManagerAPI } from '@vxengine/managers/UIManager/store';
import React, { useEffect, useMemo, useRef, createContext, useContext, useState, FC, memo, useCallback } from 'react';
import ReactDOM from 'react-dom';
import { WindowControlDots } from '../../components/ui/WindowControlDots';

export interface VXEngineWindowProps {
    children: React.ReactNode;
    title?: string;
    vxWindowId: string;
    windowClasses: string;
    className?: string;
    detachedClassName?: string;
    noStyling?: boolean
}

interface WindowContextProps {
    vxWindowId: string
    externalContainer: HTMLElement | null
    setExternalContainer: (element: HTMLElement | null) => void
}

const WindowContext = createContext<WindowContextProps>({ 
    vxWindowId: "",
    externalContainer: null,
    setExternalContainer: (element) => {}
});

export const useWindowContext = () => useContext(WindowContext);

export const VXEngineWindow: FC<VXEngineWindowProps> = memo((props) => {
    const { children, title = "VXEngine Window", windowClasses, vxWindowId, className,
           detachedClassName, noStyling = false } = props;

    const registerWindow = useUIManagerAPI((state) => state.registerWindow);
    const isVisible = useUIManagerAPI((state) => state.windowVisibility[vxWindowId])
    const setWindowAttachment = useUIManagerAPI((state) => state.setWindowAttachment);
    const isAttached = useUIManagerAPI((state) => state.getAttachmentState(vxWindowId))
    const isStoreHydrated = useUIManagerAPI(state => state.hydrated);

    const [externalContainer, setExternalContainer] = useState<HTMLElement | null>(null);

    useEffect(() => {
        registerWindow({ id: vxWindowId, title })
    }, [])

    const handleAttach = () => { setWindowAttachment(vxWindowId, true) }

    const Content = useMemo(() => {
        if (noStyling) {
            return <>{children}</>;
        } else {
            return (
                <StandardWindowStyling
                    className={className}
                    detachedClassName={detachedClassName}
                    isDetached={!isAttached}
                >
                    <WindowControlDots
                        isAttached={isAttached}
                    />
                    {children}
                </StandardWindowStyling>
            );
        }
    }, [noStyling, children, className, detachedClassName, isAttached,]);

    if(isStoreHydrated === false) return null;

    if (isVisible === false) return null;

    return (
        <WindowContext.Provider value={{ externalContainer, setExternalContainer, vxWindowId }}>
            {isAttached ? (
                    Content
            ) : (
                <DetachableWindow onClose={handleAttach} title={title} windowClasses={windowClasses}>
                    {Content}
                </DetachableWindow>
            )
            }
        </WindowContext.Provider>
    )
});

interface StandardWindowStylingProps {
    children: React.ReactNode
    className?: string
    isDetached: boolean
    detachedClassName?: string
    onClick?: () => void
}

const StandardWindowStyling = (props: StandardWindowStylingProps) => {
    const { children, className, isDetached, detachedClassName, onClick } = props
    return (
        <div
            className={`fixed backdrop-blur-lg bg-neutral-900 bg-opacity-80 border-neutral-400 border-opacity-20 border-[1px] 
                        rounded-3xl flex flex-col p-2 pb-1 gap-2 
                    ${isDetached && detachedClassName} ${className} `}
            onClick={onClick}
            style={{ boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.6), 0 1px 6px -4px rgb(0 0 0 / 0.6"}}
        >
            {children}
        </div>
    )
}


interface DetachableWindowProps {
    children: React.ReactNode;
    onClose: () => void;
    windowClasses: string;
    title: string;
}

const DetachableWindow: React.FC<DetachableWindowProps> = (props) => {
    const { children, onClose, windowClasses, title } = props;
    const { setExternalContainer } = useWindowContext();
    const containerRef = useRef<HTMLDivElement>(document.createElement('div'));
    const externalWindow = useRef<Window | null>(null);

    // A hacky way to stop infinite window creation during detachment
    const effectTriggerCountRef = useRef(0);

    const handleOnClose = useCallback(() => {
        if (externalWindow.current) {
            console.log(`Window "${title}" is closing`);
            setExternalContainer(null);
            onClose?.();
        }
    }, [setExternalContainer, onClose, title]);


    useEffect(() => {
        // This useEffect must run at least twice to get a working window
        // if it runs only once, it opens and then closes the window immediately
        effectTriggerCountRef.current ++;
        if(effectTriggerCountRef.current > 2)
            return
        // if(openedOnceRef.current) return;
        // openedOnceRef.current = true;
        const htmlContent = '<html><head><title>' + title + '</title></head><body></body></html>';
        externalWindow.current = window.open('', '', windowClasses);

        if(!externalWindow.current){
            console.error("VXEngineWindow: Failed to open new Window");
            return;
        }

        const extDocument = externalWindow.current.document;
        if (title) 
            extDocument.title = title;
        extDocument.body.style.width = '100vw';
        extDocument.body.style.height = '100vh';
        extDocument.body.style.margin = '0';
        extDocument.body.style.overflow = 'hidden';
        extDocument.body.appendChild(containerRef.current);

        // Copy styles
        document.querySelectorAll('link[rel="stylesheet"], style').forEach((link) => {
            extDocument.head.appendChild(link.cloneNode(true));
        });

        console.log(`Window "${props.title}" has been created`)

        // IMPORTANT: update the context with the external container
        setExternalContainer(extDocument.body);

        const curWindow = externalWindow.current;
        curWindow.addEventListener('beforeunload', handleOnClose);

        return () => {
            curWindow.removeEventListener('beforeunload', handleOnClose);
            curWindow.close();
        };
    }, []); // Dependencies should remain stable

    return ReactDOM.createPortal(children, containerRef.current);
};
