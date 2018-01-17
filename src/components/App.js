import Base from './Base'
import Editor from './Editor'
import Console from './Console'

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
  }
};

module.exports = App