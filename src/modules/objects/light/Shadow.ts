import type { Camera } from '../camera/Camera'

export type ShadowArgs = {
  camera: Camera
  resolution: [number, number]
  intensity?: number
}

export class Shadow {
  public readonly camera: Camera
  public readonly resolution: [number, number]
  public intensity: number
  public readonly texture: GPUTexture
  public readonly textureView: GPUTextureView
  public readonly bindGroupLayout: GPUBindGroupLayout
  public readonly bindGroup: GPUBindGroup

  constructor(
    private readonly device: GPUDevice,
    args: ShadowArgs,
  ) {
    this.camera = args.camera
    this.resolution = args.resolution
    this.intensity = args.intensity ?? 1
    this.texture = this.createTexture()
    this.textureView = this.texture.createView()
    this.bindGroupLayout = this.createBindGroupLayout()
    this.bindGroup = this.createBindGroup()
  }

  private createTexture() {
    return this.device.createTexture({
      size: [...this.resolution, 1],
      format: 'depth32float',
      usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING,
    })
  }

  private createBindGroupLayout() {
    return this.device.createBindGroupLayout({
      entries: [this.camera.getBindGroupLayoutEntry()],
    })
  }

  private createBindGroup() {
    return this.device.createBindGroup({
      layout: this.bindGroupLayout,
      entries: [{ binding: 0, resource: this.camera.buffer }],
    })
  }
}
