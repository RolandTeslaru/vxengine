import { VXElementParam } from "@vxengine/vxobject/types";
import { useClipboardManagerAPI } from "@vxengine/managers/ClipboardManager/store";
import { getProperty } from "@vxengine/managers/ObjectManager/stores/managerStore";
import { getNestedProperty } from "@vxengine/utils";
import animationEngineInstance from "@vxengine/singleton";
import { useTimelineManagerAPI } from "@vxengine/managers/TimelineManager";
import { hsl } from "@vxengine/ui/components/ColorPicker/types";



export const handleOnCopyNumber = (vxkey: string, param: VXElementParam, vxRefObj:  React.RefObject<any>) => {
    const propertyPath = param.propertyPath
    const value = getProperty(vxkey, propertyPath) || getNestedProperty(vxRefObj.current, propertyPath);
    useClipboardManagerAPI.getState().addItem("number", value);
}

export const handleOnPasteNumber = (vxkey: string, param: VXElementParam, vxRefObj:  React.RefObject<any>) => {
    const value = useClipboardManagerAPI.getState().getItemByType("number") as number;

    animationEngineInstance
        .paramModifierService
        .modifyParamValue(vxkey, param.propertyPath, value, true)
        .flushTimelineStateUpdates()
}

export const handleOnCopyColor = (vxkey: string, param: VXElementParam, vxRefObj:  React.RefObject<any>) => {
    const propertyPath = param.propertyPath;
    const rPropertyPath = propertyPath !== "" ? `${propertyPath}.r` : "r"
    const gPropertyPath = propertyPath !== "" ? `${propertyPath}.g` : "g"
    const bPropertyPath = propertyPath !== "" ? `${propertyPath}.b` : "b"

    const redValue = getProperty(vxkey, rPropertyPath) || getNestedProperty(vxRefObj.current, rPropertyPath)
    const greenValue = getProperty(vxkey, gPropertyPath) || getNestedProperty(vxRefObj.current, gPropertyPath)
    const blueValue = getProperty(vxkey, bPropertyPath) || getNestedProperty(vxRefObj.current, bPropertyPath)

    useClipboardManagerAPI.getState().addItem("color", {
        redValue, greenValue, blueValue
    })
}

export const handleOnPasteColor = (vxkey: string, param: VXElementParam, vxRefObj:  React.RefObject<any>) => {
    const propertyPath = param.propertyPath;
    const rPropertyPath = propertyPath !== "" ? `${propertyPath}.r` : "r"
    const gPropertyPath = propertyPath !== "" ? `${propertyPath}.g` : "g"
    const bPropertyPath = propertyPath !== "" ? `${propertyPath}.b` : "b"

    const { redValue, greenValue, blueValue } = useClipboardManagerAPI.getState().getItemByType("color")

    animationEngineInstance
        .paramModifierService
        .modifyParamValue(vxkey, rPropertyPath, redValue, false)
        .modifyParamValue(vxkey, gPropertyPath, greenValue, false)
        .modifyParamValue(vxkey, bPropertyPath, blueValue, true)
        .flushTimelineStateUpdates()

}

export const hslToRgb = (h: number, s: number, l: number) => {
    s /= 100;
    l /= 100;

    const k = (n: number) => (n + h / 30) % 12;
    const a = s * Math.min(l, 1 - l);
    const f = (n: number) => l - a * Math.max(Math.min(k(n) - 3, 9 - k(n), 1), -1);

    return {
        r: f(0),
        g: f(8),
        b: f(4),
    };
};


// Convert RGB to HSL and update color
export const rgbToHsl = (r: number, g: number, b: number): hsl => {
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0;
    let s = 0;
    const l = (max + min) / 2;

    if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r:
                h = (g - b) / d + (g < b ? 6 : 0);
                break;
            case g:
                h = (b - r) / d + 2;
                break;
            case b:
                h = (r - g) / d + 4;
                break;
        }
        h *= 60;
    }
    return { h: Math.round(h), s: Math.round(s * 100), l: Math.round(l * 100) };
};


export const getDefaultParamValue = (vxkey: string, propertyPath: string,  vxRefObj: any) => {
    return getProperty(vxkey, propertyPath) ?? getNestedProperty(vxRefObj, propertyPath) ?? 0
}

// return the keyframeKey if found, else return null
export const isOverKeyframe = (trackKey: string, orderedKeyframeKeys: string[]) => {
    const currentTime = animationEngineInstance.currentTime
    const track = useTimelineManagerAPI.getState().tracks[trackKey]
    if (!track) return false

    let leftIndex = 0;
    let rightIndex = orderedKeyframeKeys.length - 1
    let foundIndex = -1;

    while (leftIndex <= rightIndex) {
        const mid = Math.floor((leftIndex + rightIndex) / 2)
        const midKey = orderedKeyframeKeys[mid];
        const midTime = track.keyframes[midKey].time;

        if (midTime === currentTime) {
            foundIndex = mid;
            break
        } else if (midTime < currentTime) {
            leftIndex = mid + 1;
        } else {
            rightIndex = mid - 1;
        }
    }

    return foundIndex !== -1 ? orderedKeyframeKeys[foundIndex] : null
}