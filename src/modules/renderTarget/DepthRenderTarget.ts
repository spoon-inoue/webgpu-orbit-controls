import type { Optional } from '../common/types'

type TextureDescriptor = Optional<GPUTextureDescriptor, 'usage' | 'size'>

export class DepthRenderTarget {
  public texture: GPUTexture
  public readonly depthStencilAttachment: GPURenderPassDepthStencilAttachment
  public readonly format: GPUTextureFormat

  constructor(
    private readonly device: GPUDevice,
    private readonly descriptor: TextureDescriptor,
  ) {
    this.format = descriptor.format
    this.texture = this.createTexture()
    this.depthStencilAttachment = this.createDepthStencilAttachment()
  }

  private createTexture(size?: [number, number]) {
    return this.device.createTexture({
      ...this.descriptor,
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

  private createDepthStencilAttachment(): GPURenderPassDepthStencilAttachment {
    let stencil = {}
    if (this.format.match(/stencil8$/g)) {
      stencil = {
        stencilClearValue: 0,
        stencilLoadOp: 'clear',
        stencilStoreOp: 'store',
      }
    }

    return {
      view: null as any,
      depthClearValue: 1,
      depthLoadOp: 'clear',
      depthStoreOp: 'store',
      ...stencil,
    }
  }
}
