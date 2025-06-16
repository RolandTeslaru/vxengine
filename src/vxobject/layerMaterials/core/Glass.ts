import { GlassProps } from '../types'
import MaterialLayerAbstract from './MaterialLayerAbstract'
import * as THREE from "three"

export default class Glass extends MaterialLayerAbstract {

    protected get definition() {
        return {
            name: "Glass",
            uniforms: {
                alpha: { type: "float", default: 1 },
                ior: { type: "float", default: 1.53 },
                thickness: { type: "float", default: 0.5 },
                roughness: { type: "float", default: 0.0 },
                transmissionSamplerMap: { type: "map", default: undefined },
                transmissionDepthMap: { type: "map", default: undefined }
            },
            fragmentShader,
            vertexShader
        }
    }

    public vertexShader: string = vertexShader
    public fragmentShader: string = fragmentShader

    constructor(props?: GlassProps) {
        super(props)
    }
}




const vertexShader = /* glsl */`
    varying vec3 v_glass_worldPosition;
    varying vec3 v_glass_worldNormal;
    varying vec3 v_glass_worldViewDir;
    varying vec4 v_glass_currentPosition;

    void main() {
        // World space calculations
        vec4 worldPosition = modelMatrix * vec4(position, 1.0);
        v_glass_worldPosition = worldPosition.xyz;
        
        // World normal (proper transformation)
        mat3 worldNormalMatrix = transpose(inverse(mat3(modelMatrix)));
        v_glass_worldNormal = normalize(worldNormalMatrix * normal);
        
        // World view direction
        v_glass_worldViewDir = normalize(cameraPosition - worldPosition.xyz);
        
        // Screen position for sampling
        v_glass_currentPosition = projectionMatrix * viewMatrix * worldPosition;
    }
`

const fragmentShader = /* glsl */`
    #define NUM_SAMPLES 6
    #define PI 3.141592653589793
    #define PI2 6.283185307179586

    uniform float u_thickness;
    uniform float u_ior;
    uniform float u_roughness;
    uniform float u_alpha;
    
    // Scene textures - these would need to be provided by the render pipeline
    uniform sampler2D u_transmissionSamplerMap; // Background scene texture
    uniform sampler2D u_transmissionDepthMap;   // Depth buffer
    uniform vec2 u_transmissionSamplerSize;     // Texture size for LOD calculations
    uniform vec2 u_resolution;                  // Screen resolution
    
    varying vec3 v_glass_worldPosition;
    varying vec3 v_glass_worldNormal;
    varying vec3 v_glass_worldViewDir;
    varying vec4 v_glass_currentPosition;

    // Depth unpacking (from Spline)
    const vec4 UnpackFactors = vec4(255.0/256.0, 255.0/256.0, 255.0/256.0, 255.0/256.0) / vec4(16777216.0, 65536.0, 256.0, 1.0);
    float unpackRGBAToDepth(const in vec4 v) {
        return dot(v, UnpackFactors);
    }

    // Vogel disk sampling for high-quality blur
    vec2 vogelDiskSample(int sampleIndex, int sampleCount, float angle) {
        const float goldenAngle = 2.399963; // radians
        float r = sqrt(float(sampleIndex) + 0.5) / sqrt(float(sampleCount));
        float theta = float(sampleIndex) * goldenAngle + angle;
        return vec2(cos(theta), sin(theta)) * r;
    }

    // Interleaved gradient noise for temporal offset
    float getNoiseInterleavedGradient(vec2 screenPos) {
        vec3 magic = vec3(0.06711056, 0.00583715, 52.9829189);
        return fract(magic.z * fract(dot(screenPos, magic.xy)));
    }

    // IOR-based roughness scaling
    float applyIorToRoughness(float roughness, float ior) {
        return roughness * clamp(ior * 2.0 - 2.0, 0.0, 1.0);
    }

    // Volume transmission ray calculation
    vec3 getVolumeTransmissionRay(vec3 n, vec3 v, float thickness, float ior) {
        vec3 refractionVector = refract(-v, n, 1.0 / ior);
        
        // Scale by model transformation
        vec3 modelScale;
        modelScale.x = length(vec3(modelMatrix[0].xyz));
        modelScale.y = length(vec3(modelMatrix[1].xyz));
        modelScale.z = length(vec3(modelMatrix[2].xyz));
        
        return normalize(refractionVector) * thickness * modelScale;
    }

    // High-quality blur with depth awareness
    vec3 getTransmissionSample(vec2 fragCoord, float roughness, float ior, vec2 unrefractedCoords) {
        float framebufferLod = log2(u_transmissionSamplerSize.x) * applyIorToRoughness(roughness, ior);
        float lod = applyIorToRoughness(roughness, ior);
        
        // Early exit for no blur
        if (lod == 0.0) {
            return texture2D(u_transmissionSamplerMap, fragCoord).rgb;
        }
        
        vec2 texelSize = vec2(1.0) / u_resolution;
        float temporalAngle = getNoiseInterleavedGradient(gl_FragCoord.xy) * PI2;
        
        vec3 result = vec3(0.0);
        
        for (int i = 0; i < NUM_SAMPLES; i++) {
            vec2 vogelSample = vogelDiskSample(i, NUM_SAMPLES, temporalAngle) * texelSize;
            vec2 offset = vogelSample * (lod * 10.0); // Blur scale
            vec2 sampleUV = fragCoord + offset;
            
            // Depth-aware filtering to prevent bleeding across edges
            float opaqueDepth = unpackRGBAToDepth(texture2D(u_transmissionDepthMap, sampleUV));
            if (opaqueDepth != 0.0 && opaqueDepth < gl_FragCoord.z) {
                sampleUV = unrefractedCoords; // Fallback to unrefracted
                lod = lod > 4.0 ? lod : lod / 2.0; // Reduce blur
            }
            
            result += texture2D(u_transmissionSamplerMap, sampleUV).rgb;
        }
        
        return result / float(NUM_SAMPLES);
    }

    // Main transmission function
    vec3 getIBLVolumeRefraction(vec3 n, vec3 v, float roughness, float ior, float thickness) {
        vec3 transmissionRay = getVolumeTransmissionRay(n, v, thickness, ior);
        vec3 refractedRayExit = v_glass_worldPosition + transmissionRay;
        
        // Project refracted point to screen space
        vec4 ndcPos = projectionMatrix * viewMatrix * vec4(refractedRayExit, 1.0);
        vec2 refractionCoords = (ndcPos.xy / ndcPos.w) * 0.5 + 0.5;
        
        // Unrefracted coordinates for fallback
        vec2 unrefractedCoords = (v_glass_currentPosition.xy / v_glass_currentPosition.w) * 0.5 + 0.5;
        
        return getTransmissionSample(refractionCoords, roughness, ior, unrefractedCoords);
    }

    void main() {
        vec3 normal = normalize(v_glass_worldNormal);
        vec3 viewDir = normalize(v_glass_worldViewDir);
        
        // Calculate transmission
        vec3 transmission = getIBLVolumeRefraction(
            normal, 
            viewDir, 
            u_roughness, 
            u_ior, 
            u_thickness
        );
        
        // Simple fallback if transmission textures aren't available
        if (u_transmissionSamplerSize.x == 0.0) {
            // Basic refraction offset as fallback
            vec3 refractedDir = refract(-viewDir, normal, 1.0 / u_ior);
            vec2 screenUV = (v_glass_currentPosition.xy / v_glass_currentPosition.w) * 0.5 + 0.5;
            vec2 refractionOffset = refractedDir.xy * u_thickness * 0.1;
            transmission = vec3(0.9); // Neutral transmission color
        }
        
        // Output with alpha based on thickness and viewing angle
        float fresnel = pow(1.0 - abs(dot(viewDir, normal)), 2.0);
        float alpha = u_alpha * (1.0 - fresnel * 0.5);
        
        return vec4(transmission, alpha);
    }
`