import type { DepthRenderTarget } from './DepthRenderTarget'
import type { MSAARenderTarget } from './MSAARenderTarget'

type RenderPassDescriptorArgs = {
  depth?: DepthRenderTarget
  msaa?: MSAARenderTarget
  colorAttachment: GPURenderPassColorAttachment
}

export class RenderPassAttachments {
  public readonly descriptor: GPURenderPassDescriptor
  public readonly depth?: DepthRenderTarget
  public readonly msaa?: MSAARenderTarget

  constructor(private readonly args: RenderPassDescriptorArgs) {
    this.depth = args?.depth
    this.msaa = args?.msaa

    this.descriptor = this.createRenderPassDecriptor()
  }

  private createRenderPassDecriptor(): GPURenderPassDescriptor {
    return {
      colorAttachments: [this.args.colorAttachment],
      depthStencilAttachment: this.depth?.depthStencilAttachment,
    }
  }

  setView(target: GPUTexture) {
    if (this.msaa) {
      this.msaa.update(target.width, target.height)
      this.descriptor.colorAttachments[0]!.view = this.msaa.texture.createView()
      this.descriptor.colorAttachments[0]!.resolveTarget = target.createView()
    } else {
      this.descriptor.colorAttachments[0]!.view = target.createView()
    }

    if (this.depth && this.descriptor.depthStencilAttachment) {
      this.depth.update(target.width, target.height)
      this.descriptor.depthStencilAttachment.view = this.depth.texture.createView()
    }

    return this
  }
}
