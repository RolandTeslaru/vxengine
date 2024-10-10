// Utility function to get a nested property value, supporting Map structures
export const getNestedProperty = (obj: any, path: string) => {
    return path.split('.').reduce((acc, part) => {
        if (!acc) return undefined;

        if (acc instanceof Map) {
            // console.log("Getting Nested Propert: found Map", acc, " part:", part, " value:", acc.get(part))
            return acc.get(part).value;
        }

        return acc[part];
    }, obj);
};

// Utility function to set a nested property value, supporting Map structures
export const setNestedProperty = (obj: any, path: string, value: any) => {
    const parts = path.split('.');
    const last = parts.pop();
    
    const target = parts.reduce((acc, part) => {
        if (!acc) return undefined;

        if (acc instanceof Map) {
            return acc.get(part);
        }

        return acc[part];
    }, obj);

    if (target && last) {
        if (target instanceof Map) {
            target.set(last, value);
        } else {
            target[last] = value;
        }
    }
};