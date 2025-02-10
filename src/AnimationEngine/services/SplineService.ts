import init, {
    Spline as wasm_Spline,
    Vector3 as wasm_Vector3,
    interpolate_number as wasm_interpolateNumber,
} from "../../wasm/pkg";
import { RawSpline } from "../types/track";
import { logReportingService } from "./LogReportingService";
import { WasmService } from "./WasmService";

const LOG_MODULE = "SplineService"

export class SplineService {
    private _splinesCache: Map<string, wasm_Spline> = new Map();

    /**
    * @param _wasmService - An instance of WasmService that provides WASM functionality.
    */
    constructor(private _wasmService: WasmService) {}

    /**
     * Caches splines by initializing WebAssembly spline objects.
     * @param splines - A record of splines to cache.
     */
    async cacheSplines(splines: Record<string, RawSpline>) {
        await this._wasmService.wasmReady; // Ensure WASM is initialized

        if (!splines) {
            logReportingService.logWarning(`No splines provided to cache.`, { module: LOG_MODULE, functionName: "cacheSplines" })
            return;
        }

        for (const [key, spline] of Object.entries(splines)) {
            const nodes = spline.nodes;
            const wasmNodes = nodes.map((node) =>
                this._wasmService.createWasmVector3(node[0], node[1], node[2])
            );

            // Example arguments, adjust as needed
            const wasmSpline = this._wasmService.createWasmSpline(wasmNodes, false, 0.5)

            // Cache the WebAssembly spline object
            this._splinesCache.set(key, wasmSpline);
        }
    }

    /**
   * Retrieves a cached WASM spline object.
   * @param splineKey - The key identifying the spline.
   * @returns The WASM spline object, if found.
   */
    getSpline(splineKey: string): any | undefined {
        return this._splinesCache.get(splineKey);
    }

    /**
     * Returns a point on the spline at a given progress (0 to 1).
     * @param splineKey - The key of the spline.
     * @param progress - A value between 0 and 1.
     * @returns The point on the spline with x, y, z coordinates or null if not found.
     */
    getSplinePointAt(splineKey: string, progress: number): { x: number; y: number; z: number } | null {
        const spline = this.getSpline(splineKey);
        return spline ? spline.get_point(progress) : null;
    }
}