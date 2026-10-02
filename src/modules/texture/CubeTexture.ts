import * as wgu from 'webgpu-utils'

type CubeTextureArgs = { filePath: string; fileNames: string[]; extension?: string }
type ResourceEntry = { bindGroupLayoutEntry: GPUBindGroupLayoutEntry; bindGroupEntry: GPUBindGroupEntry }

export class CubeTexture {
  static async load(device: GPUDevice, args: CubeTextureArgs) {
    const urls = args.fileNames.map((fileName) => args.filePath + fileName + (args.extension ?? ''))
    const texture = await wgu.createTextureFromImages(device, urls, { mips: true, flipY: false })
    return new CubeTexture(device, texture)
  }

  private readonly sampler: GPUSampler

  private constructor(
    device: GPUDevice,
    private readonly texture: GPUTexture,
  ) {
    this.sampler = device.createSampler({ magFilter: 'linear', minFilter: 'linear', mipmapFilter: 'linear' })
  }

  getResourceEntry({ textureBinding, samplerBinding }: { textureBinding: number; samplerBinding: number }) {
    const texture: ResourceEntry = {
      bindGroupLayoutEntry: {
        binding: textureBinding,
        visibility: GPUShaderStage.FRAGMENT,
        texture: { viewDimension: 'cube' },
      },
      bindGroupEntry: {
        binding: textureBinding,
        resource: this.texture.createView({ dimension: 'cube' }),
      },
    }

    const sampler: ResourceEntry = {
      bindGroupLayoutEntry: {
        binding: samplerBinding,
        visibility: GPUShaderStage.FRAGMENT,
        sampler: {},
      },
      bindGroupEntry: {
        binding: samplerBinding,
        resource: this.sampler,
      },
    }

    return { texture, sampler }
  }
}
