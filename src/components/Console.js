import Base from './Base'
import Tabs from './Tabs'
import Editor from './Editor'

class Console extends Base {
  constructor (options = {}) {
    super()

    this.app = options.app
    this.element = document.getElementById('console');
    this.toolBarElement = this.element.querySelector('.toolBar')
    this.clearBtnElement = this.toolBarElement.querySelector('button.toClear')
    this.contentElement = this.element.querySelector('.content')
    this.listen()

    this.editorTabs = new Tabs({
      app: this.app,
      container: this.toolBarElement.querySelector('.editorTabs')
    })

    this.logs = []
    /**
     * The log filters
     * 
     * Each filter has a operator and a value.
     * - { op: 'has', value: 'abc' }
     * - { op: 'editor', value: 1 }
     */
    this.filters = []
  }

  listen () {
    this.clearBtnElement.addEventListener('click', this.handleClearConsole.bind(this))
    this.on('editor.init', this.attachTabToEditor.bind(this))
    this.on('tabs.selectId', this.selectTabWithId.bind(this))
  }

  handleClearConsole () {
    this.contentElement.innerHTML = ''
  }

  attachTabToEditor (editor) {
    if (!this.editorTabs.tabCount) {
      // First time adding tab to editor, we are going to
      // also add a tab for 'All'
      this.editorTabs.addTab(Editor.ALL_EDITOR_ID, 'All files')
      this.editorTabs.selectTabWithId(Editor.ALL_EDITOR_ID)
    }

    this.editorTabs.addTab(editor.id, editor.filename)
  }

  renderLogs () {
    let logs = this.logs

    // Apply log filters
    this.filters.forEach((filter) => {
      switch (filter.op) {
        case 'editor':
          logs = logs.filter(log => 
            filter.value === Editor.ALL_EDITOR_ID // Filter for all editors
            || log.editorId === Editor.ALL_EDITOR_ID // Logs for all editors
            || log.editorId === filter.value)
          break
        
        case 'has':
          logs = logs.filter(log => log.content.indexOf(filter.value) >= 0)
          break
      }
    })

    this.contentElement.innerHTML = logs.map(log => log.content).join('')
  }

  addLog (editor, ...log) {
    this.logs.push({
      editorId: editor ? editor.id : -1,
      content: '<pre class="result">' + editor.filename + ' > ' + log.join(' ') + '</pre>'
    })
    this.renderLogs()
  }

  addError (editor, ...error) {
    this.logs.push({
      editorId: editor ? editor.id : -1,
      content: '<pre class="result error">' + editor.filename + ' >>> ' + error.join(' ') + '</pre>'
    })
    this.renderLogs()
  }

  addResult (editor, ...result) {
    this.logs.push({
      editorId: editor ? editor.id : -1,
      content: '<pre class="result">' + editor.filename + ' >>> ' + result.join(' ') + '</pre>'
    })
    this.renderLogs()
  }

  clearLog () {
    this.logs = []
    this.renderLogs()
  }

  startNewLog () {
    let lastLog = this.logs[this.logs.length - 1]

    // if (typeof lastLog === 'undefined' || lastLog.content !== '<hr />') {
      
    // }

    // Make the existing logs old
    this.logs.push({
      // -1 editor id will show for all editor
      editorId: Editor.ALL_EDITOR_ID,
      content: '<hr />'
    })
    this.renderLogs()

    // let oldLogs = this.contentElement.querySelectorAll('pre.result'),
    //     needSplitter = false

    // oldLogs.forEach((node) => {
    //   if (!node.classList.contains('old')) {
    //     node.classList.add('old')
    //     needSplitter = true
    //   }
    // })

    // if (needSplitter) {
    //   this.contentElement.querySelectorAll('hr').forEach((node) => {
    //     node.classList.add('old')
    //   })

    //   this.contentElement.innerHTML += '<hr />'
    // }
  }

  showEditorLogWithId (id) {
    let hasFilterForId = false

    this.filters.forEach((filter, ind) => {
      if (filter.op === 'editor') {
        if (filter.value !== id) {
          this.filters.splice(ind, 1)
        }
        else {
          hasFilterForId = true
        }
      }
    })

    if (!hasFilterForId) {
      this.filters.push({
        op: 'editor',
        value: id
      })
    }

    this.renderLogs()
  }

  selectTabWithId (id, tabs) {
    if (this.editorTabs !== tabs) {
      return
    }
    this.showEditorLogWithId(id)
  }
}

module.exports = Console