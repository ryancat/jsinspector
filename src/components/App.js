import Base from './Base'
import Editor from './Editor'
import Console from './Console'

// Performance test duration is about 3s
const PERF_DURATION = 3000

class App extends Base {
  constructor () {
    super()
    // this.editor = this.createEditor();
    this.editor = new Editor({
      container: document.getElementById('editor'),
      app: this
    })

    this.console = new Console({
      editor: this.editor
    })

    this.inspectBtn = document.getElementById('inspectBtn')
    this.perfBtn = document.getElementById('perfBtn')

    // Config inspect behavior. 
    // This will trigger browser inspector.
    // let inspectBtn = document.getElementById('inspectBtn');
    
    this.listen()
  }

  listen () {
    this.inspectBtn.addEventListener('click', () => {
      let editor = this.editor.aceEditor,
          lineContents = editor.getValue().split('\n'),
          evalContent

      // TODO: Avoid nested eval
      // TODO: Undo and Redo

      this.console.startNewLog()

      // Add breakpoints
      editor.session.getBreakpoints().forEach((breakPointClass, row) => {
        if (breakPointClass.indexOf('disabled') === -1) {
          lineContents[row] = 'debugger; /* Line ' + (row + 1) + ' */' + lineContents[row]
        }
      });

      evalContent = '// Start debug your javascript...\ndebugger;\n\n' + lineContents.join('\n')

      // hijack console.log
      let oldConsoleLog = console.log
      console.log = (...args) => {
        this.console.addLog('> ' + args)
        oldConsoleLog(args)
      }

      // It's ok to use eval as this will be a static page
      try {
        this.console.addLog('>>> ' + eval(evalContent))
      } catch (e) {
        this.console.addError('>>> ' + e.message)
      }

      // Restore console.log
      console.log = oldConsoleLog
    })

    this.perfBtn.addEventListener('click', () => {
      let editor = this.editor.aceEditor,
          content = editor.getValue(),
          hasError = false,
          totalDuration = 0,
          singleDuration,
          runCount,
          runCountIter
          

      this.console.startNewLog()

      // Perf test will evalute run time by average
      try {
        singleDuration = window.performance.now()
        eval(content)
        singleDuration = window.performance.now() - singleDuration
      } catch (e) {
        this.console.addError('>>> ' + e.message)
        hasError = true
      }

      if (hasError) {
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

      this.console.addLog('[Average duration for ' + runCount + ' runs] ' + totalDuration / runCount * 1000 + ' ms')
    })
  }
};

module.exports = App