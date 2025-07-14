import { VXElementParam } from "@vxengine/vxobject/types";

const MATERIAL_PROPERTY_MAP = {
    color: { propertyPath: "color", type: "color", title: "Color" },
    emissive: { propertyPath: "emissive", type: "color", title: "Emissive" },
    roughness: { propertyPath: "roughness", type: "number", title: "Roughness" },
    metalness: { propertyPath: "metalness", type: "number", title: "Metalness" },
    opacity: { propertyPath: "opacity", type: "number", title: "Opacity" },
    transmission: { propertyPath: "transmission", type: "slider", min: 0, max: 1, step: 0.01, title: "Transmission" },
    thickness: { propertyPath: "thickness", type: "slider", min: 0, max: 10, step: 0.01, title: "Thickness" },
    ior: { propertyPath: "ior", type: "slider", min: 0, max: 10, step: 0.01, title: "Refraction / IOR" },
    reflectivity: { propertyPath: "reflectivity", type: "number", title: "Reflectivity" },
    iridescence: { propertyPath: "iridescence", type: "number", title: "Iridescence" },
    iridescenceIOR: { propertyPath: "iridescenceIOR", type: "number", title: "Iridescence IOR" },
    sheenRoughness: { propertyPath: "sheenRoughness", type: "number", title: "Sheen Roughness" },
    sheenColor: { propertyPath: "sheenColor", type: "color", title: "Sheen Color" },
    clearcoat: { propertyPath: "clearcoat", type: "number", title: "Clearcoat" },
    clearcoatRoughness: { propertyPath: "clearcoatRoughness", type: "number", title: "Clearcoat Roughness" },
    specularIntensity: { propertyPath: "specularIntensity", type: "number", title: "Specular Intensity" },
    specularColor: { propertyPath: "specularColor", type: "color", title: "Specular Color" },
    specular: { propertyPath: "specular", type: "color", title: "Specular" },
    shininess: { propertyPath: "shininess", type: "number", title: "Shininess" },
    refractionRatio: { propertyPath: "refractionRatio", type: "number", title: "Refraction Ratio" },
};

const MATERIAL_USE_MAP: Record<string, (keyof typeof MATERIAL_PROPERTY_MAP)[]> = {
    MeshStandardMaterial: [
        "color", "emissive", "roughness", "metalness", "opacity"
    ],
    MeshPhysicalMaterial: [
        "color", "emissive", "roughness", "transmission", "metalness",
        "thickness", "ior", "opacity", "reflectivity", "iridescence",
        "iridescenceIOR", "sheenRoughness", "sheenColor",
        "clearcoat", "clearcoatRoughness", "specularIntensity", "specularColor"
    ],
    MeshPhongMaterial: [
        "color", "emissive", "specular", "shininess", "opacity"
    ],
    MeshMatcapMaterial: [
        "color"
    ],
    MeshLambertMaterial: [
        "color", "emissive", "opacity", "reflectivity", "refractionRatio"
    ],
    MeshDepthMaterial: [],
    MeshBasicMaterial: [
        "color", "reflectivity", "refractionRatio"
    ],
    MeshToonMaterial: [
        "color", "opacity"
    ],
    ShaderMaterial: [],
    default: []
};

// export const MATERIALS_PARAM_MAP = Object.fromEntries(
//     Object.entries(MATERIAL_USE_MAP).map(([material, props]) => {
//         const params = Object.fromEntries(
//             props.map(key => [
//                 key,
//                 {
//                     key,
//                     currentPath: MATERIAL_PROPERTY_MAP[key].propertyPath,
//                     data: { param: MATERIAL_PROPERTY_MAP[key] }
//                 }
//             ])
//         );
//         return [material, params];
//     })
// ) as Record<keyof typeof MATERIAL_USE_MAP, any>;


// type returnType = Record<keyof typeof MATERIAL_USE_MAP, Record<string, {
//     key: string,
//     currentPath: string,
//     data: { param: VXElementParam }
//   }>>

export const generateMaterialParamMapWithPrefix = (materialTypeKey: string, paramCurrentPathPrefix?: string) => {
    const materialParamObj = MATERIAL_USE_MAP[materialTypeKey];
    return Object.fromEntries(Object.entries(MATERIAL_USE_MAP).filter(([_materialKey, _mat]) => _materialKey === materialTypeKey))



    return Object.entries(MATERIAL_USE_MAP).map(([material, props]) => {
        const params = Object.fromEntries(
            props.map(key => [
                key,
                {
                    key,
                    currentPath: MATERIAL_PROPERTY_MAP[key].propertyPath,
                    data: {
                        param: {
                            ...MATERIAL_PROPERTY_MAP[key],
                            propertyPath: paramCurrentPathPrefix ? paramCurrentPathPrefix + "." + MATERIAL_PROPERTY_MAP[key].propertyPath : MATERIAL_PROPERTY_MAP[key].propertyPath,
                        }
                    }
                }
            ])
        );
        return [material, params];
    })
}

export const MATERIAL_TITLES = {
    MeshStandardMaterial: "Standard Material",
    MeshPhysicalMaterial: "Physical Material",
    MeshPhongMaterial: "Phong Material",
    MeshLambertMaterial: "Lambert Material",
    MeshDepthMaterial: "Depth Material",
    MeshBasicMaterial: "Basic Material",
    MeshToonMaterial: "Toon Material",
    ShaderMaterial: "Shader Material",
};


export const MATERIALS_PARAM_MAP = {
    "MeshStandardMaterial": {
        "color": { key: "color", currentPath: "color", data: { param: { propertyPath: "color", type: "color", title: "Color" } } },
        "emissive": { key: "emissive", currentPath: "emissive", data: { param: { propertyPath: "emissive", type: "color", title: "Emissive" } } },
        "roughness": { key: "roughness", currentPath: "roughness", data: { param: { propertyPath: "roughness", type: "number", title: "Roughness" } } },
        "metalness": { key: "metalness", currentPath: "metalness", data: { param: { propertyPath: "metalness", type: "number", title: "Metalness" } } },
        "opacity": { key: "opacity", currentPath: "opacity", data: { param: { propertyPath: "opacity", type: "number", title: "Opacity" } } },
    },
    "MeshPhysicalMaterial": {
        "color": { key: "color", currentPath: "color", data: { param: { propertyPath: "color", type: "color", title: "Color" } } },
        "emissive": { key: "emissive", currentPath: "emissive", data: { param: { propertyPath: "emissive", type: "color", title: "Emissive" } } },
        "roughness": { key: "roughness", currentPath: "roughness", data: { param: { propertyPath: "roughness", type: "slider", min:0, max: 1, step: 0.01, title: "roughness" } } },
        "transmission": { key: "transmission", currentPath: "transmission", data: { param: { propertyPath: "transmission", type: "slider", min: 0, max: 1, step: 0.01, title: "transmission" } } },
        "metalness": { key: "metalness", currentPath: "metalness", data: { param: { propertyPath: "metalness", type: "slider", min: 0, max: 1, step: 0.01, title: "metalness" } } },
        "thickness": { key: "thickness", currentPath: "thickness", data: { param: { propertyPath: "thickness", type: "slider", min: 0, max: 10, step: 0.01, title: "thickness" } } },
        "ior": { key: "ior", currentPath: "ior", data: { param: { propertyPath: "ior", type: "slider", min: 0, max: 10, step: 0.01, title: "Refraction / IOR" } } },
        "opacity": { key: "opacity", currentPath: "opacity", data: { param: { propertyPath: "opacity", type: "number", title: "Opacity" } } },
        "reflectivity": { key: "reflectivity", currentPath: "reflectivity", data: { param: { propertyPath: "reflectivity", type: "number", title: "Reflectivity" } } },
        "iridescence": { key: "iridescence", currentPath: "iridescence", data: { param: { propertyPath: "iridescence", type: "number", title: "Iridescence" } } },
        "iridescenceIOR": { key: "iridescenceIOR", currentPath: "iridescenceIOR", data: { param: { propertyPath: "iridescenceIOR", type: "number", title: "Iridescence IOR" } } },
        "sheenRoughness": { key: "sheenRoughness", currentPath: "sheenRoughness", data: { param: { propertyPath: "sheenRoughness", type: "number", title: "Sheen Roughness" } } },
        "sheenColor": { key: "sheenColor", currentPath: "sheenColor", data: { param: { propertyPath: "sheenColor", type: "color", title: "Sheen Color" } } },
        "clearcoat": { key: "clearcoat", currentPath: "clearcoat", data: { param: { propertyPath: "clearcoat", type: "number", title: "Clearcoat" } } },
        "clearcoatRoughness": { key: "clearcoatRoughness", currentPath: "clearcoatRoughness", data: { param: { propertyPath: "clearcoatRoughness", type: "number", title: "Clearcoat Roughness" } } },
        "specularIntensity": { key: "specularIntensity", currentPath: "specularIntensity", data: { param: { propertyPath: "specularIntensity", type: "number", title: "Specular Intensity" } } },
        "specularColor": { key: "specularColor", currentPath: "specularColor", data: { param: { propertyPath: "specularColor", type: "color", title: "Specular Color" } } },
    },
    "MeshPhongMaterial": {
        "color": { key: "color", currentPath: "color", data: { param: { propertyPath: "color", type: "color", title: "Color" } } },
        "emissive": { key: "emissive", currentPath: "emissive", data: { param: { propertyPath: "emissive", type: "color", title: "Emissive" } } },
        "specular": { key: "specular", currentPath: "specular", data: { param: { propertyPath: "specular", type: "color", title: "Specular" } } },
        "shininess": { key: "shininess", currentPath: "shininess", data: { param: { propertyPath: "shininess", type: "number", title: "Shininess" } } },
        "opacity": { key: "opacity", currentPath: "opacity", data: { param: { propertyPath: "opacity", type: "number", title: "Opacity" } } },
    },
    "MeshMatcapMaterial": {
        "color": { key: "color", currentPath: "color", data: { param: { propertyPath: "color", type: "color", title: "Color" } } },
    },
    "MeshLambertMaterial": {
        "color": { key: "color", currentPath: "color", data: { param: { propertyPath: "color", type: "color", title: "Color" } } },
        "emissive": { key: "emissive", currentPath: "emissive", data: { param: { propertyPath: "emissive", type: "color", title: "Emissive" } } },
        "opacity": { key: "opacity", currentPath: "opacity", data: { param: { propertyPath: "opacity", type: "number", title: "Opacity" } } },
        "reflectivity": { key: "reflectivity", currentPath: "reflectivity", data: { param: { propertyPath: "reflectivity", type: "number", title: "Reflectivity" } } },
        "refractionRatio": { key: "refractionRatio", currentPath: "refractionRatio", data: { param: { propertyPath: "refractionRatio", type: "number", title: "Refraction Ratio" } } },
    },
    "MeshDepthMaterial": {},
    "MeshBasicMaterial": {
        "color": { key: "color", currentPath: "color", data: { param: { propertyPath: "color", type: "color", title: "Color" } } },
        "reflectivity": { key: "reflectivity", currentPath: "reflectivity", data: { param: { propertyPath: "reflectivity", type: "number", title: "Reflectivity" } } },
        "refractionRatio": { key: "refractionRatio", currentPath: "refractionRatio", data: { param: { propertyPath: "refractionRatio", type: "number", title: "Refraction Ratio" } } },
    },
    "MeshToonMaterial": {
        "color": { key: "color", currentPath: "color", data: { param: { propertyPath: "color", type: "color", title: "Color" } } },
        "opacity": { key: "opacity", currentPath: "opacity", data: { param: { propertyPath: "opacity", type: "number", title: "Opacity" } } },
    },
    "ShaderMaterial": {

    },
    default: {}
}