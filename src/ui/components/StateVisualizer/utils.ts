
export function extractDatasetFromMap(map) {
    const obj = {};
    for (let [key, value] of map) {
        obj[key] = value?.dataset ? { dataset: { ...value.dataset } } : value;
    }
    return obj;
}


export function convertDeepMaps(data) {
    if (data instanceof Map) {
        return extractDatasetFromMap(data);
    }
    if (Array.isArray(data)) {
        return data.map(convertDeepMaps);
    }
    if (data !== null && typeof data === "object") {
        const newData = {};
        Object.keys(data).forEach((key) => {
            newData[key] = convertDeepMaps(data[key]);
        });
        return newData;
    }
    return data;
}



export function processState(data, depth = 0, maxDepth = 6, ancestry = []) {
    // Handle primitive values and functions.
    if (typeof data !== "object" || data === null) {
        return typeof data === "function" ? "[function]" : data;
    }

    // Check for circular references in the current branch.
    if (ancestry.includes(data)) {
        return "[Circular]";
    }

    // If we've reached the maximum depth, return a summary.
    if (depth >= maxDepth) {
        if (data instanceof Map) {
            return { dataset: "[Map at max depth]" };
        } else if (Array.isArray(data)) {
            return "[Array at max depth]";
        } else {
            return "[Object at max depth]";
        }
    }

    // Append current object to ancestry for this branch.
    const newAncestry = ancestry.concat(data);

    // Process Map objects.
    if (data instanceof Map) {
        const result = {};
        for (const [key, value] of data.entries()) {
            result[key] = processState(value, depth + 1, maxDepth, newAncestry);
        }
        return { dataset: result };
    }

    // Process arrays.
    if (Array.isArray(data)) {
        return data.map(item => processState(item, depth + 1, maxDepth, newAncestry));
    }

    // Process plain objects.
    const result = {};
    for (const key in data) {
        if (Object.prototype.hasOwnProperty.call(data, key)) {
            const value = data[key];
            result[key] = typeof value === "function"
                ? "[function]"
                : processState(value, depth + 1, maxDepth, newAncestry);
        }
    }
    return result;
}