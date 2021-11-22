import { Plot } from '../src'

customElements.define('x-plot', Plot)

container.innerHTML = `
  <x-plot width="200" height="60"></x-plot>
  <x-plot width="200" height="60" background="#f08" color="#ff0" zoom="4" line-width="3"></x-plot>
  <x-plot width="200" height="60" background="#066" color="yellow" zoom="20" line-width="6"></x-plot>
  <x-plot width="200" height="60" background="#000"></x-plot>
`

// const lw = 1.5
// container.innerHTML = `
//   <x-plot width="200" height="60" line-width="${lw}"></x-plot>
//   <x-plot width="200" height="60" line-width="${lw}"></x-plot>
//   <x-plot width="200" height="60" line-width="${lw}"></x-plot>
//   <x-plot width="200" height="60" line-width="${lw}"></x-plot>
// `

const plots = container.querySelectorAll('x-plot')
const rate = 44100
const sine = (i, hz) => Math.sin(hz * (i * (1 / rate)) * Math.PI * 2)

// setInterval(() => {
// plots[0].setAttribute('width', 200 * Math.random())
// plots[1].setAttribute('height', 200 * Math.random())
plots[0].data = Array(44100).fill(0).map((_, i) => sine(i, 1))
plots[1].data = Array(44100).fill(0).map((_, i) => sine(i, 10))
plots[2].data = Array(44100).fill(0).map((_, i) => sine(i, 100))
plots[3].data = [1, 0, -1, 0, 1, 0, -1]
// }, 1000)


// setInterval(() => {

  // plots[0].data = [-1]
  // plots[1].data = [0, 1]
  // plots[2].data = [0, 1, 0]
  // plots[3].data = [-.25, 1, -1, 1, -1, .5, -.5, 0]

  // }, 800)
