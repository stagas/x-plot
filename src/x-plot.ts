import $ from 'sigl'

const MAX_ZOOM = 100_000

const style = /*css*/ `
:host {
  display: inline-flex;
  outline: none;
  user-select: none;
  touch-action: none;
}

:host([autoresize]) {
  width: 100%;
  height: 100%;
  overflow: hidden;
}

:host([autoresize]) canvas {
  width: 100% !important;
  height: 100% !important;
}`

export interface PlotElement extends $.Element<PlotElement> {}

/**
 * Plot.
 */
@$.element()
export class PlotElement extends HTMLElement {
  root = $.shadow(this, /*html*/ `<style>${style}</style><canvas></canvas>`)

  @$.attr() width = 200
  @$.attr() height = 60
  @$.attr() lineWidth = 1
  @$.attr() pixelRatio = window.devicePixelRatio
  @$.attr() background = '#235'
  @$.attr() color = '#4f4'
  /** Autoresize to fit parent element's size. */
  @$.attr() autoResize = false
  /** Zoom scale: `1`=no zoom. */
  @$.attr() zoom = 1
  /** Horizontal panning position. */
  @$.attr() offsetX = 0

  /** Array-like number data to plot, range `-1..+1`, `0`=center, `-1`=bottom, `+1`=top. */
  data?: ArrayLike<number>
  screen?: {
    canvas: HTMLCanvasElement
    ctx: CanvasRenderingContext2D
  }
  get?: (i: number) => number
  /** Pointer down state */
  pointerDown = false
  /** Pointer data */
  pointer = {
    id: -1,
    x: 0,
    y: 0,
  }
  onPointerMove?: $.EventHandler<Window, PointerEvent>
  onWheel?: $.EventHandler<PlotElement, WheelEvent>

  mounted($: this['$']) {
    $.effect(({ host }) => {
      if (host.tabIndex === -1) host.tabIndex = 0
    })

    $.screen = $.reduce(({ root }) => {
      const canvas = root.querySelector('canvas')!
      const ctx = canvas.getContext('2d', {
        alpha: false,
        desynchronized: true,
      })!
      return { canvas, ctx }
    })

    $.get = $.reduce(({ data }) => (i: number) => data[i | 0] ?? data[data.length - 1])

    $.effect(({ zoom }) => {
      $.zoom = Math.max(1, Math.min(MAX_ZOOM, zoom))
    })

    $.effect(({ screen: { canvas }, width, height, pixelRatio }) => {
      canvas.width = width * pixelRatio
      canvas.height = height * pixelRatio
      canvas.style.width = width + 'px'
      canvas.style.height = height + 'px'
    })

    $.effect(({ screen: { ctx }, lineWidth, pixelRatio, color }) => {
      ctx.lineWidth = lineWidth * pixelRatio
      ctx.lineJoin = 'round'
      ctx.strokeStyle = color
    })

    $.effect(
      ({ background, get, screen: { canvas, ctx }, width: w, height, pixelRatio: p, offsetX: ox, zoom, data }) => {
        ctx.fillStyle = background
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        ctx.fillStyle = 'rgba(0,0,0,0.3)'
        ctx.fillRect(0, canvas.height / 2, canvas.width, canvas.height / 2)

        // TODO: this routine def. can be improved
        ox /= 100
        w *= p
        height *= p

        const l = ctx.lineWidth
        const hl = l * 0.5
        const hw = w * 0.5 + hl
        const h = height - l

        const step = Math.max(
          0.00001,
          // * 2 because we need to move two periods
          (zoom * 2) / Math.max(1, data.length - 1)
        )
        if (!isFinite(step)) return
        const sx = 1 / w
        const cf = data.length / (w * zoom * 2)

        // panning
        const ds = cf * w * 2
        let i = ((data.length - ds) / cf) * ox

        let cx = 0
        let cy = 0
        let x = -1
        const calc = (y: number) => {
          cx = (x + 1) * hw - hl
          cy = (1 - (y + 1) * 0.5) * h + hl
        }
        calc(get(0)!)
        ctx.beginPath()
        ctx.moveTo(cx, cy)

        for (x = -1; x <= 1; x += sx) {
          calc(get(i++ * cf)!)
          ctx.lineTo(cx, cy)
        }
        calc(get(i++ * cf)!)
        ctx.lineTo(cx, cy)
        ctx.lineTo(cx, cy)
        ctx.stroke()
      }
    )

    $.onPointerMove = $.reduce(({ offsetX, pointer, zoom, pixelRatio }) => (e => {
      if (e.pointerId !== pointer.id) return

      const x = e.pageX
      const y = e.pageY

      $.mutate(() => {
        // panning
        $.offsetX = Math.min(100, Math.max(0, offsetX + (pointer.x - x) / zoom / pixelRatio))

        // zooming
        const d = pointer.y - y
        $.zoom = zoom - Math.min(50, zoom ** 1.5) * 0.015 * d

        $.pointer = { id: e.pointerId, x, y }
      })
    }))

    $.onWheel = $.reduce(({ zoom }) =>
      e => {
        $.zoom = zoom - Math.min(50, zoom ** 1.15) * 0.0006 * e.deltaY
      }
    )

    const onPointerDown = (e: PointerEvent) => {
      $.pointer = { id: e.pointerId, x: e.pageX, y: e.pageY }
      $.pointerDown = true
    }

    $.effect(({ pointerDown, onPointerMove }) => {
      if (!pointerDown) return
      return $.chain(
        $.on(window).pointermove.prevent.stop(onPointerMove),
        $.on(window).pointerup.once(() => {
          $.pointerDown = false
        })
      )
    })

    $.effect(({ host, onWheel }) =>
      $.chain(
        $.on(host).pointerdown(onPointerDown),
        // TODO: add prop zoomable ? zoomOnFocus or zoom.type = 'onfocus' | 'always' | 'never', zoom.amount ..
        $.on(host).wheel.not.passive(onWheel)
      )
    )
  }
}
