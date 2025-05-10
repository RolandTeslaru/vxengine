import { Vector3 } from 'three'
import { GlassProps } from '../types'
import Abstract from './Abstract'


export default class Glass extends Abstract {
    static u_blur = 1
    static u_thickness = 0.5
    static u_refraction = 1.5
    static u_alpha = 1.0

    static vertexShader = /* glsl */`
        varying vec3 v_normal_FS;        // World normal
        varying vec3 v_viewDir_FS;       // World space view vector (from surface to camera)

        void main() {
        vec4 worldPosition = modelMatrix * vec4(position, 1.0);
        
        mat3 worldNormalMatrix = transpose(inverse(mat3(modelMatrix)));
        v_normal_FS = normalize(worldNormalMatrix * normal);

        v_viewDir_FS = normalize(cameraPosition - worldPosition.xyz);
        
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `

    static fragmentShader = /* glsl */`
    uniform float u_alpha;      // Master alpha for this layer's effect
    uniform float u_refraction;        // Affects transparency at grazing angles
    uniform float u_thickness;  // Reduces transparency

    varying vec3 v_normal_FS;       
    varying vec3 v_viewDir_FS;      

    void main() {
      // Normalize inputs
      vec3 f_normal = normalize(v_normal_FS);
      vec3 f_viewDirection = normalize(v_viewDir_FS); // From surface to camera

      // --- Calculate this layer's effective alpha ---

      // 1. Base alpha from the u_alpha uniform
      float f_layerEffectAlpha = u_alpha;

      // 2. Thickness: Higher thickness makes it less transparent (reduces alpha)
      // This is a simple model: alpha decreases as thickness increases.
      // The '0.8' is an arbitrary factor to control sensitivity.
      f_layerEffectAlpha *= (1.0 - clamp(u_thickness * 0.8, 0.0, 0.95)); 

      // 3. IOR influencing alpha at grazing angles (Fresnel-like effect on transparency)
      // At grazing angles (viewDir perpendicular to normal), dot product is low -> more opaque.
      // At direct view (viewDir aligned with normal), dot product is high -> more transparent (closer to f_layerEffectAlpha).
      // R0 is the reflectance at normal incidence, approximated for dielectrics.
      // We'll use it to determine the "strength" of the glass's apparent solidity.
      float R0 = pow((1.0 - u_refraction) / (1.0 + u_refraction), 2.0);
      
      // schlick's approximation for fresnel factor
      float fresnelFactor = R0 + (1.0 - R0) * pow(1.0 - clamp(dot(f_viewDirection, f_normal), 0.0, 1.0), 5.0);
      
      // Apply Fresnel to alpha: make it more "solid" (less transparent) based on fresnelFactor
      // If fresnelFactor is high (grazing angle), alpha should be lower (more opaque).
      // This means the layer's transparency is reduced by the fresnelFactor.
      // Let's say the fresnelFactor determines how much of the 'solidity' (1.0 - alpha) is present.
      // Or, simpler: the layer is *at least* as opaque as fresnelFactor suggests for a reflective surface.
      // We are essentially making the glass appear more "present" or less see-through at edges.
      // A higher fresnelFactor means more "reflection-like" behavior, which for this alpha-only layer means more opacity.
      f_layerEffectAlpha *= (1.0 - fresnelFactor * 0.5); // Modulate by fresnel, 0.5 to soften effect


      // This shader does not output its own color.
      // It modifies the alpha of what's already in lamina_finalColor.
      // The Abstract class's blend functions will typically do:
      // blendedAlpha = prevLayerAlpha * newLayerEffectAlpha
      // So, we return vec4(0.0, 0.0, 0.0, f_layerEffectAlpha) and a blend mode like 'multiply' for alpha.
      // OR, more simply, if the blend mode just takes the new alpha:
      // The Abstract.processFinal needs to handle this.
      // Let's assume this layer contributes an alpha value that will be used to blend
      // the previous lamina_finalColor.rgb with whatever is "behind" the whole material.
      // A common way to handle this in a stack is that this layer says "what was visible before,
      // is now only f_layerEffectAlpha * u_alpha visible through me".

      // The most straightforward approach for the Abstract class to use this:
      // If the blend mode is 'normal', and this layer returns a color like (0,0,0, effectiveAlpha),
      // the blending would be:
      // finalColor.rgb = prevColor.rgb * (1.0 - effectiveAlpha) + newLayerColor.rgb * effectiveAlpha;
      // finalColor.a = prevColor.a * (1.0 - effectiveAlpha) + newLayerAlpha * effectiveAlpha;
      // Since our newLayerColor.rgb is (0,0,0), this would darken. This is not what we want.

      // We want this layer to act as a "filter" on the existing lamina_finalColor's alpha.
      // So, the RGB from lamina_finalColor should pass through.
      // The alpha from lamina_finalColor should be modulated by this layer's computed alpha.
      // This means this shader should output:
      // vec4(lamina_finalColor.rgb, lamina_finalColor.a * f_layerEffectAlpha)
      // This requires lamina_finalColor to be an input to this shader.
      // The current Abstract architecture has lamina_finalColor as a global GLSL variable that
      // the return value of this shader gets blended INTO.

      // So, this shader should return a color that, when blended, achieves the desired alpha modulation.
      // If the blend mode is 'normal', and we want result.a = previous.a * myEffectAlpha:
      // This is tricky with standard blend functions.
      // A MULTIPLY blend mode applied to an RGBA (1,1,1, myEffectAlpha) would achieve this for the alpha channel.
      // For the RGB, it would multiply by 1, leaving it unchanged.

      // Let's design it so this layer returns (1.0, 1.0, 1.0, f_layerEffectAlpha)
      // and expects a 'multiply' blend mode by default if it's just affecting transparency.
      // This way, lamina_finalColor.rgb * 1.0 = lamina_finalColor.rgb
      // And lamina_finalColor.a * f_layerEffectAlpha = desired new alpha.

      // If you want this layer to make the object itself more transparent (not just what's seen *through* it from previous layers):
      // The final return vec4 should be (original_color.rgb, original_color.a * f_layerEffectAlpha)
      // where original_color is what this object would have been without this glass layer.
      // In the context of the layer stack, it means it should take lamina_finalColor and modulate ITS alpha.

      // The processFinal in Abstract.ts does:
      // lamina_finalColor = $this.getBlendMode(returnVariable, 'lamina_finalColor')};
      // where returnVariable is the vec4 from this shader.
      // If this shader returns vec4(some_effect_color, f_layerEffectAlpha)
      // And blend mode is 'normal': 'blend_alpha(prev, new, new.a)'
      // 'mix(prev.rgb, new.rgb, new.a)' and 'mix(prev.a, new.a, new.a)' (this seems off for alpha)
      // Ah, lamina_blend_alpha is: 'vec4(mix(a.rgb, b.rgb, blendAlpha), mix(a.a, b.a, blendAlpha))' where blendAlpha is b.a.
      // So if this layer returns 'vec4(vec3(0.0), f_layerEffectAlpha)' and 'lamina_finalColor' (which is 'a')
      // has the matcap color:
      // result.rgb = mix(matcap.rgb, vec3(0.0), f_layerEffectAlpha) = matcap.rgb * (1.0 - f_layerEffectAlpha)
      // result.a   = mix(matcap.a, f_layerEffectAlpha, f_layerEffectAlpha)
      // This darkens the matcap color, which is like absorption. This is good for thickness!

      // So, the 'f_layerEffectAlpha' is more like an "opacity factor" for this layer.
      // If it's 1, this layer is fully "present". If 0, it's not.
      // The color it returns will be blended. For a "clear" glass that just adds "presence" via thickness/IOR effects on opacity:
      return vec4(0.0, 0.0, 0.0, clamp(f_layerEffectAlpha, 0.0, 1.0) ); // Return black, with calculated alpha.
                                                                     // This will darken the underlying matcap based on f_layerEffectAlpha when using normal blending.
                                                                     // This simulates absorption/occlusion by the glass.
    }
    `

    constructor(props?: GlassProps) {
        super(Glass, {
            name: "Glass",
            mode: "normal",
            ...props
        },
            // (self: Glass) => {
            //     self.schema.push({
            //         value: self.mapping,
            //         label: "mapping",
            //     })
            // }
        )

        // ... rest of the constructor for setting up uniforms ...
        // (Ensure u_alpha, u_thickness, u_ior are correctly initialized from props or defaults)
        if (props?.alpha !== undefined) {
            // @ts-ignore
            this.alpha = props.alpha;
            if (this.uniforms[`u_${this.uuid}_alpha`]) {
                this.uniforms[`u_${this.uuid}_alpha`].value = props.alpha;
            }
        } else {
            // @ts-ignore
            this.alpha = Glass.u_alpha;
            if (this.uniforms[`u_${this.uuid}_alpha`]) {
                this.uniforms[`u_${this.uuid}_alpha`].value = Glass.u_alpha;
            }
        }

        if (props?.thickness !== undefined) {
            // @ts-ignore
            this.thickness = props.thickness;
            if (this.uniforms[`u_${this.uuid}_thickness`]) {
                this.uniforms[`u_${this.uuid}_thickness`].value = props.thickness;
            }
        } else {
            // @ts-ignore
            this.thickness = Glass.u_thickness;
            if (this.uniforms[`u_${this.uuid}_thickness`]) {
                this.uniforms[`u_${this.uuid}_thickness`].value = Glass.u_thickness;
            }
        }

        if (props?.ior !== undefined) {
            // @ts-ignore
            this.ior = props.ior;
            if (this.uniforms[`u_${this.uuid}_ior`]) {
                this.uniforms[`u_${this.uuid}_ior`].value = props.ior;
            }
        } else {
            // @ts-ignore
            this.ior = Glass.u_ior;
            if (this.uniforms[`u_${this.uuid}_ior`]) {
                this.uniforms[`u_${this.uuid}_ior`].value = Glass.u_refraction;
            }
        }
    }
}