import { drawLine } from './plot'

const MAX_ZOOM = 100_000

/**
 * Plot settings.
 *
 * All values have to be set in the html attribute (or using `setAttribute`).
 *
 * Camel cased keys can be accessed with their kebab-case name,
 *  i.e lineWidth => line-width
 *
 * The `data` can only be set directly at the element instance
 * for example acquiring it through a `querySelector()`.
 */
export interface PlotState {
  /** The pixel ratio. Defaults to `window.devicePixelRatio` */
  pixelRatio: number
  /** Array-like number data to plot */
  data: number[]
  /** Zoom amount */
  zoom: number
  /** Line width */
  lineWidth: number
  /** Background color */
  background: string
  /** Stroke color */
  color: string
}

export class Plot extends HTMLElement {
  static get observedAttributes() {
    return [
      'width',
      'height',
      'background',
      'color',
      'zoom',
      'pixel-ratio',
      'line-width',
    ]
  }

  state: PlotState = {
    pixelRatio: window.devicePixelRatio,
    data: [] as number[],
    zoom: 1,
    lineWidth: 1,
    background: '#235',
    color: '#4f4',
  }

  canvas: HTMLCanvasElement = document.createElement('canvas')
  context: CanvasRenderingContext2D = this.canvas.getContext('2d', {
    alpha: false,
    desynchronized: true,
  })!

  constructor() {
    super()

    this.attachShadow({ mode: 'open' })
    this.shadowRoot!.appendChild(this.canvas)
    this.addEventListener(
      'wheel',
      e => {
        const zoom =
          +this.state.zoom -
          Math.min(50, this.state.zoom ** 1.15) * 0.0006 * e.deltaY

        this.setAttribute('zoom', '' + zoom)
      },
      { passive: true }
    )
  }

  set data(value: number[]) {
    this.state.data = value
    this.draw()
  }

  draw() {
    this.context.fillStyle = this.state.background
    this.context.fillRect(0, 0, this.canvas.width, this.canvas.height)
    drawLine({ context: this.context, ...this.state })
  }

  attributeChangedCallback(name: string, _: string, value: string | number) {
    switch (name) {
      case 'width':
        this.canvas.width = +value * this.state.pixelRatio
        this.canvas.style.width = value + 'px'
        break
      case 'height':
        this.canvas.height = +value * this.state.pixelRatio
        this.canvas.style.height = value + 'px'
        break
      case 'zoom':
        if (!isFinite(+value)) return
        if (value < 1) value = 1
        if (value > MAX_ZOOM) value = MAX_ZOOM
      default:
        // convert kebab-case attribute to camelCase for the props
        const prop = name.replace(/-[a-z]/g, s => s[1].toUpperCase())
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ;(this.state as any)[prop] = value
    }
    this.draw()
  }
}

export default Plot
