// Utility function to get a nested property value
export const getNestedProperty = (obj: any, path: string) => {
    return path.split('.').reduce((acc, part) => acc && acc[part], obj);
};

// Utility function to set a nested property value
export const setNestedProperty = (obj: any, path: string, value: any) => {
    const parts = path.split('.');
    const last = parts.pop();
    const target = parts.reduce((acc, part) => acc && acc[part], obj);

    console.log("Setting NestedPRop target:", )

    if (target && last) {
        target[last] = value;
    }
};