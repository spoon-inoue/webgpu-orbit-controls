import { Uniform } from '@/modules/core/Uniform'
import { Vec3 } from '@/modules/core/Vec3'
import { mat4, type Mat4 } from 'wgpu-matrix'

const shader = `
struct Camera {
  projectionMatrix: mat4x4f,
  viewMatrix: mat4x4f,
}
@group(0) @binding(0) var<uniform> camera: Camera;
`

type CameraArgs = {
  near?: number
  far?: number
}

export abstract class Camera {
  public near: number
  public far: number
  public readonly position: Vec3
  public readonly target: Vec3
  public readonly up: Vec3

  protected readonly uniform: Uniform

  public readonly projectionMatrix: Mat4
  public readonly viewMatrix: Mat4

  public readonly projectionMatrixInverse: Mat4
  public readonly viewMatrixInverse: Mat4

  constructor(
    protected readonly device: GPUDevice,
    args?: CameraArgs,
  ) {
    this.near = args?.near ?? 0.1
    this.far = args?.far ?? 10

    this.uniform = new Uniform(device, { shader, uniformName: 'camera' })

    this.projectionMatrix = this.uniform.views.projectionMatrix
    this.viewMatrix = this.uniform.views.viewMatrix

    this.projectionMatrixInverse = mat4.identity()
    this.viewMatrixInverse = mat4.identity()

    this.position = new Vec3(0, 0, 1)
    this.target = new Vec3(0, 0, 0)
    this.up = new Vec3(0, 1, 0)

    this.updateViewMatrix()
  }

  getBindGroupLayoutEntry(entry?: Partial<GPUBindGroupLayoutEntry>): GPUBindGroupLayoutEntry {
    return {
      // default
      binding: 0,
      visibility: GPUShaderStage.VERTEX,
      buffer: { type: 'uniform', minBindingSize: this.buffer.size },
      // custom
      ...entry,
    }
  }

  get buffer() {
    return this.uniform.buffer
  }

  protected writeBuffer() {
    this.uniform.writeBuffer()
  }

  updateViewMatrix() {
    this.uniform.set('position', this.position.array)
    mat4.lookAt(this.position.array, this.target.array, this.up.array, this.viewMatrix)
    mat4.inverse(this.viewMatrix, this.viewMatrixInverse)
    this.writeBuffer()
    return this
  }

  public abstract updateProjectionMatrix(): this
}
