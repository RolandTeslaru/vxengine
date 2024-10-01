export const extractSplineKeyFromNodeKey = (nodeKey: string) => {
    const firstDotIndex = nodeKey.indexOf('.');

    if(firstDotIndex === -1)
        return nodeKey;

    const splineKey = nodeKey.substring(0, firstDotIndex);
    return splineKey
}

export const extractVxKeyFromSplineKey = (splineKey: string) => {
    const firstDotIndex = splineKey.indexOf('.');
    const vxkey = splineKey.substring(0, firstDotIndex);
    return vxkey;
}