const EventEmitter = require('events').EventEmitter
const Tether = require('tether')

const util = require('../utils/index.js')

// HACK
Tether.modules.push({
  position: function(_arg) {
    if (this.options.onResize) this.options.onResize()
  }
})

class Guides extends EventEmitter {
  constructor () {
    super()
    this.state = {
      grid: false,
      center: false,
      thirds: false,
    
      width: 0,
      height: 0
    }
    
    this.el = null
    this.canvas = null
    this.context = null

    this.target = null
    this.tethered = null
  }

  setState (newState) {
    if (!util.isUndefined(newState.width) &&
        newState.width != this.state.width) {
      this.canvas.width = newState.width
    }
    if (!util.isUndefined(newState.height) &&
        newState.height != this.state.height) {
      this.canvas.height = newState.height
    }

    this.state = Object.assign(this.state, newState)

    this.render()
  }
  
  create (el) {
    this.el = el
    this.canvas = document.createElement('canvas')
    this.context = this.canvas.getContext('2d')
    this.el.appendChild(this.canvas)
  }

  attachTo (target) {
    this.target = target

    this.tethered = new Tether({
      element: this.el,
      target: this.target,
      attachment: 'top left',
      targetAttachment: 'top left',

      onResize: this.onTargetResize.bind(this)
    })
  }
  
  render () {
    let ctx = this.context
    ctx.clearRect(0, 0, this.state.width, this.state.height)

    if (this.state.grid)   this.drawGrid(this.context, this.state.width, this.state.height)
    if (this.state.center) this.drawCenter(this.context, this.state.width, this.state.height)
    if (this.state.thirds) this.drawThirds(this.context, this.state.width, this.state.height)
  }
  
  drawGrid (context, width, height) {
    let squareSize = 50
    let centerX = width / 2
    let stepsX = width / squareSize
    let stepsY = height / squareSize
    let offsetX = (width / 2) % squareSize
    let offsetY = (height / 2) % squareSize
    context.beginPath()
    context.strokeStyle = '#aaa'
    for (let n = 0; n < stepsX; n++) {
      let x = (n * squareSize) + offsetX
      context.moveTo(...[x, 0].map(Math.floor))
      context.lineTo(...[x, height].map(Math.floor))
      context.stroke()
    }
    for (let n = 0; n < stepsX; n++) {
      let y = (n * squareSize) + offsetY
      context.moveTo(...[0, y].map(Math.floor))
      context.lineTo(...[width, y].map(Math.floor))
      context.stroke()
    }
  }
  
  drawCenter (context, width, height) {
    let a0 = 0
    let b0 = Math.floor(height / 2)
    let a1 = width
    let b1 = b0
    context.beginPath()
    context.strokeStyle = '#f00'
    context.moveTo(a0, b0)
    context.lineTo(a1, b1)
    context.stroke()
  }
  
  drawThirds (context, width, height) {
    context.beginPath()
    context.strokeStyle = '#00f'
    
    let w0 = width / 3
    let h0 = height / 3

    for (let n = 0; n < 3; n++) {
      let x = n * w0
      let y = n * h0

      context.moveTo(...[x, 0].map(Math.floor))
      context.lineTo(...[x, height].map(Math.floor))
      context.stroke()

      context.moveTo(...[0, y].map(Math.floor))
      context.lineTo(...[width, y].map(Math.floor))
      context.stroke()
    }
  }
  
  onTargetResize () {
    let bounds = this.target.getBoundingClientRect()

    let width = bounds.right - bounds.left
    let height = bounds.bottom - bounds.top
    
    this.setState({ width, height })
  }
}

module.exports = Guides
