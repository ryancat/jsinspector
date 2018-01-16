import Base from './Base'
import util from '../util'

class ToolBox extends Base {
  constructor (options = {}) {
    super()
    this.disableBreakpointElement = document.querySelector('.toolbarBreakpointBtn.toDisable')
    this.enableBreakpointElement = document.querySelector('.toolbarBreakpointBtn.toEnable')
    this.toolboxBreakpointLines = document.querySelector('.toolboxBreakpointLines')
    this.editor = options.editor
    
    this.listen()
  }

  listen () {
    this.disableBreakpointElement.addEventListener('click', () => {
      var editor = this.editor.aceEditor,
          breakPoints = editor.session.getBreakpoints()

      breakPoints.forEach((breakPointClass, row) => {
        editor.session.setBreakpoint(row, 'ace_breakpoint disabled')
      })
  
      this.editor.breakPointsDisabled = true
      this.toggleBreakpointBtn()
    })

    this.enableBreakpointElement.addEventListener('click', () => {
      var editor = this.editor.aceEditor,
          breakPoints = editor.session.getBreakpoints();

      breakPoints.forEach((breakPointClass, row) => {
        editor.session.setBreakpoint(row, 'ace_breakpoint')
      })
  
      this.editor.breakPointsDisabled = false
      this.toggleBreakpointBtn()
    })

    this.toolboxBreakpointLines.addEventListener('click', (e) => {
      var clickedBreakpointLineElement = util.closestElement(e.target, 'breakpointLine'),
          clickedBreakpointLineCloseIconElement = util.closestElement(e.target, 'breakpointLineClose'),
          editor = this.editor.aceEditor,
          clickedRow

      if (clickedBreakpointLineElement) {
        clickedRow = clickedBreakpointLineElement.dataset.row
        if (clickedBreakpointLineCloseIconElement) {
          editor.session.clearBreakpoint(clickedRow)
          this.removeFromBreakpointLines(clickedRow)
        }
        else {
          editor.renderer.scrollToRow(clickedRow)
        }
      }
    })
  }

  toggleBreakpointBtn () {
    if (this.editor.breakPointsDisabled) {
      this.disableBreakpointElement.style.display = 'none';
      this.enableBreakpointElement.style.display = 'block';
    }
    else {
      this.disableBreakpointElement.style.display = 'block';
      this.enableBreakpointElement.style.display = 'none';
    }
  }

  addToBreakpointLines (row) {
    var lineContent = this.editor.aceEditor.session.getLine(row),
        breakpointLineElement = document.createElement('li')

    breakpointLineElement.classList.add('breakpointLine')
    breakpointLineElement.classList.add('breakpointLine-' + row)
    breakpointLineElement.dataset.row = row
    breakpointLineElement.innerHTML = 
      '<div class="breakpointLineNumber">' + (row + 1) + '</div>'
      + '<div class="breakpointLineContent"><pre>' + lineContent + '</pre></div>'
      + '<div class="breakpointLineIcon breakpointLineClose"></div>'
    this.toolboxBreakpointLines.appendChild(breakpointLineElement)
  }

  removeFromBreakpointLines (row) {
    var lineElementToRemove = this.toolboxBreakpointLines.querySelector('.breakpointLine-' + row)
    this.toolboxBreakpointLines.removeChild(lineElementToRemove)
  }
}

module.exports = ToolBox