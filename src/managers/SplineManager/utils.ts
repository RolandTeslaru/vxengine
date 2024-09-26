export const extractSplineKeyFromNodeKey = (nodeKey: string) => {
    const firstDotIndex = nodeKey.indexOf('.');

    if(firstDotIndex === -1)
        return nodeKey;

    const splineKey = nodeKey.substring(0, firstDotIndex);
    return splineKey
}