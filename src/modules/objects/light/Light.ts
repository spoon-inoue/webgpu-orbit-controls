import type { Vec3 } from '@/modules/core/Vec3'
import { Shadow, type ShadowArgs } from './Shadow'

export abstract class Light {
  public shadow?: Shadow

  constructor(
    protected readonly device: GPUDevice,
    public readonly position: Vec3,
    public readonly target: Vec3,
    public intensity: number,
  ) {}

  castShadow(shadowArgs: ShadowArgs) {
    shadowArgs.camera.position.copy(this.position)
    shadowArgs.camera.target.copy(this.target)
    shadowArgs.camera.updateViewMatrix()

    shadowArgs.intensity = this.intensity

    this.shadow = new Shadow(this.device, shadowArgs)
    return this
  }
}
