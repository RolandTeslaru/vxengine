export interface vxObjectProps {
    type: string;
    name: string;
    // FIXME Three js Object ref
    ref: React.MutableRefObject<any>;
    vxkey: string
    settings?: Record<string, any>
}

export interface ObjectStoreStateProps {
    objects: Record<string, vxObjectProps>
    addObject: (object: vxObjectProps) => void;
    removeObject: (vxkey: string) => void;
    setObjectSetting: (vxkey: string, settingKey: string, value: any) => void; 
    toggleObjectSetting: (vxkey: string, settingKey: string) => void; 
}