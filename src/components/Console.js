import Base from './Base'

class Console extends Base {
  constructor (options = {}) {
    super()

    this.app = options.app
    this.element = document.getElementById('console');
    this.toolBarElement = this.element.querySelector('.toolBar')
    this.clearBtnElement = this.toolBarElement.querySelector('button.toClear')
    this.contentElement = this.element.querySelector('.content')

    this.attachEditors()
    this.listen()
  }

  listen () {
    this.clearBtnElement.addEventListener('click', this.handleClearConsole.bind(this))
  }

  handleClearConsole () {
    this.contentElement.innerHTML = ''
  }

  attachEditors () {
    let editors = this.app.editors,
        editorTabs = document.createElement('div')

    editorTabs.className = 'editorTabs tabs'
    editors.forEach((editor) => {
      let editorTab = document.createElement('button')
      editorTab.className = 'editorTab tab'
      editorTab.textContent = editor.filename

      editorTabs.appendChild(editorTab)
    })

    this.toolBarElement.appendChild(editorTabs)
  }

  addLog (editorFilename, ...log) {
    this.contentElement.innerHTML += '<pre class="result">' + editorFilename + ' > ' + log.join(' ') + '</pre>'
  }

  addError (editorFilename, ...error) {
    this.contentElement.innerHTML += '<pre class="result error">' + editorFilename + ' >>> ' + error.join(' ') + '</pre>'
  }

  addResult (editorFilename, ...result) {
    this.contentElement.innerHTML += '<pre class="result">' + editorFilename + ' >>> ' + result.join(' ') + '</pre>'
  }

  clearLog () {
    this.contentElement.innerHTML = ''
  }

  startNewLog () {
    let oldLogs = this.contentElement.querySelectorAll('pre.result'),
        needSplitter = false

    oldLogs.forEach((node) => {
      if (!node.classList.contains('old')) {
        node.classList.add('old')
        needSplitter = true
      }
    })

    if (needSplitter) {
      this.contentElement.querySelectorAll('hr').forEach((node) => {
        node.classList.add('old')
      })

      this.contentElement.innerHTML += '<hr />'
    }
  }
}

module.exports = Console