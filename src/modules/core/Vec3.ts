type N3 = [number, number, number]

export class Vec3 {
  static Add(a: Vec3, b: Vec3, target?: Vec3) {
    if (target) {
      return target.set(a.x + b.x, a.y + b.y, a.z + b.z)
    } else {
      return a.clone().add(b)
    }
  }

  static Sub(a: Vec3, b: Vec3, target?: Vec3) {
    if (target) {
      return target.set(a.x - b.x, a.y - b.y, a.z - b.z)
    } else {
      return a.clone().sub(b)
    }
  }

  static Mul(a: Vec3, b: Vec3, target?: Vec3) {
    if (target) {
      return target.set(a.x * b.x, a.y * b.y, a.z * b.z)
    } else {
      return a.clone().mul(b)
    }
  }

  static Div(a: Vec3, b: Vec3, target?: Vec3) {
    if (target) {
      if (b.x === 0 || b.y === 0 || b.z === 0) throw Error('division by zero')
      return target.set(a.x / b.x, a.y / b.y, a.z / b.z)
    } else {
      return a.clone().div(b)
    }
  }

  static fromArray(src: N3) {
    return new Vec3(src[0], src[1], src[2])
  }

  private readonly buffer: Float32Array

  constructor(
    public x = 0,
    public y = 0,
    public z = 0,
  ) {
    this.buffer = new Float32Array([x, y, z])
  }

  set(x: number, y: number, z: number) {
    this.x = x
    this.y = y
    this.z = z
    return this
  }

  get array(): N3 {
    return [this.x, this.y, this.z]
  }

  get arrayBuffer() {
    this.buffer.set([this.x, this.y, this.z])
    return this.buffer
  }

  get length() {
    return Math.hypot(this.x, this.y, this.z)
  }

  normalize() {
    const len = this.length
    if (0 < len) this.div(len)
    return this
  }

  clone() {
    return new Vec3(this.x, this.y, this.z)
  }

  copy(src: Vec3) {
    return this.set(src.x, src.y, src.z)
  }

  add(v: Vec3 | N3 | number) {
    if (Array.isArray(v)) {
      this.x += v[0]
      this.y += v[1]
      this.z += v[2]
    } else if (typeof v === 'number') {
      this.x += v
      this.y += v
      this.z += v
    } else {
      this.x += v.x
      this.y += v.y
      this.z += v.z
    }
    return this
  }

  sub(v: Vec3 | N3 | number) {
    if (Array.isArray(v)) {
      this.x -= v[0]
      this.y -= v[1]
      this.z -= v[2]
    } else if (typeof v === 'number') {
      this.x -= v
      this.y -= v
      this.z -= v
    } else {
      this.x -= v.x
      this.y -= v.y
      this.z -= v.z
    }
    return this
  }

  mul(v: Vec3 | N3 | number) {
    if (Array.isArray(v)) {
      this.x *= v[0]
      this.y *= v[1]
      this.z *= v[2]
    } else if (typeof v === 'number') {
      this.x *= v
      this.y *= v
      this.z *= v
    } else {
      this.x *= v.x
      this.y *= v.y
      this.z *= v.z
    }
    return this
  }

  div(v: Vec3 | N3 | number) {
    if (Array.isArray(v)) {
      if (v[0] === 0 || v[1] === 0 || v[2] === 0) throw Error('division by zero')
      this.x /= v[0]
      this.y /= v[1]
      this.z /= v[2]
    } else if (typeof v === 'number') {
      if (v === 0) throw Error('division by zero')
      this.x /= v
      this.y /= v
      this.z /= v
    } else {
      if (v.x === 0 || v.y === 0 || v.z === 0) throw Error('division by zero')
      this.x /= v.x
      this.y /= v.y
      this.z /= v.z
    }
    return this
  }
}
