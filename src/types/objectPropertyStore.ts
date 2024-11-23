export interface ObjectPropertyStoreProps { 
    properties: Record<string, any>
    updateProperty: (vxkey: string, propertyPath: string, value: any) => void;
    deleteProperty: (vxkey: string, propertyPath: string) => void;
    getProperty: (vxkey: string, propertyPath: string) => number;
}