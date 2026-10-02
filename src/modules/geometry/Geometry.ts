type AABB = { x: { min: number; max: number }; y: { min: number; max: number }; z: { min: number; max: number } }

export abstract class Geometry {
  public abstract readonly positions: Float32Array
  public abstract readonly vertexBuffer: GPUBuffer
  public abstract readonly indexFormat: GPUIndexFormat
  public abstract readonly indexBuffer: GPUBuffer
  public abstract readonly numVertices: number
  public abstract readonly vertexBufferLayout: GPUVertexBufferLayout
  public boundingBox: AABB | null = null

  constructor() {}

  /**
   * calc Axis-Aligned Bounding Box
   * @returns
   */
  public calcAABB() {
    this.boundingBox = {
      x: { min: Number.MAX_SAFE_INTEGER, max: Number.MIN_SAFE_INTEGER },
      y: { min: Number.MAX_SAFE_INTEGER, max: Number.MIN_SAFE_INTEGER },
      z: { min: Number.MAX_SAFE_INTEGER, max: Number.MIN_SAFE_INTEGER },
    }

    for (let i = 0; i < this.positions.length / 3; i++) {
      const x = this.positions[i * 3 + 0]
      const y = this.positions[i * 3 + 1]
      const z = this.positions[i * 3 + 2]
      this.boundingBox.x.min = Math.min(this.boundingBox.x.min, x)
      this.boundingBox.x.max = Math.max(this.boundingBox.x.max, x)
      this.boundingBox.y.min = Math.min(this.boundingBox.y.min, y)
      this.boundingBox.y.max = Math.max(this.boundingBox.y.max, y)
      this.boundingBox.z.min = Math.min(this.boundingBox.z.min, z)
      this.boundingBox.z.max = Math.max(this.boundingBox.z.max, z)
    }

    return this.boundingBox
  }
}
