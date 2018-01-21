import Base from './Base'
import Editor from './Editor'
import Console from './Console'

// Performance test duration is about 3s
const PERF_DURATION = 3000

class App extends Base {
  constructor () {
    super()
    // this.editor = this.createEditor();
    this.editors = [new Editor({
      container: document.getElementById('editor'),
      app: this
    })]

    window.editors = this.editors

    this.console = new Console({
      app: this
    })

    this.inspectBtn = document.getElementById('inspectBtn')
    this.perfBtn = document.getElementById('perfBtn')

    this.listen()
  }

  listen () {
    this.inspectBtn.addEventListener('click', this.handleInspectClick.bind(this))
    this.perfBtn.addEventListener('click', this.handlePerfClick.bind(this))

    window.onbeforeunload = this.handlePageUnload.bind(this)
  }

  /**
   * Handle exit logic
   * 
   * - store current code in each editor
   */
  handlePageUnload () {
    this.editors.forEach((editor) => {
      // Only store contents within 10MB limit (for most browser)
      let content = editor.aceEditor.getValue()
      if (content.length * 2 < 10 * 1000000) {
        localStorage.setItem('jsinspectorContent-' + editor.filename, content);
      }
      else {
        editor.addError('File size exceed auto save limit')
      }

      // Store breakpoint positions
      localStorage.setItem(
        'jsinspectorBreakpoints-' + editor.filename, 
        JSON.stringify(editor.aceEditor.session.getBreakpoints()))
    })
  }

  handleInspectClick () {
    let evalContent

    // TODO: Avoid nested eval
    // TODO: Undo and Redo

    // hijack console.log
    let oldConsoleLog = console.log
    console.log = (...args) => {
      this.console.addLog(args)
      oldConsoleLog(args)
    }

    this.editors.forEach((editor) => {
      let lineContents = editor.aceEditor.getValue().split('\n')

      this.console.startNewLog()
      // Add breakpoints
      editor.aceEditor.session.getBreakpoints().forEach((breakPointClass, row) => {
        if (breakPointClass.indexOf('disabled') === -1) {
          lineContents[row] = 'debugger; /* Line ' + (row + 1) + ' */' + lineContents[row]
        }
      });

      evalContent = '// Start debug your javascript...\ndebugger;\n\n' + lineContents.join('\n')
      // It's ok to use eval as this will be a static page
      try {
        editor.addResult(eval(evalContent))
      } catch (e) {
        editor.addError(e.message)
      }
    })

    // Restore console.log
    console.log = oldConsoleLog
  }

  handlePerfClick () {
    let hasError = false,
        totalDuration = 0,
        singleDuration,
        runCount,
        runCountIter
    
    this.editors.forEach((editor) => {
      let content = editor.aceEditor.getValue()

      this.console.startNewLog()
      // Perf test will evalute run time by average
      try {
        singleDuration = window.performance.now()
        eval(content)
        singleDuration = window.performance.now() - singleDuration
      } catch (e) {
        this.console.addError(e.message)
        hasError = true
      }

      if (hasError) {
        this.console.addError(editor.filename, 'Error evaluating javascript code')
        return
      }

      runCount = Math.floor(PERF_DURATION / singleDuration)
      runCountIter = runCount

      while (runCountIter--) {
        singleDuration = window.performance.now()
        eval(content)
        singleDuration = window.performance.now() - singleDuration
        totalDuration += singleDuration
      }

      this.console.addResult(editor.filename, 'Average duration for ' + runCount + ' runs: ' + totalDuration / runCount + ' ms')
    })
  }
};

module.exports = App