import { useUIManagerAPI } from '@vxengine/managers/UIManager/store';
import React, {useEffect, useMemo, useRef } from 'react';
import ReactDOM from 'react-dom';
import { WindowControlDots } from './WindowControlDots';

export interface VXEngineWindowProps {
    children: React.ReactNode;
    title: string;
    id: string;
    windowClasses: string;
    className?: string;
    detachedClassName?: string;
    noStyling?: boolean
}

export const VXEngineWindow: React.FC<VXEngineWindowProps> = React.memo((props) => {
    const { children, title, windowClasses, id, className, detachedClassName, noStyling = false } = props;

    const registerWindow = useUIManagerAPI((state) => state.registerWindow);
    const isVisible = useUIManagerAPI((state) => state.windowVisibility[id])
    const setWindowVisibility = useUIManagerAPI((state) => state.setWindowVisibility);
    const setWindowAttachment = useUIManagerAPI((state) => state.setWindowAttachment);

    const isAttached = useUIManagerAPI((state) => state.getAttachmentState(id))

    useEffect(() => {
        registerWindow({ id, title })
    }, [])

    const handleAttach = () => { setWindowAttachment(id, true)}

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
                        setAttach={setWindowAttachment}
                        setMount={setWindowVisibility}
                        id={id}
                    />
                    {children}
                </StandardWindowStyling>
            );
        }
    }, [noStyling, children, className, detachedClassName, isAttached,]);

    if(isVisible === false) return null;

    return isAttached ? (
        Content
    ) : (
        <DetachableWindow onClose={handleAttach} title={title} windowClasses={windowClasses}>
            {Content}
        </DetachableWindow>
    );
});

interface StandardWindowStylingProps {
    children: React.ReactNode
    className?: string
    isDetached: boolean
    detachedClassName?: string
}

const StandardWindowStyling = (props: StandardWindowStylingProps) => {
    const { children, className, isDetached, detachedClassName } = props
    return (
        <div
            className={`fixed backdrop-blur-sm bg-neutral-900 bg-opacity-70 border-neutral-800 border-[1px] rounded-3xl flex flex-col p-2 pb-1 gap-2
            ${className} ${isDetached && detachedClassName}`

            }>
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
    const containerRef = useRef<HTMLDivElement>(document.createElement('div'));
    const externalWindow = useRef<Window | null>(null);

    useEffect(() => {
        const htmlContent = '<html><head><title>' + title + '</title></head><body></body></html>';
        externalWindow.current = window.open('', '', windowClasses);

        if (externalWindow.current) {
            const extDocument = externalWindow.current.document;
            if (title) extDocument.title = title;
            extDocument.body.style.width = '100vw';
            extDocument.body.style.height = '100vh';
            extDocument.body.style.margin = '0';
            extDocument.body.style.overflow = 'hidden';
            extDocument.body.appendChild(containerRef.current);

            // Copy styles
            document.querySelectorAll('link[rel="stylesheet"], style').forEach((link) => {
                extDocument.head.appendChild(link.cloneNode(true));
            });
        } else {
            console.error("Failed to open new window");
            return;
        }

        const curWindow = externalWindow.current;
        curWindow.addEventListener('beforeunload', onClose);

        return () => {
            curWindow.removeEventListener('beforeunload', onClose);
            curWindow.close();
        };
    }, [onClose, title, windowClasses]); // Dependencies should remain stable

    return ReactDOM.createPortal(children, containerRef.current);
};
