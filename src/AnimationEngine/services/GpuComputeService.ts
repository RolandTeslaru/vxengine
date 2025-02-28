import { RawTimeline, RawTrack } from "@vxengine/types/data/rawData";
import * as THREE from "three"
import { GPUComputationRenderer, Variable } from "three-stdlib";


export class GpuComputeService {
    private gpuCompute: GPUComputationRenderer
    public keyframeTexture: THREE.DataTexture
    public handleTexture: THREE.DataTexture

    private _width: number
    private _height: number
    
    public computeRenderTargetTexture: THREE.Texture
    public computeVariable: Variable

    public get computeTextureWidth(){ return this._width }
    public get computeTextureHeight(){ return this._height }


    private _renderer: THREE.WebGLRenderer

    constructor(
        renderer: THREE.WebGLRenderer
    ) {
        this._renderer = renderer 
    }
    
    public buildTextures(rawTimeline: RawTimeline) {
        
        const flatTracks: RawTrack[] = rawTimeline.objects.reduce((acc, obj) => acc.concat(obj.tracks), []);
        const numTracks = flatTracks.length

        let maxKeyframeCount = 0;
        let maxTrackWith = ""
        let vxkey = ""
        for (let rawObj of rawTimeline.objects) {
            for (let rawTrack of rawObj.tracks) {
                maxKeyframeCount = Math.max(maxKeyframeCount, rawTrack.keyframes.length);
                maxTrackWith = rawTrack.propertyPath
                vxkey = rawObj.vxkey

            }
        }
        
        this._width = maxKeyframeCount;
        this._height = numTracks;

        this.gpuCompute = new GPUComputationRenderer(1, this._height,this._renderer)
        
        const keyframeData = new Float32Array(this._width * this._height * 4);
        const handleData = new Float32Array(this._width * this._height * 4);

        for(let trackIndex = 0; trackIndex < numTracks; trackIndex++) {
            const track = flatTracks[trackIndex];
            
            for(let kfIndex = 0; kfIndex < track.keyframes.length; kfIndex++) {
                const keyframe = track.keyframes[kfIndex];
                const pixelIndex = (trackIndex * this._width + kfIndex) * 4;

                // Keyframe data (time, value)
                keyframeData[pixelIndex + 0] = keyframe.time;     // R: time
                keyframeData[pixelIndex + 1] = keyframe.value;    // G: value
                keyframeData[pixelIndex + 2] = kfIndex === track.keyframes.length - 1 ? 1 : 0;  // B: isLastKeyframe
                keyframeData[pixelIndex + 3] = track.keyframes.length;  // A: keyframe count

                // Handle data
                handleData[pixelIndex + 0] = keyframe.handles[0];  // R: in handle x
                handleData[pixelIndex + 1] = keyframe.handles[1];  // G: in handle y
                handleData[pixelIndex + 2] = keyframe.handles[2];  // B: out handle x
                handleData[pixelIndex + 3] = keyframe.handles[3];  // A: out handle y
            }
        }

        this.keyframeTexture = new THREE.DataTexture(
            keyframeData,
            this._width,
            this._height,
            THREE.RGBAFormat,
            THREE.FloatType
        );
        this.handleTexture = new THREE.DataTexture(
            handleData,
            this._width,
            this._height,
            THREE.RGBAFormat,
            THREE.FloatType
        );

        this.keyframeTexture.needsUpdate = true;
        this.handleTexture.needsUpdate = true;
        this.keyframeTexture.minFilter = THREE.NearestFilter;
        this.keyframeTexture.magFilter = THREE.NearestFilter;
        this.handleTexture.minFilter = THREE.NearestFilter;
        this.handleTexture.magFilter = THREE.NearestFilter;

        this.computeVariable = this.gpuCompute.addVariable(
            'textureCompute',
            this.getComputeShader(),
            this.gpuCompute.createTexture() // This creates a 1xHeight texture for output
        );

        this.computeVariable.material.uniforms = {
            keyframeTexture: { value: this.keyframeTexture },
            handleTexture: { value: this.handleTexture },
            currentTime: { value: 0.0 }
        }

        this.gpuCompute.setVariableDependencies(this.computeVariable, [this.computeVariable])

        this.gpuCompute.init();
    }

    public computeInterpolationTexutre(newTime: number){
        this.computeVariable.material.uniforms.currentTime.value = newTime;
        this.gpuCompute.compute();

        this.computeRenderTargetTexture = this.gpuCompute.getCurrentRenderTarget(this.computeVariable).texture

        return this.computeRenderTargetTexture
    }


    private getComputeShader(): string {
        return /*glsl*/ `
            uniform sampler2D keyframeTexture;
            uniform sampler2D handleTexture;
            uniform float currentTime;

            float bezierInterpolate(float p0, float p1, float h0x, float h0y, float h1x, float h1y, float t) {
                float t2 = t * t;
                float t3 = t2 * t;
                float mt = 1.0 - t;
                float mt2 = mt * mt;
                float mt3 = mt2 * mt;
                return p0 * mt3 + 3.0 * h0y * mt2 * t + 3.0 * h1y * mt * t2 + p1 * t3;
            }

            void main() {
                float v = gl_FragCoord.y / resolution.y;
             
                gl_FragColor = vec4(v, 0.0, 0.0, 1.0);
            }
        `
    }
}