import { RawTimeline, RawTrack } from "@vxengine/types/data/rawData";
import * as THREE from "three"
import { GPUComputationRenderer, Variable } from "three-stdlib";


export class GpuComputeService {
    private gpuCompute: GPUComputationRenderer
    public keyframeTexture: THREE.DataTexture
    public handleTexture: THREE.DataTexture

    private _pixelBuffer: Float32Array;

    private _inputTextureWidth: number
    private _computeHeight: number

    public computeVariable: Variable

    public get computeTextureWidth() { return this._inputTextureWidth }
    public get computeTextureHeight() { return this._computeHeight }
    public get pixelBuffer() { return this._pixelBuffer }


    private _renderer: THREE.WebGLRenderer

    constructor() {
        this._renderer = new THREE.WebGLRenderer();
    }

    public buildTextures(rawTimeline: RawTimeline) {

        const flatTracks: RawTrack[] = rawTimeline.objects.reduce((acc, obj) => acc.concat(obj.tracks), []);
        const numTracks = flatTracks.length
        
        this._pixelBuffer = new Float32Array(numTracks * 4);

        let maxKeyframeCount = 0;
        for (let rawObj of rawTimeline.objects)
            for (let rawTrack of rawObj.tracks)
                maxKeyframeCount = Math.max(maxKeyframeCount, rawTrack.keyframes.length);

        this._inputTextureWidth = maxKeyframeCount;
        this._computeHeight = numTracks;

        this.gpuCompute = new GPUComputationRenderer(1, this._computeHeight, this._renderer)

        const keyframeData = new Float32Array(this._inputTextureWidth * this._computeHeight * 4);
        const handleData = new Float32Array(this._inputTextureWidth * this._computeHeight * 4);

        for (let trackIndex = 0; trackIndex < numTracks; trackIndex++) {
            const track = flatTracks[trackIndex];

            for (let kfIndex = 0; kfIndex < track.keyframes.length; kfIndex++) {
                const keyframe = track.keyframes[kfIndex];
                const pixelIndex = (trackIndex * this._inputTextureWidth + kfIndex) * 4;

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
            this._inputTextureWidth,
            this._computeHeight,
            THREE.RGBAFormat,
            THREE.FloatType
        );
        this.handleTexture = new THREE.DataTexture(
            handleData,
            this._inputTextureWidth,
            this._computeHeight,
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
            currentTime: { value: 0.0 },
            textureWidth: { value: this._inputTextureWidth}
        }

        this.gpuCompute.setVariableDependencies(this.computeVariable, []);

        const error = this.gpuCompute.init();
        if (error !== null) {
            console.error('GPUComputationRenderer init error:', error);
        }
    }

    public computeInterpolations(newTime: number) {
        console.log("Computing interpolation ")
        this.computeVariable.material.uniforms.currentTime.value = newTime;
        this.gpuCompute.compute();

        const renderTarget = this.gpuCompute.getCurrentRenderTarget(this.computeVariable);

        this._renderer.readRenderTargetPixels(
            renderTarget,
            0,
            0,
            1,
            this._computeHeight,
            this._pixelBuffer
        )
    }

    private getComputeShader(): string {
        return /*glsl*/ `
            uniform sampler2D keyframeTexture;
            uniform sampler2D handleTexture;
            uniform float currentTime;
            uniform float textureWidth;

            float bezierInterpolate(float p0, float p1, float h0x, float h0y, float h1x, float h1y, float t) {
                float t2 = t * t;
                float t3 = t2 * t;
                float mt = 1.0 - t;
                float mt2 = mt * mt;
                float mt3 = mt2 * mt;
                return p0 * mt3 + 3.0 * h0y * mt2 * t + 3.0 * h1y * mt * t2 + p1 * t3;
            }

            // Binary search to find the next keyframe index
            float findNextKeyframeIndex(float v, float keyframeCount) {
                float left = 0.0;
                float right = keyframeCount - 1.0;

                for (int i = 0; i < 32; i++) { // Limit iterations to avoid infinite loops
                    if (left > right) break;

                    float mid = floor((left + right) / 2.0);
                    vec2 midUv = vec2(mid / textureWidth, v);
                    float midTime = texture2D(keyframeTexture, midUv).r;

                    if (currentTime < midTime) {
                        right = mid - 1.0;
                    } else if (currentTime > midTime) {
                        left = mid + 1.0;
                    } else {
                        return mid; // Exact match
                    }
                }
                return left; // Index of the next keyframe
            }


            void main() {
                // Get track index (y-coordinate, 0 to 1)
                float v = gl_FragCoord.y / resolution.y;
                vec2 uv = vec2(0.0, v);

                // Read first keyframe to get keyframe count
                vec4 firstKeyframe = texture2D(keyframeTexture, uv);
                float keyframeCount = firstKeyframe.a;

                // Handle Edge cases
                if (keyframeCount == 0.0) {
                    gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
                    return;
                }

                // Before first keyframe
                if (currentTime <= firstKeyframe.r) {
                    gl_FragColor = vec4(firstKeyframe.g, 0.0, 0.0, 1.0);
                    return;
                }

                // After last keyframe
                if (currentTime >= texture2D(keyframeTexture, vec2((keyframeCount - 1.0) / textureWidth, v)).r) {
                    gl_FragColor = vec4(texture2D(keyframeTexture, vec2((keyframeCount - 1.0) / textureWidth, v)).g, 0.0, 0.0, 1.0);
                    return;
                }

                // Binary search for the next keyframe index
                float rightIndex = findNextKeyframeIndex(v, keyframeCount);
                float leftIndex = rightIndex - 1.0;

                // Fetch surrounding keyframes and handles
                vec2 leftUv = vec2(leftIndex / textureWidth, v);
                vec2 rightUv = vec2(rightIndex / textureWidth, v);
                vec4 leftKeyframe = texture2D(keyframeTexture, leftUv);
                vec4 rightKeyframe = texture2D(keyframeTexture, rightUv);
                vec4 leftHandles = texture2D(handleTexture, leftUv);
                vec4 rightHandles = texture2D(handleTexture, rightUv);

                // Interpolation parameters
                float p0 = leftKeyframe.g;
                float p1 = rightKeyframe.g;
                float h0x = leftHandles.z; // Out handle x
                float h0y = p0 + leftHandles.w; // Out handle y (relative)
                float h1x = rightHandles.x; // In handle x
                float h1y = p1 + rightHandles.y; // In handle y (relative)

                float duration = rightKeyframe.r - leftKeyframe.r;
                float t = duration == 0.0 ? 0.0 : (currentTime - leftKeyframe.r) / duration;
                float value = bezierInterpolate(p0, p1, h0x, h0y, h1x, h1y, t);

                gl_FragColor = vec4(value, 0.0, 0.0, 1.0);

            }
        `
    }
}