import { Node } from '@gltf-transform/core'
import type { Uniform } from '../core'
import { Quaternion } from '../core/Quaternion'
import { GLBGeometry } from './GLBGeometry'
import { Object3D } from './Object3D'

type GLBMeshArgs = {
  node: Node
  bindGroup: {
    bindGroups: GPUBindGroup[]
    offset?: number
  }
  pipeline: {
    shader: string
    bindGroupLayouts: GPUBindGroupLayout[]
    fragmentTargetFormat: GPUTextureFormat
    multisample?: GPUMultisampleState
    depthStencil?: Partial<GPUDepthStencilState>
  }
}

export class GLBMesh extends Object3D {
  public readonly geometry: GLBGeometry
  private readonly pipeline: GPURenderPipeline
  private readonly bindGroups: GPUBindGroup[]
  private readonly bindGroupOffset: number
  private readonly uniforms: { [key in string]: Uniform } = {}

  constructor(
    private readonly device: GPUDevice,
    args: GLBMeshArgs,
  ) {
    super()

    const node = args.node
    this.name = node.getName()

    const quat = new Quaternion(...node.getRotation())
    this.setTRS(node.getTranslation(), quat.getEuler('XYZ'), node.getScale())

    const mesh = this.getMesh(node)
    this.geometry = new GLBGeometry(device, mesh)
    this.pipeline = this.createPipeline(args)

    this.bindGroups = args.bindGroup.bindGroups
    this.bindGroupOffset = args.bindGroup.offset ?? 0
  }

  private getMesh(node: Node) {
    const mesh = node.getMesh()
    if (!mesh) throw Error('GLBNodeからMeshを取得できませんでした。')
    return mesh
  }

  private createPipeline(args: GLBMeshArgs) {
    const { shader, bindGroupLayouts, fragmentTargetFormat, multisample, depthStencil } = args.pipeline

    const module = this.device.createShaderModule({ code: shader })

    return this.device.createRenderPipeline({
      layout: this.device.createPipelineLayout({ bindGroupLayouts }),
      vertex: {
        module,
        buffers: [this.geometry.vertexBufferLayout],
      },
      fragment: {
        module,
        targets: [{ format: fragmentTargetFormat }],
      },
      multisample,
      depthStencil: depthStencil
        ? {
            depthWriteEnabled: true,
            depthCompare: 'less',
            format: 'depth24plus',
            ...depthStencil,
          }
        : undefined,
    })
  }

  setUniform(name: string, uniform: Uniform) {
    this.uniforms[name] = uniform
  }

  getUniform(name: string) {
    if (!Object.keys(this.uniforms).includes(name)) throw Error(`${name} Uniformが見つかりませんでした。`)
    return this.uniforms[name]
  }

  draw(pass: GPURenderPassEncoder) {
    pass.setPipeline(this.pipeline)
    pass.setVertexBuffer(0, this.geometry.vertexBuffer)
    pass.setIndexBuffer(this.geometry.indexBuffer!, this.geometry.indexFormat!)
    this.bindGroups.forEach((bindGroup, i) => pass.setBindGroup(i + this.bindGroupOffset, bindGroup))
    pass.drawIndexed(this.geometry.numVertices)
  }
}
