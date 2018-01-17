import Base from './Base'
import ToolBox from './ToolBox'

const defaultCode = 'function sum (a, b) {\n  return a + b;\n}\n\nsum(1,2);'

class Editor extends Base {
  constructor (options = {}) {
    super()
    this.breakPointsDisabled = false
    this.app = options.app

    // Config ace editor
    this.aceEditor = ace.edit(options.container);
    this.aceEditor.session.setMode("ace/mode/javascript");
    this.aceEditor.setTheme("ace/theme/tomorrow");

    // Create ToolBox for this editor
    this.toolBox = new ToolBox({
      editor: this
    })

    this.restoreCode()
    this.listen()
  }

  toggleBreakPoint (row) {
    var breakPoints = this.aceEditor.session.getBreakpoints(),
        className = this.breakPointsDisabled ? 'ace_breakpoint disabled' : 'ace_breakpoint'
  
    if (breakPoints[row]) {
      this.aceEditor.session.clearBreakpoint(row);
      return false;
    }
    else {
      this.aceEditor.session.setBreakpoint(row, className);
      return true;
    }
  }

  listen () {
    // Add event listener for editor
    this.aceEditor.on('gutterclick', (e) => {
      var row = e.getDocumentPosition().row;

      this.toggleBreakPoint(row) 
        ? this.toolBox.addToBreakpointLines(row) 
        : this.toolBox.removeFromBreakpointLines(row);

      localStorage.setItem(
        'jsinspectorBreakpoints', 
        JSON.stringify(this.aceEditor.session.getBreakpoints()))
    });

    // Store changes into localStorage
    this.aceEditor.session.on('change', () => {
      localStorage.setItem('jsinspectorContent', this.aceEditor.getValue());
    });
  }

  restoreCode () {
    // Retrieve Code from localStorage, if any
    var content = localStorage.getItem('jsinspectorContent'),
        breakpoints = JSON.parse(localStorage.getItem('jsinspectorBreakpoints') || '[]')

    if (content) {
      this.aceEditor.setValue(content)
      breakpoints.forEach((breakpointClass, row) => {
        if (breakpointClass) {
          this.toggleBreakPoint(row)
          this.toolBox.addToBreakpointLines(row)
        }
      })
    }
    else {
      this.aceEditor.setValue(defaultCode)
      this.toggleBreakPoint(1)
      this.toolBox.addToBreakpointLines(1) 
    }
  }
}

module.exports = Editor;