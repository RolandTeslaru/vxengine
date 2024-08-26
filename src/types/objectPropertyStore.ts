export interface ObjectPropertyStoreProps { 
    properties: Record<string, any>
    updateProperty: (vxkey: string, propertyPath: string, value: any) => void;
}