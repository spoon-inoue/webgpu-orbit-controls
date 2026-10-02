import { mat4 } from 'wgpu-matrix'
import { Camera } from './Camera'

type PerspectiveCameraArgs = {
  fov?: number
  aspect?: number
  near?: number
  far?: number
}

export class PerspectiveCamera extends Camera {
  public fov: number
  public aspect: number

  constructor(device: GPUDevice, args?: PerspectiveCameraArgs) {
    super(device, args)

    this.fov = args?.fov ?? 60
    this.aspect = args?.aspect ?? 1

    this.updateProjectionMatrix()
  }

  updateProjectionMatrix() {
    mat4.perspective(this.fov * (Math.PI / 180), this.aspect, this.near, this.far, this.projectionMatrix)
    mat4.inverse(this.projectionMatrix, this.projectionMatrixInverse)
    this.writeBuffer()
    return this
  }

  setAspect(aspect: number) {
    this.aspect = aspect
    return this
  }

  setFrustum(fov: number, aspect: number, near: number, far: number) {
    this.fov = fov
    this.aspect = aspect
    this.near = near
    this.far = far
    return this
  }
}
