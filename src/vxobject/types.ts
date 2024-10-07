export interface VXObjectWrapperProps {
    type: string;
    children: React.ReactNode;
    vxkey: string;
}

export type EditableObjectProps<T> = Omit<T, 'ref'> & {
    vxkey: string;
    ref?: React.Ref<unknown>;
};