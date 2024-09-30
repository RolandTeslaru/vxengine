// The entry file of your WebAssembly module.

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
  epsilon: f64,
  maxIterations: i32,
): f64 {
  let t = x; // Initial guess

  for (let i = 0; i < maxIterations; i++) {
    const x_t = cubicBezier(p0, p1, p2, p3, t); // Get x(t)
    const dx_dt = cubicBezierDerivative(p0, p1, p2, p3, t); // Get dx/dt

    const error = x_t - x; // Compute error
    if (Math.abs(error) < epsilon) {
      return t; // Sufficiently close, return t
    }

    if (dx_dt == 0) {
      break; // Prevent division by zero
    }

    t -= error / dx_dt; // Update t using Newton-Raphson
  }

  return t; // Return final guess after iterations
}

export function interpolateNumber(
  startValue: f64, 
  endValue: f64,
  startHandleX: f64, 
  startHandleY: f64, 
  endHandleX: f64, 
  endHandleY: f64,
  progress: f64
): f64 {

  const p0x = 0;
  const p0y = startValue;

  const p1x = startHandleX;
  const p1y = startValue + startHandleY * (endValue - startValue);

  const p2x = endHandleX;
  const p2y = startValue + endHandleY * (endValue - startValue);

  const p3x = 1;
  const p3y = endValue;

  // Check for linear interpolation and apply shortcut

  if(startHandleX == 0.3 && startHandleY == 0.3 && endHandleX == 0.7 && endHandleY == 0.7) {
    return startValue + (endValue - startValue) * progress;
  }
  
  const t = solveCubicBezierT(p0x, p1x, p2x, p3x,  progress, 1e-6, 10);
  const interpolatedValue = cubicBezier(p0y, p1y, p2y, p3y, t);

  return interpolatedValue;
}