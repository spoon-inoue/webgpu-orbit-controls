struct FSIn {
  @builtin(position) position: vec4f,
  @location(0) uv: vec2f,
}

struct Camera {
  projectionMatrixInverse: mat4x4f,
  viewMatrixInverse: mat4x4f,
  normalMatrix: mat3x3f,
  far: f32,
}

struct Uniforms {
  resolution: vec2f,
  time: f32,
  step: u32,
}

@group(0) @binding(0) var<uniform> cam: Camera;
@group(1) @binding(0) var<uniform> uni: Uniforms;

@fragment 
fn fs(in: FSIn) -> @location(0) vec4f {
  let ndc = in.uv * 2 - 1;
  // near
  let nearNdc = vec4f(ndc, 0, 1);
  let nearView = cam.projectionMatrixInverse * nearNdc;
  let nearWorld = cam.viewMatrixInverse * vec4f(nearView.xyz / nearView.w, 1);
  // far
  let farNdc = vec4f(ndc, 1, 1);
  let farView = cam.projectionMatrixInverse * farNdc;
  let farWorld = cam.viewMatrixInverse * vec4f(farView.xyz / farView.w, 1);
  // ro, ray
  let ro = nearWorld.xyz;
  let ray = normalize(farWorld.xyz - nearWorld.xyz);

  var t = 0.;
  let far = cam.far;

  for (var i = 0; i < 64; i++) {
    let p = ro + t * ray;
    let d = map(p);
    if (abs(d) < 1e-3 || far < t) { break; }
    t += d;
  }

  var col = vec3f(0);

  if (t < far) {
    let p = ro + t * ray;
    let normal = calcNormal(p);
    col = normalize(cam.normalMatrix * normal);
  }

  return vec4f(col, 1);
}

// ============================

fn map(p: vec3f) -> f32 {
  let r = 0.0;
  return sdBox(p, vec3f(0.25 - r)) - r;
}

fn sdBox(p: vec3f, b: vec3f) -> f32 {
  let q = abs(p) - b;
  return length(max(q, vec3f(0))) + min(max(q.x, max(q.y, q.z)), 0);
}

fn calcNormal(p: vec3f) -> vec3f {
  const h = 1e-5;
  const k = vec2f(1, -1) * h;
  return normalize(
    k.xyy * map(p + k.xyy) +
    k.yyx * map(p + k.yyx) +
    k.yxy * map(p + k.yxy) +
    k.xxx * map(p + k.xxx)
  );
}