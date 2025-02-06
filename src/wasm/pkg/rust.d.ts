/* tslint:disable */
/* eslint-disable */
/**
* @param {number} p0
* @param {number} p1
* @param {number} p2
* @param {number} p3
* @param {number} t
* @returns {number}
*/
export function cubic_bezier(p0: number, p1: number, p2: number, p3: number, t: number): number;
/**
* @param {number} p0
* @param {number} p1
* @param {number} p2
* @param {number} p3
* @param {number} t
* @returns {number}
*/
export function cubic_bezier_derivative(p0: number, p1: number, p2: number, p3: number, t: number): number;
/**
* @param {number} p0
* @param {number} p1
* @param {number} p2
* @param {number} p3
* @param {number} x
* @param {number} epsilon
* @param {number} max_iterations
* @returns {number}
*/
export function solve_cubic_bezier_t(p0: number, p1: number, p2: number, p3: number, x: number, epsilon: number, max_iterations: number): number;
/**
* @param {number} start_value
* @param {number} end_value
* @param {number} start_handle_x
* @param {number} start_handle_y
* @param {number} end_handle_x
* @param {number} end_handle_y
* @param {number} progress
* @returns {number}
*/
export function interpolate_number(start_value: number, end_value: number, start_handle_x: number, start_handle_y: number, end_handle_x: number, end_handle_y: number, progress: number): number;
/**
*/
export class Spline {
  free(): void;
/**
* @param {(Vector3)[]} points
* @param {boolean} closed
* @param {number} tension
*/
  constructor(points: (Vector3)[], closed: boolean, tension: number);
/**
* @param {number} new_tension
*/
  change_tension(new_tension: number): void;
/**
* @param {number} t
* @returns {Vector3}
*/
  get_point(t: number): Vector3;
}
/**
*/
export class Vector3 {
  free(): void;
/**
* @param {number} x
* @param {number} y
* @param {number} z
* @returns {Vector3}
*/
  static new(x: number, y: number, z: number): Vector3;
/**
* @param {Vector3} other
* @returns {number}
*/
  distance_to(other: Vector3): number;
/**
* @param {Vector3} other
* @param {number} t
* @returns {Vector3}
*/
  lerp(other: Vector3, t: number): Vector3;
/**
*/
  x: number;
/**
*/
  y: number;
/**
*/
  z: number;
}

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
  readonly memory: WebAssembly.Memory;
  readonly __wbg_vector3_free: (a: number, b: number) => void;
  readonly __wbg_get_vector3_x: (a: number) => number;
  readonly __wbg_set_vector3_x: (a: number, b: number) => void;
  readonly __wbg_get_vector3_y: (a: number) => number;
  readonly __wbg_set_vector3_y: (a: number, b: number) => void;
  readonly __wbg_get_vector3_z: (a: number) => number;
  readonly __wbg_set_vector3_z: (a: number, b: number) => void;
  readonly vector3_new: (a: number, b: number, c: number) => number;
  readonly vector3_distance_to: (a: number, b: number) => number;
  readonly vector3_lerp: (a: number, b: number, c: number) => number;
  readonly __wbg_spline_free: (a: number, b: number) => void;
  readonly spline_new: (a: number, b: number, c: number, d: number) => number;
  readonly spline_change_tension: (a: number, b: number) => void;
  readonly spline_get_point: (a: number, b: number) => number;
  readonly cubic_bezier: (a: number, b: number, c: number, d: number, e: number) => number;
  readonly cubic_bezier_derivative: (a: number, b: number, c: number, d: number, e: number) => number;
  readonly solve_cubic_bezier_t: (a: number, b: number, c: number, d: number, e: number, f: number, g: number) => number;
  readonly interpolate_number: (a: number, b: number, c: number, d: number, e: number, f: number, g: number) => number;
  readonly __wbindgen_malloc: (a: number, b: number) => number;
}

export type SyncInitInput = BufferSource | WebAssembly.Module;
/**
* Instantiates the given `module`, which can either be bytes or
* a precompiled `WebAssembly.Module`.
*
* @param {{ module: SyncInitInput }} module - Passing `SyncInitInput` directly is deprecated.
*
* @returns {InitOutput}
*/
export function initSync(module: { module: SyncInitInput } | SyncInitInput): InitOutput;

/**
* If `module_or_path` is {RequestInfo} or {URL}, makes a request and
* for everything else, calls `WebAssembly.instantiate` directly.
*
* @param {{ module_or_path: InitInput | Promise<InitInput> }} module_or_path - Passing `InitInput` directly is deprecated.
*
* @returns {Promise<InitOutput>}
*/
export default function __wbg_init (module_or_path?: { module_or_path: InitInput | Promise<InitInput> } | InitInput | Promise<InitInput>): Promise<InitOutput>;
