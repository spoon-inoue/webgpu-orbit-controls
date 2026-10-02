import { Uniform } from '@/modules/core/Uniform'
import { Vec3 } from '@/modules/core/Vec3'
import { Light } from './Light'

const shader = `
struct Light {
  direction: vec3f,
  intensity: f32,
}
@group(0) @binding(0) var<uniform> light: Light;
`

type DirectionalLightArgs = {
  position: [number, number, number]
  target?: [number, number, number]
  intensity?: number
}

export class DirectionalLight extends Light {
  public readonly direction: Vec3
  private readonly uniform: Uniform

  constructor(device: GPUDevice, args: DirectionalLightArgs) {
    super(device, Vec3.fromArray(args.position), Vec3.fromArray(args.target ?? [0, 0, 0]), args.intensity ?? 1)

    this.direction = Vec3.Sub(this.target, this.position).normalize()

    this.uniform = new Uniform(device, { shader, uniformName: 'light' })
    this.update()
  }

  get buffer() {
    return this.uniform.buffer
  }

  update() {
    Vec3.Sub(this.target, this.position, this.direction).normalize()
    this.uniform.set('direction', this.direction.array)
    this.uniform.set('intensity', this.intensity)
    this.uniform.writeBuffer()
    return this
  }

  getBindGroupLayoutEntry(entry?: Partial<GPUBindGroupLayoutEntry>): GPUBindGroupLayoutEntry {
    return {
      // default
      binding: 0,
      visibility: GPUShaderStage.FRAGMENT,
      buffer: { type: 'uniform', minBindingSize: this.buffer.size },
      // custom
      ...entry,
    }
  }
}
