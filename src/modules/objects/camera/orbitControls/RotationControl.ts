import { quat, vec2 } from 'wgpu-matrix'
import type { Camera } from '../'
import type { Pointer } from './OrbitControls'

export class RotationControl {
  public enable = true
  public scale = 1
  public damping = 0.02

  private readonly EPS = 1e-5
  private readonly angle = { theta: { accum: 0, delta: 0 }, phi: { accum: 0, delta: 0 } }
  private readonly rotation: {
    current: Float32Array
    target: Float32Array
  }

  constructor(
    camera: Camera,
    private readonly canvas: HTMLCanvasElement,
  ) {
    this.calcInitAngle(camera)

    this.rotation = {
      current: quat.identity(),
      target: quat.identity(),
    }
  }

  private calcInitAngle(camera: Camera) {
    const offset = camera.position.clone().sub(camera.target)
    const radius = offset.length
    this.angle.theta.accum = Math.atan2(offset.x, offset.z)
    this.angle.phi.accum = Math.acos(offset.y / radius)
  }

  handlePointerMove(pointers: Map<number, Pointer>) {
    if (!this.enable) return false

    const ptrs = [...pointers.values()]

    if (ptrs.length !== 1) return false
    if (ptrs[0].type === 'mouse' && ptrs[0].button !== 0) return false

    const p = ptrs[0]

    const delta = vec2.sub(p.position, p.prevPosition)

    const c = (2 * Math.PI * this.scale) / this.canvas.clientHeight
    this.angle.theta.delta -= c * delta[0]
    this.angle.phi.delta -= c * delta[1]

    return true
  }

  update(dt?: number) {
    if (!this.enable) {
      const pitch = this.angle.phi.accum - Math.PI / 2
      quat.identity(this.rotation.target)
      quat.rotateY(this.rotation.target, this.angle.theta.accum, this.rotation.target)
      quat.rotateX(this.rotation.target, pitch, this.rotation.target)
      return this.rotation.target
    }

    this.angle.theta.accum += this.angle.theta.delta
    this.angle.phi.accum += this.angle.phi.delta
    this.angle.phi.accum = Math.max(this.EPS, Math.min(Math.PI - this.EPS, this.angle.phi.accum))
    const pitch = this.angle.phi.accum - Math.PI / 2

    this.angle.theta.delta = 0
    this.angle.phi.delta = 0

    quat.identity(this.rotation.target)
    quat.rotateY(this.rotation.target, this.angle.theta.accum, this.rotation.target)
    quat.rotateX(this.rotation.target, pitch, this.rotation.target)
    // targetRotation.x = r * sinφ * sinθ
    // targetRotation.y = r * cosφ
    // targetRotation.z = r * sinφ * cosθ

    if (dt) {
      const t = 1 - Math.exp(-this.damping * dt)
      quat.slerp(this.rotation.current, this.rotation.target, t, this.rotation.current)
    } else {
      quat.copy(this.rotation.target, this.rotation.current)
    }

    return this.rotation.current
  }
}
