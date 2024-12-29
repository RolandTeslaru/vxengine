export interface ObjectPropertyStoreProps { 
    properties: Record<string, any>
    deleteProperty: (vxkey: string, propertyPath: string) => void;
}