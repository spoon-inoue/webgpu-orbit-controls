export class CanvasRenderTarget {
  public readonly context: GPUCanvasContext
  public readonly format: GPUTextureFormat

  constructor(
    public readonly canvas: HTMLCanvasElement,
    config: GPUCanvasConfiguration,
  ) {
    this.context = this.getContext(config)
    this.format = config.format
  }

  private getContext(config: GPUCanvasConfiguration) {
    const context = this.canvas.getContext('webgpu')
    if (!context) throw Error('GPUCanvasContextの取得に失敗しました')

    context.configure(config)
    return context
  }

  get texture() {
    return this.context.getCurrentTexture()
  }

  get textureView() {
    return this.texture.createView()
  }

  get resolution() {
    return {
      width: this.canvas.width,
      height: this.canvas.height,
    }
  }

  get size() {
    return {
      width: this.canvas.clientWidth,
      height: this.canvas.clientHeight,
      aspect: this.canvas.clientWidth / this.canvas.clientHeight,
    }
  }

  resize(width: number, height: number) {
    this.canvas.width = width
    this.canvas.height = height
  }
}
