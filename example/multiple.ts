import { PlotElement } from '../src'
customElements.define('x-plot', PlotElement)

document.body.innerHTML = /*html*/ `
<div id="demo" style="display:inline-grid;grid:1fr 1fr/1fr 1fr;gap:5px;">
  <x-plot width="200" height="60"></x-plot>
  <x-plot width="200" height="60" background="#f08" color="#ff0" zoom="4" linewidth="3"></x-plot>
  <x-plot width="200" height="60" background="#066" color="yellow" zoom="20" linewidth="6"></x-plot>
  <x-plot width="200" height="60" background="#000"></x-plot>
</div>
`

const plots = document.querySelectorAll('x-plot') as NodeListOf<PlotElement>
const rate = 44100
const sine = (i: number, hz: number) => Math.sin(hz * (i * (1 / rate)) * Math.PI * 2)

plots[0].data = Array(44100).fill(0).map((_, i) => sine(i, 1))
plots[1].data = Array(44100).fill(0).map((_, i) => sine(i, 10))
plots[2].data = Array(44100).fill(0).map((_, i) => sine(i, 100))
plots[3].data = [1, 0, -1, 0, 1, 0, -1]
