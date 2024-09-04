import React, { useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';

interface VXUiPanelWrapperProps {
    children: React.ReactNode;
    title: string;
    windowClasses: string;
    attachedState: boolean;
    setAttachedState: (value: boolean) => void;
}

const VXUiPanelWrapper: React.FC<VXUiPanelWrapperProps> = (props) => {
    const { children, title, windowClasses, attachedState, setAttachedState } = props;
    const handleClose = () => {
        setAttachedState(true);
    };

    return (
        <>
            {attachedState ? (
                <>
                    {children}
                </>
            ) : (
                <DetachableWindow onClose={handleClose} title={title} windowClasses={windowClasses}>
                    {children}
                </DetachableWindow>
            )}
        </>
    );
};

interface DetachableWindowProps {
    children: React.ReactNode;
    onClose: () => void;
    windowClasses: string;
    title: string;
}

const DetachableWindow: React.FC<DetachableWindowProps> = (props) => {
    const { children, onClose, windowClasses, title } = props;
    const containerRef = useRef<HTMLDivElement>(null);
    const externalWindow = useRef<Window | null>(null);

    if (typeof window === 'undefined') return null;

    if (!containerRef.current) {
        containerRef.current = document.createElement('div');
    }

    useEffect(() => {
        externalWindow.current = window.open('', '', windowClasses);

        if (externalWindow.current) {
            const extDocument = externalWindow.current.document;
            if (title) extDocument.title = title;
            extDocument.body.style.width = '100vw';
            extDocument.body.style.height = '100vh';
            extDocument.body.style.margin = '0';  // Remove any margin that may interfere with sizing
            extDocument.body.style.overflow = 'hidden'; // Prevent scrollbars from appearing
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
    }, [onClose, title, windowClasses]);

    return ReactDOM.createPortal(children, containerRef.current);
};

export default VXUiPanelWrapper;