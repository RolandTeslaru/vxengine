use wasm_bindgen::prelude::*;

#[wasm_bindgen]
#[derive(Clone, Copy, Debug)]
pub struct Vector3 {
    pub x: f32,
    pub y: f32,
    pub z: f32,
}

#[wasm_bindgen]
impl Vector3 {
    pub fn new(x: f32, y: f32, z: f32) -> Vector3 {
        Vector3 { x, y, z }
    }

    pub fn distance_to(&self, other: &Vector3) -> f32 {
        let dx = self.x - other.x;
        let dy = self.y - other.y;
        let dz = self.z - other.z;
        (dx * dx + dy * dy + dz * dz).sqrt()
    }

    pub fn lerp(&self, other: &Vector3, t: f32) -> Vector3 {
        Vector3 {
            x: self.x + (other.x - self.x) * t,
            y: self.y + (other.y - self.y) * t,
            z: self.z + (other.z - self.z) * t,
        }
    }
}

#[wasm_bindgen]
pub struct Spline {
    points: Vec<Vector3>,
    closed: bool,
    tension: f32,
}


#[wasm_bindgen]
impl Spline {
    #[wasm_bindgen(constructor)]
    pub fn new(points: Vec<Vector3>, closed: bool, tension: f32) -> Spline {
        Spline { points, closed, tension }
    }

    pub fn get_point(&self, t: f32) -> Vector3 {
        let l = self.points.len();
        let p = t * (l - if self.closed { 0 } else { 1 }) as f32;
        let mut int_point = p.floor() as usize;
        let weight = p - int_point as f32;

        let mut p0: &Vector3;
        let mut p3: &Vector3;

        if self.closed || int_point > 0 {
            p0 = &self.points[(int_point - 1) % l];
        } else {
            p0 = &self.points[0]; // Extrapolate the first point
        }

        let p1 = &self.points[int_point % l];
        let p2 = &self.points[(int_point + 1) % l];

        if self.closed || int_point + 2 < l {
            p3 = &self.points[(int_point + 2) % l];
        } else {
            p3 = &self.points[l - 1]; // Extrapolate the last point
        }

        // Apply Catmull-Rom interpolation
        let catmull_rom = |p0: f32, p1: f32, p2: f32, p3: f32, t: f32, tension: f32| -> f32 {
            let t2 = t * t;
            let t3 = t2 * t;

            let v0 = (p2 - p0) * tension;
            let v1 = (p3 - p1) * tension;

            (2.0 * p1 - 2.0 * p2 + v0 + v1) * t3 +
            (-3.0 * p1 + 3.0 * p2 - 2.0 * v0 - v1) * t2 +
            v0 * t +
            p1
        };

        Vector3 {
            x: catmull_rom(p0.x, p1.x, p2.x, p3.x, weight, self.tension),
            y: catmull_rom(p0.y, p1.y, p2.y, p3.y, weight, self.tension),
            z: catmull_rom(p0.z, p1.z, p2.z, p3.z, weight, self.tension),
        }
    }
}




// Expose these functions to JavaScript/TypeScript with #[wasm_bindgen] attribute
#[wasm_bindgen]
pub fn cubic_bezier(p0: f64, p1: f64, p2: f64, p3: f64, t: f64) -> f64 {
    let u = 1.0 - t;
    u * u * u * p0 + 3.0 * u * u * t * p1 + 3.0 * u * t * t * p2 + t * t * t * p3
}

#[wasm_bindgen]
pub fn cubic_bezier_derivative(p0: f64, p1: f64, p2: f64, p3: f64, t: f64) -> f64 {
    let u = 1.0 - t;
    3.0 * u * u * (p1 - p0) + 6.0 * u * t * (p2 - p1) + 3.0 * t * t * (p3 - p2)
}

#[wasm_bindgen]
pub fn solve_cubic_bezier_t(
    p0: f64, 
    p1: f64, 
    p2: f64, 
    p3: f64, 
    x: f64, 
    epsilon: f64, 
    max_iterations: i32
) -> f64 {
    let mut t = x; // Initial guess

    for _ in 0..max_iterations {
        let x_t = cubic_bezier(p0, p1, p2, p3, t); // Get x(t)
        let dx_dt = cubic_bezier_derivative(p0, p1, p2, p3, t); // Get dx/dt

        let error = x_t - x; // Compute error
        if error.abs() < epsilon {
            return t; // Sufficiently close, return t
        }

        if dx_dt == 0.0 {
            break; // Prevent division by zero
        }

        t -= error / dx_dt; // Update t using Newton-Raphson
    }

    t // Return final guess after iterations
}

#[wasm_bindgen]
pub fn interpolate_number(
    start_value: f64, 
    end_value: f64, 
    start_handle_x: f64, 
    start_handle_y: f64, 
    end_handle_x: f64, 
    end_handle_y: f64, 
    progress: f64
) -> f64 {
    let p0x = 0.0;
    let p0y = start_value;

    let p1x = start_handle_x;
    let p1y = start_value + start_handle_y * (end_value - start_value);

    let p2x = end_handle_x;
    let p2y = start_value + end_handle_y * (end_value - start_value);

    let p3x = 1.0;
    let p3y = end_value;

    // Check for linear interpolation and apply shortcut
    if start_handle_x == 0.3 && start_handle_y == 0.3 && end_handle_x == 0.7 && end_handle_y == 0.7 {
        return start_value + (end_value - start_value) * progress;
    }

    let t = solve_cubic_bezier_t(p0x, p1x, p2x, p3x, progress, 1e-6, 10);
    let interpolated_value = cubic_bezier(p0y, p1y, p2y, p3y, t);

    interpolated_value
}