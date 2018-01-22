import Base from './Base'
import ToolBox from './ToolBox'

const defaultCode = 'function sum (a, b) {\n  return a + b;\n}\n\nsum(1,2);'
const ALL_EDITOR_ID = '-1'

let _count = 0;

class Editor extends Base {
  constructor (options = {}) {
    super()
    _count++

    this.breakPointsDisabled = false
    this.app = options.app
    this.filename = options.filename || 'File ' + _count
    this.id = _count.toString()
    this.element = options.container

    // Config ace editor
    this.aceEditor = ace.edit(this.element);
    this.aceEditor.session.setMode("ace/mode/javascript");
    this.aceEditor.setTheme("ace/theme/tomorrow");
    this.aceEditor.$blockScrolling = Infinity
    this.listen()
    
    // Create ToolBox for this editor
    this.toolBox = new ToolBox({
      editor: this
    })

    this.restoreCode()
    
    // Attach editors
    this.fire('editor.init', this)
  }

  static get ALL_EDITOR_ID () {
    return ALL_EDITOR_ID
  }

  toggleBreakPoint (row) {
    let breakPoints = this.aceEditor.session.getBreakpoints()
    breakPoints[row] ? this.clearBreakpoint(row) : this.setBreakpoint(row)
  }

  listen () {
    // Add event listener for editor
    this.aceEditor.on('gutterclick', this.handleGutterclick.bind(this));
    this.aceEditor.session.on('change', this.handleEditorChange.bind(this));
  }

  addLog (...arg) {
    this.app.console.addLog(this, arg)
  }

  addError (...arg) {
    this.app.console.addError(this, arg)
  }

  addResult (...arg) {
    this.app.console.addResult(this, arg)
  }

  handleGutterclick (e) {
    let row = e.getDocumentPosition().row

    this.toggleBreakPoint(row) 
  }

  handleEditorChange (e) {
    this.refreshBreakpoints()
  }

  /**
   * Will remove unnecessary breakpoints
   */
  refreshBreakpoints () {
    let aceEditor = this.aceEditor,
        breakPoints = aceEditor.session.getBreakpoints(),
        currentRows = aceEditor.session.getLength(),
        toBeCleard = []

    breakPoints.forEach((breakpointClass, row) => {
      if (row >= currentRows) {
        toBeCleard.push(row)
      }
    })

    toBeCleard.forEach(row => this.clearBreakpoint(row))
  }

  clearBreakpoint (row) {
    this.aceEditor.session.clearBreakpoint(row)
    this.toolBox.removeFromBreakpointLines(row)
  }

  setBreakpoint (row) {
    let className = this.breakPointsDisabled ? 'ace_breakpoint disabled' : 'ace_breakpoint'
    this.aceEditor.session.setBreakpoint(row, className);
    this.toolBox.addToBreakpointLines(row) 
  }

  restoreCode () {
    // Retrieve Code from localStorage, if any
    let content = localStorage.getItem('jsinspectorContent-' + this.filename),
        breakpoints = JSON.parse(localStorage.getItem('jsinspectorBreakpoints-' + this.filename) || '[]')

    if (content) {
      this.aceEditor.setValue(content)
      breakpoints.forEach((breakpointClass, row) => {
        if (breakpointClass && row < this.aceEditor.session.getLength()) {
          this.setBreakpoint(row)
        }
      })
    }
    else {
      this.aceEditor.setValue(defaultCode)
      this.setBreakpoint(1)
    }
  }

  show () {
    this.element.style.display = 'block'
  }

  hide () {
    this.element.style.display = 'none'
  }
}

module.exports = Editor;