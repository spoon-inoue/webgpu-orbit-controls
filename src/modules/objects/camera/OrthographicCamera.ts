import { mat4 } from 'wgpu-matrix'
import { Camera } from './Camera'

type OrthographicCameraArgs = {
  left?: number
  right?: number
  bottom?: number
  top?: number
  near?: number
  far?: number
}

export class OrthographicCamera extends Camera {
  public left: number
  public right: number
  public bottom: number
  public top: number
  public zoom = 1

  constructor(device: GPUDevice, args?: OrthographicCameraArgs) {
    super(device, args)

    this.left = args?.left ?? -1
    this.right = args?.right ?? 1
    this.bottom = args?.bottom ?? -1
    this.top = args?.top ?? 1

    this.updateProjectionMatrix()
  }

  updateProjectionMatrix() {
    const l = this.left / this.zoom
    const r = this.right / this.zoom
    const b = this.bottom / this.zoom
    const t = this.top / this.zoom

    mat4.ortho(l, r, b, t, this.near, this.far, this.projectionMatrix)
    mat4.inverse(this.projectionMatrix, this.projectionMatrixInverse)
    this.writeBuffer()
    return this
  }

  setRect(left: number, right: number, bottom: number, top: number) {
    this.left = left
    this.right = right
    this.bottom = bottom
    this.top = top
    return this
  }

  setFrustum(left: number, right: number, bottom: number, top: number, near: number, far: number) {
    this.setRect(left, right, bottom, top)
    this.near = near
    this.far = far
    return this
  }
}
