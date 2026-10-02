import type { Optional } from '../common/types'

type TextureDescriptor = Omit<Optional<GPUTextureDescriptor, 'usage' | 'size'>, 'sampleCount'>

export class MSAARenderTarget {
  public readonly sampleCount = 4
  public texture: GPUTexture

  constructor(
    private readonly device: GPUDevice,
    private readonly descriptor: TextureDescriptor,
  ) {
    this.texture = this.createTexture()
  }

  private createTexture(size?: [number, number]) {
    return this.device.createTexture({
      ...this.descriptor,
      sampleCount: this.sampleCount,
      size: size ?? this.descriptor.size ?? [1, 1],
      usage: this.descriptor.usage ?? GPUTextureUsage.RENDER_ATTACHMENT,
    })
  }

  update(width: number, height: number) {
    if (!this.texture || this.texture.width !== width || this.texture.height !== height) {
      this.texture?.destroy()
      this.texture = this.createTexture([width, height])
    }
    return this
  }
}
