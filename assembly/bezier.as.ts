// bezier.as.ts

export function cubicBezier(
    p0: f64,
    p1: f64,
    p2: f64,
    p3: f64,
    t: f64
  ): f64 {
    const u = 1 - t;
    return (
      u * u * u * p0 +
      3 * u * u * t * p1 +
      3 * u * t * t * p2 +
      t * t * t * p3
    );
  }
  
  export function cubicBezierDerivative(
    p0: f64,
    p1: f64,
    p2: f64,
    p3: f64,
    t: f64
  ): f64 {
    const u = 1 - t;
    return (
      3 * u * u * (p1 - p0) +
      6 * u * t * (p2 - p1) +
      3 * t * t * (p3 - p2)
    );
  }
  
  export function solveCubicBezierT(
    p0: f64, 
    p1: f64,
    p2: f64, 
    p3: f64, 
    x: f64, 
    epsilon: f64 = 1e-6, 
    maxIterations: i32 = 10
  ): f64 {
    let t = x; // Initial guess
    // t = Math.max(0.0, Math.min(1.0, t)); // Ensure t is within [0, 1]
  
    // for (let i = 0; i < maxIterations; i++) {
    //   const x_t = cubicBezier(p0, p1, p2, p3, t); // Get x(t)
    //   const dx_dt = cubicBezierDerivative(p0, p1, p2, p3, t); // Get dx/dt
  
    //   const error = x_t - x; // Compute error
    //   if (Math.abs(error) < epsilon) {
    //     return t; // Sufficiently close, return t
    //   }
  
    //   if (dx_dt == 0) {
    //     break; // Prevent division by zero
    //   }
  
    //   t -= error / dx_dt; // Update t using Newton-Raphson
    // }
  
    return t; // Return final guess after iterations
  }