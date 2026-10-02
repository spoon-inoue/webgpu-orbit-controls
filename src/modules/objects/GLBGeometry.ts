import { Mesh, type TypedArray } from '@gltf-transform/core'
import * as wgu from 'webgpu-utils'
import { Geometry } from '../geometry/Geometry'

export class GLBGeometry extends Geometry {
  public readonly positions: Float32Array<ArrayBufferLike>
  public readonly normals: Float32Array

  public readonly vertexBuffer: GPUBuffer
  public readonly vertexBufferLayout: GPUVertexBufferLayout
  public readonly indexFormat: GPUIndexFormat
  public readonly indexBuffer: GPUBuffer
  public readonly numVertices: number

  constructor(
    private readonly device: GPUDevice,
    private readonly mesh: Mesh,
  ) {
    super()

    this.positions = this.getAttribute<Float32Array>('POSITION')
    this.normals = this.getAttribute<Float32Array>('NORMAL')

    const data = this.createVertexData()
    this.vertexBuffer = data.buffers[0]
    this.vertexBufferLayout = data.bufferLayouts[0]
    this.indexBuffer = data.indexBuffer!
    this.indexFormat = data.indexFormat!
    this.numVertices = data.numElements

    this.calcAABB()
  }

  private getAttribute<T extends TypedArray>(semantic: string) {
    if (this.mesh.listPrimitives().length <= 0) throw Error('頂点データを取得できませんでした。')

    const attr = this.mesh.listPrimitives()[0].getAttribute(semantic)
    if (!attr) throw Error('頂点属性を取得できませんでした。')

    return attr.getArray() as T
  }

  private createVertexData() {
    if (this.mesh.listPrimitives().length <= 0) throw Error('頂点データを取得できませんでした。')

    const primitive = this.mesh.listPrimitives()[0]
    // const tex = primitive.getAttribute('TEXCOORD_0')
    const ind = primitive.getIndices()

    // if (!pos || !nor || !tex || !ind) throw Error('頂点属性を取得できませんでした。')
    if (!ind) throw Error('頂点属性を取得できませんでした。')

    return wgu.createBuffersAndAttributesFromArrays(this.device, {
      position: this.positions,
      normal: this.normals,
      // texcoord: tex.getArray(),
      indices: ind.getArray(),
    })
  }
}
