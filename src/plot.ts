interface DrawLineParameters {
  context: CanvasRenderingContext2D
  width?: number
  height?: number
  pixelRatio?: number
  lineWidth?: number
  composite?: string
  dashes?: number[]
  zoom?: number
  color?: string
  data?: number[]
  fn?: (x: number) => number
}

export const drawLine = ({
  context: ctx,
  width: w = ctx.canvas.width,
  height = ctx.canvas.height,
  pixelRatio: p = window.devicePixelRatio,
  lineWidth = 1,
  zoom = 1,
  color = '#fff',
  data = [],
  fn = i => data[i | 0] ?? data[data.length - 1],
}: DrawLineParameters) => {
  ctx.save()
  ctx.lineWidth = lineWidth * p
  ctx.lineJoin = 'round'
  ctx.strokeStyle = color
  const k = lineWidth * p + p
  const hk = k * 0.5
  const hw = w * 0.5 + hk * 0.75
  const h = height - k
  // prettier-ignore
  const step = Math.max(0.00001, (
    zoom
  * 2 // we need to move two periods
  ) / Math.max(1, (data.length - 1)))
  if (!isFinite(step)) return
  const sx = 2 / (w * p)
  const cf = data.length / (w * p)
  let i = 0
  let cx = 0
  let cy = 0
  let x = -1 * zoom
  const calc = (y: number) => {
    cx = (x + 1) * hw - hk
    cy = (1 - (y + 1) * 0.5) * h + hk
  }
  calc(fn(0))
  ctx.beginPath()
  ctx.moveTo(cx, cy)

  for (x = -1; x <= 1; x += sx) {
    calc(fn((i++ * cf) / zoom))
    ctx.lineTo(cx, cy)
  }
  calc(fn(i++))
  ctx.lineTo(cx, cy)
  ctx.lineTo(cx, cy)
  ctx.stroke()
  ctx.restore()
}

// interface DrawXParameters {
//   context: CanvasRenderingContext2D
//   width?: number
//   height?: number
//   pixelRatio?: number
//   lineWidth?: number
//   dashes?: number[]
//   color?: string
// }

// export const drawX = ({
//   context: ctx,
//   width: w = ctx.canvas.width,
//   height: h = ctx.canvas.height,
//   pixelRatio = window.devicePixelRatio,
//   lineWidth = 1,
//   dashes = [2 * pixelRatio, 2 * pixelRatio],
//   color = '#fff',
// }: DrawXParameters) => {
//   ctx.save()

//   ctx.beginPath()
//   ctx.setLineDash(dashes)
//   ctx.lineWidth = lineWidth * pixelRatio
//   ctx.strokeStyle = color
//   ctx.moveTo(0, h / 2)
//   ctx.lineTo(w, h / 2)
//   ctx.stroke()

//   ctx.restore()
// }

// interface DrawYParameters {
//   context: CanvasRenderingContext2D
//   width?: number
//   height?: number
//   pixelRatio?: number
//   lineWidth?: number
//   dashes?: number[]
//   segments?: number
//   zoom?: number
//   colors?: string[]
// }

// export const drawY = ({
//   context: ctx,
//   width: w = ctx.canvas.width,
//   height: h = ctx.canvas.height,
//   pixelRatio = window.devicePixelRatio,
//   dashes = [2 * pixelRatio, 2 * pixelRatio],
//   segments = 4,
//   lineWidth = 1,
//   zoom = 1,
//   colors = ['#363636', '#282828', '#313131', '#282828'],
// }: DrawYParameters) => {
//   ctx.save()

//   ctx.setLineDash(dashes)
//   ctx.lineWidth = lineWidth * pixelRatio

//   let i = 0
//   let cx = 0

//   const step = (zoom * 2) / segments

//   let x = -1

//   const calc = () => {
//     cx = (x + 1) * 0.5 * w
//   }

//   for (x = -1 * zoom, i = 0; x <= 1; x += step) {
//     calc()
//     if (cx < 0) continue
//     if (cx > w) break

//     ctx.beginPath()
//     ctx.strokeStyle = colors[i++ % 4]
//     ctx.moveTo(cx, 0)
//     ctx.lineTo(cx, h)
//     ctx.stroke()
//   }

//   ctx.restore()
// }
