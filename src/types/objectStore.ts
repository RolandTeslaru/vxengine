export interface vxObjectProps {
    type: string;
    name: string;
    // FIXME Three js Object ref
    ref: React.MutableRefObject<any>;
    vxkey: string
    additionalSettings?: additionalSettingsProps
}

export interface additionalSettingsProps{
    showPositionPath?: boolean
}

export interface ObjectStoreStateProps {
    objects: Record<string, vxObjectProps>
    addObject: (object: vxObjectProps) => void;
    removeObject: (vxkey: string) => void;
    setAdditionalSetting: (vxkey: string, additionalSettingKey: string, value: any) => void; 
    toggleAdditionalSetting: (vxkey: string, additionalSettingKey: string) => void; 
}