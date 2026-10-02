import * as wgu from 'webgpu-utils'

type UniformArgs = {
  shader: string
  uniformName: string
}

export class Uniform {
  private readonly view: wgu.StructuredView
  public readonly buffer: GPUBuffer
  public readonly name: string

  constructor(
    private readonly device: GPUDevice,
    args: UniformArgs,
  ) {
    this.name = args.uniformName
    this.view = this.createView(args)
    this.buffer = this.createBuffer()
    this.writeBuffer()
  }

  private createView({ shader, uniformName }: UniformArgs) {
    const defs = wgu.makeShaderDataDefinitions(shader)
    return wgu.makeStructuredView(defs.uniforms[uniformName])
  }

  private createBuffer() {
    return this.device.createBuffer({
      size: this.view.arrayBuffer.byteLength,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    })
  }

  writeBuffer() {
    this.device.queue.writeBuffer(this.buffer, 0, this.view.arrayBuffer)
  }

  get views() {
    return this.view.views
  }

  set(property: string, value: any) {
    this.view.set({ [property]: value })
    return this
  }
}
