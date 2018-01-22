import Base from './Base'
import Editor from './Editor'
import Console from './Console'
import Tabs from './Tabs'
import util from '../util'
import { SSL_OP_NO_SESSION_RESUMPTION_ON_RENEGOTIATION } from 'constants';

// Performance test duration is about 3s
const PERF_DURATION = 3000

class App extends Base {
  constructor () {
    super()

    this.inspectBtn = document.getElementById('inspectBtn')
    this.perfBtn = document.getElementById('perfBtn')
    this.newEditorBtn = document.getElementById('newEditorBtn')
    this.editorsElement = document.getElementById('editors')
    // this.editorTabs = this.editorsElement.querySelector('.editorTabs')
    this.listen()

    this.console = new Console({
      app: this
    })

    this.editorTabs = new Tabs({
      app: this,
      container: this.editorsElement.querySelector('.editorTabs')
    })

    this.editors = []
    this.addNewEditor()
    // window.editors = this.editors
  }

  listen () {
    this.inspectBtn.addEventListener('click', this.handleInspectClick.bind(this))
    this.perfBtn.addEventListener('click', this.handlePerfClick.bind(this))
    this.newEditorBtn.addEventListener('click', this.handleNewEditorClick.bind(this))
    window.onbeforeunload = this.handlePageUnload.bind(this)

    this.on('editor.init', this.attachTabToEditor.bind(this))
    this.on('tabs.selectId', this.selectTabWithId.bind(this))
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

    let oldConsoleLog = console.log
    this.console.startNewLog()
    this.editors.forEach((editor) => {
      let lineContents = editor.aceEditor.getValue().split('\n')

      // hijack console.log
      console.log = (...args) => {
        this.console.addLog(editor, ...args)
        oldConsoleLog(args)
      }

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
    
    this.console.startNewLog()

    this.editors.forEach((editor) => {
      let content = editor.aceEditor.getValue()
      // Perf test will evalute run time by average
      try {
        singleDuration = window.performance.now()
        eval(content)
        singleDuration = window.performance.now() - singleDuration
      } catch (e) {
        this.console.addError(editor, e.message)
        hasError = true
      }

      if (hasError) {
        this.console.addError(editor, 'Error evaluating javascript code')
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

      this.console.addResult(editor, 'Average duration for ' + runCount + ' runs: ' + totalDuration / runCount + ' ms')
    })
  }

  /**
   * When click on new editor button, we will spawn a new editor
   */
  handleNewEditorClick () {
    this.addNewEditor()
  }

  addNewEditor () {
    let editorElement = document.createElement('div')
    editorElement.classList.add('editor')
    this.editorsElement.appendChild(editorElement)

    let newEditor = new Editor({
      container: editorElement,
      app: this
    })

    this.editors.push(newEditor)
    this.showEditor(newEditor)
  }

  attachTabToEditor (editor) {
    this.editorTabs.addTab(editor.id, editor.filename)
    // Always select the attached tab
    this.editorTabs.selectTabWithId(editor.id)
  }

  showEditor (editor) {
    this.editors.forEach((editor) => editor.hide())
    editor.show()
  }

  showEditorWithId (id) {
    if (typeof id === 'undefined' || id === null) {
      return
    }

    let editor = this.editors.find((editor) => editor.id === id)

    if (!editor) {
      this.console.addError(null, 'No such file to show')
      return
    }

    this.showEditor(editor)
  }

  selectTabWithId (id, tabs) {
    if (this.editorTabs !== tabs) {
      return
    }
    this.showEditorWithId(id)
  }
};

module.exports = App