import { PlotElement } from '../src'
customElements.define('x-plot', PlotElement)

const plot = new PlotElement()
plot.id = 'demo'

document.body.appendChild(plot)

let n = 0
const sine = (i: number, hz: number) => Math.sin(hz * (i * (1 / 1000)) * Math.PI * 2)
const loop = () => {
  requestAnimationFrame(loop)
  plot.data = Array(1000).fill(0).map(_ => sine(++n, 4))
  n += 1000 / 4 / 60 // sampleRate/hz/frameRate to loop video capture every 1 second
}
loop()
