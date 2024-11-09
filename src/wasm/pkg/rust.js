let wasm;

const cachedTextDecoder = (typeof TextDecoder !== 'undefined' ? new TextDecoder('utf-8', { ignoreBOM: true, fatal: true }) : { decode: () => { throw Error('TextDecoder not available') } } );

if (typeof TextDecoder !== 'undefined') { cachedTextDecoder.decode(); };

let cachedUint8ArrayMemory0 = null;

function getUint8ArrayMemory0() {
    if (cachedUint8ArrayMemory0 === null || cachedUint8ArrayMemory0.byteLength === 0) {
        cachedUint8ArrayMemory0 = new Uint8Array(wasm.memory.buffer);
    }
    return cachedUint8ArrayMemory0;
}

function getStringFromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    return cachedTextDecoder.decode(getUint8ArrayMemory0().subarray(ptr, ptr + len));
}

const heap = new Array(128).fill(undefined);

heap.push(undefined, null, true, false);

function getObject(idx) { return heap[idx]; }

let heap_next = heap.length;

function dropObject(idx) {
    if (idx < 132) return;
    heap[idx] = heap_next;
    heap_next = idx;
}

function takeObject(idx) {
    const ret = getObject(idx);
    dropObject(idx);
    return ret;
}

function _assertClass(instance, klass) {
    if (!(instance instanceof klass)) {
        throw new Error(`expected instance of ${klass.name}`);
    }
    return instance.ptr;
}

let cachedDataViewMemory0 = null;

function getDataViewMemory0() {
    if (cachedDataViewMemory0 === null || cachedDataViewMemory0.buffer.detached === true || (cachedDataViewMemory0.buffer.detached === undefined && cachedDataViewMemory0.buffer !== wasm.memory.buffer)) {
        cachedDataViewMemory0 = new DataView(wasm.memory.buffer);
    }
    return cachedDataViewMemory0;
}

let WASM_VECTOR_LEN = 0;

function addHeapObject(obj) {
    if (heap_next === heap.length) heap.push(heap.length + 1);
    const idx = heap_next;
    heap_next = heap[idx];

    heap[idx] = obj;
    return idx;
}

function passArrayJsValueToWasm0(array, malloc) {
    const ptr = malloc(array.length * 4, 4) >>> 0;
    const mem = getDataViewMemory0();
    for (let i = 0; i < array.length; i++) {
        mem.setUint32(ptr + 4 * i, addHeapObject(array[i]), true);
    }
    WASM_VECTOR_LEN = array.length;
    return ptr;
}
/**
* @param {number} p0
* @param {number} p1
* @param {number} p2
* @param {number} p3
* @param {number} t
* @returns {number}
*/
export function cubic_bezier(p0, p1, p2, p3, t) {
    const ret = wasm.cubic_bezier(p0, p1, p2, p3, t);
    return ret;
}

/**
* @param {number} p0
* @param {number} p1
* @param {number} p2
* @param {number} p3
* @param {number} t
* @returns {number}
*/
export function cubic_bezier_derivative(p0, p1, p2, p3, t) {
    const ret = wasm.cubic_bezier_derivative(p0, p1, p2, p3, t);
    return ret;
}

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
export function solve_cubic_bezier_t(p0, p1, p2, p3, x, epsilon, max_iterations) {
    const ret = wasm.solve_cubic_bezier_t(p0, p1, p2, p3, x, epsilon, max_iterations);
    return ret;
}

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
export function interpolate_number(start_value, end_value, start_handle_x, start_handle_y, end_handle_x, end_handle_y, progress) {
    const ret = wasm.interpolate_number(start_value, end_value, start_handle_x, start_handle_y, end_handle_x, end_handle_y, progress);
    return ret;
}

const SplineFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_spline_free(ptr >>> 0, 1));
/**
*/
export class Spline {

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        SplineFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_spline_free(ptr, 0);
    }
    /**
    * @param {(Vector3)[]} points
    * @param {boolean} closed
    * @param {number} tension
    */
    constructor(points, closed, tension) {
        const ptr0 = passArrayJsValueToWasm0(points, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.spline_new(ptr0, len0, closed, tension);
        this.__wbg_ptr = ret >>> 0;
        SplineFinalization.register(this, this.__wbg_ptr, this);
        return this;
    }
    /**
    * @param {number} t
    * @returns {Vector3}
    */
    get_point(t) {
        const ret = wasm.spline_get_point(this.__wbg_ptr, t);
        return Vector3.__wrap(ret);
    }
}

const Vector3Finalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_vector3_free(ptr >>> 0, 1));
/**
*/
export class Vector3 {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(Vector3.prototype);
        obj.__wbg_ptr = ptr;
        Vector3Finalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    static __unwrap(jsValue) {
        if (!(jsValue instanceof Vector3)) {
            return 0;
        }
        return jsValue.__destroy_into_raw();
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        Vector3Finalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_vector3_free(ptr, 0);
    }
    /**
    * @returns {number}
    */
    get x() {
        const ret = wasm.__wbg_get_vector3_x(this.__wbg_ptr);
        return ret;
    }
    /**
    * @param {number} arg0
    */
    set x(arg0) {
        wasm.__wbg_set_vector3_x(this.__wbg_ptr, arg0);
    }
    /**
    * @returns {number}
    */
    get y() {
        const ret = wasm.__wbg_get_vector3_y(this.__wbg_ptr);
        return ret;
    }
    /**
    * @param {number} arg0
    */
    set y(arg0) {
        wasm.__wbg_set_vector3_y(this.__wbg_ptr, arg0);
    }
    /**
    * @returns {number}
    */
    get z() {
        const ret = wasm.__wbg_get_vector3_z(this.__wbg_ptr);
        return ret;
    }
    /**
    * @param {number} arg0
    */
    set z(arg0) {
        wasm.__wbg_set_vector3_z(this.__wbg_ptr, arg0);
    }
    /**
    * @param {number} x
    * @param {number} y
    * @param {number} z
    * @returns {Vector3}
    */
    static new(x, y, z) {
        const ret = wasm.vector3_new(x, y, z);
        return Vector3.__wrap(ret);
    }
    /**
    * @param {Vector3} other
    * @returns {number}
    */
    distance_to(other) {
        _assertClass(other, Vector3);
        const ret = wasm.vector3_distance_to(this.__wbg_ptr, other.__wbg_ptr);
        return ret;
    }
    /**
    * @param {Vector3} other
    * @param {number} t
    * @returns {Vector3}
    */
    lerp(other, t) {
        _assertClass(other, Vector3);
        const ret = wasm.vector3_lerp(this.__wbg_ptr, other.__wbg_ptr, t);
        return Vector3.__wrap(ret);
    }
}

async function __wbg_load(module, imports) {
    if (typeof Response === 'function' && module instanceof Response) {
        if (typeof WebAssembly.instantiateStreaming === 'function') {
            try {
                return await WebAssembly.instantiateStreaming(module, imports);

            } catch (e) {
                if (module.headers.get('Content-Type') != 'application/wasm') {
                    console.warn("`WebAssembly.instantiateStreaming` failed because your server does not serve wasm with `application/wasm` MIME type. Falling back to `WebAssembly.instantiate` which is slower. Original error:\n", e);

                } else {
                    throw e;
                }
            }
        }

        const bytes = await module.arrayBuffer();
        return await WebAssembly.instantiate(bytes, imports);

    } else {
        const instance = await WebAssembly.instantiate(module, imports);

        if (instance instanceof WebAssembly.Instance) {
            return { instance, module };

        } else {
            return instance;
        }
    }
}

function __wbg_get_imports() {
    const imports = {};
    imports.wbg = {};
    imports.wbg.__wbg_vector3_unwrap = function(arg0) {
        const ret = Vector3.__unwrap(takeObject(arg0));
        return ret;
    };
    imports.wbg.__wbindgen_throw = function(arg0, arg1) {
        throw new Error(getStringFromWasm0(arg0, arg1));
    };

    return imports;
}

function __wbg_init_memory(imports, memory) {

}

function __wbg_finalize_init(instance, module) {
    wasm = instance.exports;
    __wbg_init.__wbindgen_wasm_module = module;
    cachedDataViewMemory0 = null;
    cachedUint8ArrayMemory0 = null;



    return wasm;
}

function initSync(module) {
    if (wasm !== undefined) return wasm;


    if (typeof module !== 'undefined' && Object.getPrototypeOf(module) === Object.prototype)
    ({module} = module)
    else
    console.warn('using deprecated parameters for `initSync()`; pass a single object instead')

    const imports = __wbg_get_imports();

    __wbg_init_memory(imports);

    if (!(module instanceof WebAssembly.Module)) {
        module = new WebAssembly.Module(module);
    }

    const instance = new WebAssembly.Instance(module, imports);

    return __wbg_finalize_init(instance, module);
}

async function __wbg_init(module_or_path) {
    if (wasm !== undefined) return wasm;


    if (typeof module_or_path !== 'undefined' && Object.getPrototypeOf(module_or_path) === Object.prototype)
    ({module_or_path} = module_or_path)
    else
    console.warn('using deprecated parameters for the initialization function; pass a single object instead')

    const imports = __wbg_get_imports();

    if (typeof module_or_path === 'string' || (typeof Request === 'function' && module_or_path instanceof Request) || (typeof URL === 'function' && module_or_path instanceof URL)) {
        module_or_path = fetch(module_or_path);
    }

    __wbg_init_memory(imports);

    const { instance, module } = await __wbg_load(await module_or_path, imports);

    return __wbg_finalize_init(instance, module);
}

export { initSync };
export default __wbg_init;
