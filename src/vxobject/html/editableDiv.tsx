import React from 'react'
import { VXElementParams, VXElementPropsWithoutRef, VXObjectSettings } from '../types'
import { withVX } from '../withVX';
export type VXElementDivProps = VXElementPropsWithoutRef<React.HTMLAttributes<HTMLDivElement>> & {
  ref?: React.RefObject<HTMLDivElement>;
};

export const defaultSettings: VXObjectSettings = {}

const BaseEditableDiv = (props) => <div {...props} />

const params: VXElementParams = [
    { type: "color", propertyPath: "color" },
]

export const EditableDiv = withVX<VXElementDivProps>(BaseEditableDiv, {
    type: "htmlElement",
    params,
    icon: "div",
    settings: defaultSettings,
})

export default EditableDiv
