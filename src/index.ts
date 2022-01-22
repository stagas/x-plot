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
export interface HTMLPlotElement {
  /** Width of plot */
  width: number
  /** Height of plot */
  height: number
  /** The pixel ratio. Defaults to `window.devicePixelRatio` */
  pixelRatio: number
  /** Array-like number data to plot */
  data: number[]
  /** Zoom amount */
  zoom: number
  /** Autoresize */
  autoresize: boolean
  /** Line width */
  lineWidth: number
  /** Background color */
  background: string
  /** Stroke color */
  color: string
}

declare global {
  interface CSSStyleSheet {
    replaceSync(css: string): void
  }
  interface ShadowRoot {
    adoptedStyleSheets: readonly CSSStyleSheet[]
  }
}

const style = new CSSStyleSheet()
style.replaceSync(/*css*/ `
  :host([autoresize]) {
    display: inline-flex;
    width: 100%;
    height: 100%;
    overflow: hidden;
  }

  :host([autoresize]) canvas {
    width: 100% !important;
    height: 100% !important;
  }
`)

export class PlotElement extends HTMLElement {
  static get observedAttributes() {
    return [
      'width',
      'height',
      'background',
      'color',
      'zoom',
      'autoresize',
      'pixel-ratio',
      'line-width',
    ]
  }

  state: Partial<HTMLPlotElement> = {
    pixelRatio: window.devicePixelRatio,
    data: [] as number[],
    zoom: 1,
    autoresize: false,
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

    const root = this.attachShadow({ mode: 'open' })
    root.adoptedStyleSheets = [style]
    root.appendChild(this.canvas)
    this.addEventListener(
      'wheel',
      e => {
        const zoom = +this.state.zoom! - Math.min(50, this.state.zoom! ** 1.15) * 0.0006 * e.deltaY

        this.setAttribute('zoom', '' + zoom)
      },
      { passive: true }
    )
    this.addEventListener('wheel', e => e.preventDefault(), { passive: false })
  }

  set data(value: number[]) {
    this.state.data = value
    this.draw()
  }

  draw() {
    this.context.fillStyle = this.state.background!
    this.context.fillRect(0, 0, this.canvas.width, this.canvas.height)
    drawLine({ context: this.context, ...this.state })
  }

  attributeChangedCallback(name: string, _: string, value: string | number) {
    switch (name) {
      case 'width':
        this.canvas.width = +value * this.state.pixelRatio!
        this.canvas.style.width = value + 'px'
        break
      case 'height':
        this.canvas.height = +value * this.state.pixelRatio!
        this.canvas.style.height = value + 'px'
        break
      case 'zoom':
        if (!isFinite(+value)) return
        if (value < 1) value = 1
        if (value > MAX_ZOOM) value = MAX_ZOOM
      // eslint-disable-next-line no-fallthrough
      default: {
        // convert kebab-case attribute to camelCase for the props
        const prop = name.replace(/-[a-z]/g, s => s[1].toUpperCase())
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ;(this.state as any)[prop] = value
      }
    }
    this.draw()
  }
}

export default PlotElement
