// WasmService.ts
import init, {
    Spline as WasmSpline,
    Vector3 as WasmVector3,
    interpolate_number as wasm_interpolateNumber,
} from '../../wasm/pkg';
import { logReportingService } from './LogReportingService';

const LOG_MODULE = "WasmService"

export type WasmInitCallback = (interpolateNumberFn: typeof wasm_interpolateNumber) => void;

export class WasmService {
    wasmReady: Promise<void>;
    private _isInitialized: boolean = false;

    constructor(
        private wasmUrl: string = "/assets/wasm/rust_bg.wasm",
        onSuccess?: WasmInitCallback
    ) {
        this.wasmReady = this._initializeWasm(onSuccess);
    }

    /**
     * Loads the WASM module.
     */
    private async _initializeWasm(onSuccess?: WasmInitCallback): Promise<void> {
        const LOG_CONTEXT = { module: LOG_MODULE, functionName: "_initializeWasm" }
    
        logReportingService.logInfo(
            `Initializing WASM Driver with URL: ${this.wasmUrl}`, LOG_CONTEXT)
        try {
            await init(this.wasmUrl);
            this._isInitialized = true;
            
            if (onSuccess) {
                onSuccess(this.interpolateNumberFunction);
            }

            logReportingService.logInfo(
                `WASM Driver initialized successfully`, LOG_CONTEXT)
        } catch (error) {
            logReportingService.logError(error, LOG_CONTEXT)
        }
    }

    /**
     * Ensures the WASM module is ready.
     */
    public async ready(): Promise<void> {
        return this.wasmReady;
    }

    /**
     * Creates a new WASM Vector3 instance.
     * @param x - X coordinate.
     * @param y - Y coordinate.
     * @param z - Z coordinate.
     * @returns A new WASM Vector3 object.
     */
    public createWasmVector3(x: number, y: number, z: number) {
        return WasmVector3.new(x, y, z);
    }

    /**
     * Creates a new WASM Spline instance.
     * @param nodes - An array of WASM Vector3 objects.
     * @param flag - A boolean flag (adjust usage as needed).
     * @param tension - A tension value for the spline.
     * @returns A new WASM Spline object.
     */
    public createWasmSpline(nodes: any[], flag: boolean, tension: number): WasmSpline {
        return new WasmSpline(nodes, flag, tension);
    }

    /**
     * Exposes the WASM interpolation function if needed.
     */
    public get interpolateNumberFunction(): typeof wasm_interpolateNumber {
        return wasm_interpolateNumber;
    }
}