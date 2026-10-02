import { vec2, vec3, type Vec2 } from 'wgpu-matrix'
import type { Camera } from '../Camera'
import { PanControl } from './PanControl'
import { RotationControl } from './RotationControl'
import { ZoomControl } from './ZoomControl'

export type Pointer = {
  position: Vec2
  prevPosition: Vec2
  type: string
  button: number
}

export class OrbitControls {
  private readonly abortController = new AbortController()
  private readonly pointers = new Map<number, Pointer>()

  public readonly rotation: RotationControl
  public readonly zoom: ZoomControl
  public readonly pan: PanControl

  public updateAfterPointermove = false

  constructor(
    private readonly camera: Camera,
    private readonly canvas: HTMLCanvasElement,
  ) {
    this.rotation = new RotationControl(camera, canvas)
    this.zoom = new ZoomControl(camera, canvas, this.abortController)
    this.pan = new PanControl(camera, canvas)

    this.addEvents()
    this.update()
  }

  private addEvents() {
    this.canvas.style.setProperty('touch-action', 'none')

    this.canvas.addEventListener('contextmenu', (e) => {
      e.preventDefault()
    })

    this.canvas.addEventListener(
      'pointerdown',
      (e) => {
        this.canvas.setPointerCapture(e.pointerId)

        this.pointers.set(e.pointerId, {
          position: vec2.create(e.clientX, e.clientY),
          prevPosition: vec2.create(e.clientX, e.clientY),
          type: e.pointerType,
          button: e.button,
        })
      },
      { signal: this.abortController.signal },
    )

    this.canvas.addEventListener(
      'pointermove',
      (e) => {
        const pointer = this.pointers.get(e.pointerId)
        if (!pointer) return

        vec2.copy(pointer.position, pointer.prevPosition)
        pointer.position.set([e.clientX, e.clientY])

        this.rotation.handlePointerMove(this.pointers)
        const isZoom = this.zoom.handlePointerMove(this.pointers)
        this.pan.handlePointerMove(this.pointers, isZoom)

        this.updateAfterPointermove && this.update()
      },
      { signal: this.abortController.signal },
    )

    this.canvas.addEventListener(
      'pointerup',
      (e) => {
        this.pointers.delete(e.pointerId)
      },
      { signal: this.abortController.signal },
    )

    this.canvas.addEventListener(
      'pointerleave',
      (e) => {
        this.pointers.delete(e.pointerId)
      },
      { signal: this.abortController.signal },
    )
  }

  update(dt?: number) {
    // rotation
    const rotation = this.rotation.update(dt)
    // zoom
    const distance = this.zoom.distance
    // pan
    this.pan.update(distance, rotation)

    const offset = vec3.create(0, 0, distance)
    vec3.transformQuat(offset, rotation, offset)

    const position = vec3.add(this.camera.target.arrayBuffer, offset)

    this.camera.position.set(position[0], position[1], position[2])
    this.camera.updateViewMatrix()
  }

  dispose() {
    this.abortController.abort()
  }
}
