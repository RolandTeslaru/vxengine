import React from 'react'
import { VXElementPropsWithoutRef, VXObjectSettings } from '../types'
import VXHtmlElementWrapper from '../VXHtmlElementWrapper';

export type VXElementDivProps = VXElementPropsWithoutRef<React.HTMLAttributes<HTMLDivElement>> & {
  ref?: React.RefObject<HTMLDivElement>;
};

export const defaultSettings: VXObjectSettings = {}

export const EditableDiv: React.FC<VXElementDivProps> = (props) => {
    const { children: meshChildren, settings = {}, ...rest } = props;

    const mergedSettings = {
        ...defaultSettings,
        ...settings
    }

    return (
        <VXHtmlElementWrapper 
            settings={mergedSettings}
            {...rest}
        >
            <div>
                {meshChildren}
            </div>
        </VXHtmlElementWrapper>
    );
}

export default EditableDiv
