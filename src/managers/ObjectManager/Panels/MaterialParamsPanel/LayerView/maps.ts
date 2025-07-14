import { VXElementParams } from "@vxengine/vxobject/types";

export const LAYER_PARAMS = {
    Depth: [
        { title: "colorA", propertyPath: "uniforms.colorA.value", type: "color" },
        { title: "colorB", propertyPath: "uniforms.colorB.value", type: "color" },
        { title: "near", propertyPath: "uniforms.near.value", type: "number" },
        { title: "far", propertyPath: "uniforms.far.value", type: "number" },
        { title: "intensity", propertyPath: "uniforms.alpha.value", type: "slider", min: 0, max: 1, step: 0.01 },
    ],
    Color: [
        { title: "color", propertyPath: "uniforms.color.value", type: "color" },
        { title: "intensity", propertyPath: "uniforms.alpha.value", type: "slider", min: 0, max: 1, step: 0.01 },
    ],
    Displace: [
        { title: "strength", propertyPath: "uniforms.strength.value", type: "number" },
        { title: "scale", propertyPath: "uniforms.scale.value", type: "number" },
        { title: "intensity", propertyPath: "uniforms.alpha.value", type: "slider", min: 0, max: 1, step: 0.01 },
    ],
    Fresnel: [
        { title: "color", propertyPath: "uniforms.color.value", type: "color" },
        { title: "bias", propertyPath: "uniforms.bias.value", type: "slider", min: -1, max: 1, step: 0.01 },
        { title: "power", propertyPath: "uniforms.power.value", type: "slider", min: 0, max: 10, step: 0.01 },
        { title: "factor", propertyPath: "uniforms.factor.value", type: "slider", min: 0, max: 10, step: 0.01 },
        { title: "intensity", propertyPath: "uniforms.intensity.value", type: "slider", min: 0, max: 10, step: 0.01 },
    ],
    Matcap: [
        { title: "intensity", propertyPath: "uniforms.alpha.value", type: "slider", min: 0, max: 1, step: 0.01 },
    ],
    Glass: [
        { title: "Blur", propertyPath: "uniforms.blur.value", type: "number" },
        { title: "Thickness", propertyPath: "uniforms.thickness.value", type: "number" },
        { title: "Refraction", propertyPath: "uniforms.refraction.value", type: "number" },
        { title: "intensity", propertyPath: "uniforms.alpha.value", type: "slider", min: 0, max: 1, step: 0.01 },
    ]
} as Record<string, VXElementParams>