import { vec2, vec3 } from 'wgpu-matrix'
import { Camera, OrthographicCamera, PerspectiveCamera } from '../'
import type { Pointer } from './OrbitControls'

export class ZoomControl {
  public enable = true
  public scale = 1

  private radius: number
  private readonly distanceRange = { min: 0.1, max: 100 }

  constructor(
    private readonly camera: Camera,
    canvas: HTMLCanvasElement,
    abortController: AbortController,
  ) {
    this.radius = vec3.distance(camera.position.arrayBuffer, camera.target.arrayBuffer)
    this.addEvents(canvas, abortController)
  }

  handlePointerMove(pointers: Map<number, Pointer>) {
    // touchデバイスのみ
    if (!this.enable) return false

    const ptrs = [...pointers.values()]
    if (ptrs.length !== 2) return false
    if (ptrs[0].type !== 'touch') return false

    const p1 = ptrs[0]
    const p2 = ptrs[1]

    const v1 = vec2.sub(p1.position, p1.prevPosition)
    const v2 = vec2.sub(p2.position, p2.prevPosition)

    const prevDistance = vec2.distance(p1.prevPosition, p2.prevPosition)
    const currentDistance = vec2.distance(p1.position, p2.position)

    const n1 = vec2.normalize(v1)
    const n2 = vec2.normalize(v2)

    // 指の開きが同じ方向を向いている場合はズームとみなさない
    if (0 < vec2.dot(n1, n2)) return false

    const scale = Math.pow(0.95, this.scale * 0.3)

    if (this.camera instanceof PerspectiveCamera) {
      if (prevDistance < currentDistance) {
        // pinch out (expand)
        this.radius *= scale
      } else {
        // pinch in (shrink)
        this.radius /= scale
      }
    } else if (this.camera instanceof OrthographicCamera) {
      if (prevDistance < currentDistance) {
        // pinch out (expand)
        this.camera.zoom /= scale
      } else {
        // pinch in (shrink)
        this.camera.zoom *= scale
      }
      this.camera.updateProjectionMatrix()
    }
    this.radius = Math.max(this.distanceRange.min, Math.min(this.distanceRange.max, this.radius))

    return true
  }

  private addEvents(canvas: HTMLCanvasElement, abortController: AbortController) {
    canvas.addEventListener(
      'wheel',
      (e) => {
        e.preventDefault()

        if (!this.enable) return

        const scale = Math.pow(0.95, this.scale)

        if (this.camera instanceof PerspectiveCamera) {
          if (e.deltaY < 0) {
            this.radius *= scale
          } else {
            this.radius /= scale
          }
          this.radius = Math.max(this.distanceRange.min, Math.min(this.distanceRange.max, this.radius))
        } else if (this.camera instanceof OrthographicCamera) {
          if (e.deltaY < 0) {
            this.camera.zoom /= scale
          } else {
            this.camera.zoom *= scale
          }
          this.camera.updateProjectionMatrix()
        }
      },
      { signal: abortController.signal, passive: false },
    )
  }

  get distance() {
    if (this.enable && this.camera instanceof PerspectiveCamera) {
      return this.radius
    } else {
      return vec3.distance(this.camera.position.arrayBuffer, this.camera.target.arrayBuffer)
    }
  }
}
