import { vec2, vec3 } from 'wgpu-matrix'
import { Camera, OrthographicCamera, PerspectiveCamera } from '../'
import type { Pointer } from './OrbitControls'

export class PanControl {
  public enable = true
  public scale: number

  private readonly pan = { x: 0, y: 0 }

  constructor(
    private readonly camera: Camera,
    private readonly canvas: HTMLCanvasElement,
  ) {
    this.scale = camera instanceof PerspectiveCamera ? 0.2 : 1
  }

  handlePointerMove(pointers: Map<number, Pointer>, isZoom: boolean) {
    if (!this.enable) return false
    if (isZoom) return false

    const ptrs = [...pointers.values()]
    if (ptrs[0].type === 'touch' && ptrs.length !== 2) return false
    if (ptrs[0].type === 'mouse' && ptrs[0].button !== 2) return false

    const p = ptrs[0]
    const delta = vec2.sub(p.position, p.prevPosition)
    this.pan.x += delta[0]
    this.pan.y += delta[1]
  }

  update(distance: number, rotation: Float32Array) {
    if (!this.enable) return
    if (this.pan.x === 0 && this.pan.y === 0) return

    let panX: number | null = null
    let panY: number | null = null
    if (this.camera instanceof PerspectiveCamera) {
      const worldHeight = distance * 2 * Math.tan(this.camera.fov * 0.5)
      const c = (worldHeight / this.canvas.clientHeight) * this.scale
      panX = c * this.pan.x
      panY = c * this.pan.y
    } else if (this.camera instanceof OrthographicCamera) {
      const width = (this.camera.right - this.camera.left) / this.camera.zoom
      const height = (this.camera.top - this.camera.bottom) / this.camera.zoom
      panX = ((this.pan.x * width) / this.canvas.clientWidth) * this.scale
      panY = ((this.pan.y * height) / this.canvas.clientHeight) * this.scale
    }

    if (panX === null || panY === null) return

    const right = vec3.create(1, 0, 0)
    const up = vec3.create(0, 1, 0)

    vec3.transformQuat(right, rotation, right)
    vec3.transformQuat(up, rotation, up)

    vec3.mulScalar(right, -panX, right)
    vec3.mulScalar(up, panY, up)

    const offset = vec3.add(right, up)

    this.camera.target.add([offset[0], offset[1], offset[2]])

    this.pan.x = 0
    this.pan.y = 0
  }
}
