import { mat3 } from 'wgpu-matrix'
import { createResizeObserver } from './modules/common/resize'
import { Uniform } from './modules/core'
import { GPU } from './modules/core/GPU'
import { Camera, OrbitControls, OrthographicCamera, PerspectiveCamera } from './modules/objects/camera'
import { CanvasRenderTarget, RenderPassAttachments } from './modules/renderTarget'
import * as shader from './shader'
import GUI from 'lil-gui'

const gpu = await GPU.request()
const device = gpu.device

// ===========================================
// render target
// ===========================================
const canvas = document.querySelector<HTMLCanvasElement>('canvas')!
const renderTarget = new CanvasRenderTarget(canvas, { device, format: gpu.presentationFormat, alphaMode: 'premultiplied' })
const attachments = new RenderPassAttachments({
  colorAttachment: { view: null as any, loadOp: 'clear', storeOp: 'store' },
})

// ===========================================
// scene
// ===========================================
const persCamera = new PerspectiveCamera(device, { aspect: renderTarget.size.aspect, fov: 40, near: 0.1, far: 100 })
const orthCamera = new OrthographicCamera(device, { near: 0.1, far: 100 })

function craeteCameraInfo<T extends Camera>(camera: T) {
  camera.position.set(2, 2, 2)
  camera.target.set(0, 0, 0)
  camera.updateViewMatrix()

  const uniform = new Uniform(device, { shader: shader.fragment, uniformName: 'cam' })
  uniform.set('far', camera.far)

  const bindGroupLayout = device.createBindGroupLayout({
    entries: [{ binding: 0, visibility: GPUShaderStage.FRAGMENT, buffer: { type: 'uniform', minBindingSize: uniform.buffer.size } }],
  })

  const bindGroup = device.createBindGroup({
    layout: bindGroupLayout,
    entries: [{ binding: 0, resource: uniform.buffer }],
  })

  const controls = new OrbitControls(camera, canvas)

  return { camera, uniform, bindGroupLayout, bindGroup, controls }
}

const cameraInfo = {
  perspective: craeteCameraInfo(persCamera),
  orthographic: craeteCameraInfo(orthCamera),
}

function updateProjectionMatrix() {
  const camera = cameraInfo[settings.camera].camera
  if (camera instanceof PerspectiveCamera) {
    camera.setAspect(canvas.width / canvas.height).updateProjectionMatrix()
  } else {
    const h = 2
    const w = h * (canvas.width / canvas.height)
    camera.setRect(-w, w, -h, h).updateProjectionMatrix()
  }
}

// ===========================================
// mesh
// ===========================================
const uniform = new Uniform(device, { shader: shader.fragment, uniformName: 'uni' })

const bindGroupLayout = device.createBindGroupLayout({
  entries: [{ binding: 0, visibility: GPUShaderStage.FRAGMENT, buffer: { type: 'uniform', minBindingSize: uniform.buffer.size } }],
})

const bindGroup = device.createBindGroup({
  layout: bindGroupLayout,
  entries: [{ binding: 0, resource: uniform.buffer }],
})

const pipeline = device.createRenderPipeline({
  layout: device.createPipelineLayout({ bindGroupLayouts: [cameraInfo.perspective.bindGroupLayout, bindGroupLayout] }),
  vertex: {
    module: device.createShaderModule({ code: shader.vertex }),
  },
  fragment: {
    module: device.createShaderModule({ code: shader.fragment }),
    targets: [{ format: gpu.presentationFormat }],
  },
})

// ===========================================
// gui
// ===========================================
const settings: { camera: keyof typeof cameraInfo } = { camera: 'perspective' }

const gui = new GUI()
gui.add(settings, 'camera', Object.keys(cameraInfo)).onChange(() => {
  updateProjectionMatrix()
  cameraInfo[settings.camera].controls.update()
})

// ===========================================
// render
// ===========================================
let prev = performance.now()

function render() {
  // update camera
  const current = performance.now()
  const dt = current - prev
  prev = current

  const cam = cameraInfo[settings.camera]
  cam.controls.update(dt)

  cam.uniform.set('projectionMatrixInverse', cam.camera.projectionMatrixInverse)
  cam.uniform.set('viewMatrixInverse', cam.camera.viewMatrixInverse)
  cam.uniform.set('normalMatrix', mat3.fromMat4(cam.camera.viewMatrix))
  cam.uniform.writeBuffer()

  // draw
  attachments.setView(renderTarget.texture)

  const encoder = device.createCommandEncoder()

  const pass = encoder.beginRenderPass(attachments.descriptor)
  pass.setPipeline(pipeline)
  pass.setBindGroup(0, cam.bindGroup)
  pass.setBindGroup(1, bindGroup)
  pass.draw(3)
  pass.end()

  device.queue.submit([encoder.finish()])

  requestAnimationFrame(render)
}

render()

createResizeObserver(device, (size) => {
  renderTarget.resize(size.resolution.width, size.resolution.height)
  updateProjectionMatrix()
}).observe(canvas)
