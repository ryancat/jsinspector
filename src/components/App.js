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
    // var inspectBtn = document.getElementById('inspectBtn');
    
    this.listen()
  }

  listen () {
    this.inspectBtn.addEventListener('click', () => {
      var editor = this.editor.aceEditor,
          lineContents = editor.getValue().split('\n'),
          evalContent,
          result
      // TODO: Avoid nested eval
      // TODO: Undo and Redo

      // Add breakpoints
      editor.session.getBreakpoints().forEach((breakPointClass, row) => {
        if (breakPointClass.indexOf('disabled') === -1) {
          lineContents[row] = 'debugger; /* Line ' + (row + 1) + ' */' + lineContents[row]
        }
      });

      evalContent = '// Start debug your javascript...\ndebugger;\n\n' + lineContents.join('\n')

      // It's ok to use eval as this will be a static page
      try {
        result = eval(evalContent)
      } catch (e) {
        this.console.resultElement.innerHTML = '<span class="result error">Your javascript code has error(s)</span>'
      }

      if (this.console.resultElement.innerHTML === '') {
        this.console.resultElement.innerHTML = '<span class="result">Result: ' + result + '</span>'
      }
    })
  }
};

module.exports = App