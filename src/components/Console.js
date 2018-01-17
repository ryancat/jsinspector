import Base from './Base'

class Console extends Base {
  constructor () {
    super()
    this.resultElement = document.getElementById('evalResult');
  }

  addLog (log) {
    this.resultElement.innerHTML += '<pre class="result">' + log + '</pre>'
  }

  addError (error) {
    this.resultElement.innerHTML += '<pre class="result error">' + error + '</pre>'
  }

  clearLog () {
    this.resultElement.innerHTML = ''
  }

  startNewLog () {
    let oldLogs = this.resultElement.querySelectorAll('pre.result'),
        needSplitter = false

    oldLogs.forEach((node) => {
      if (!node.classList.contains('old')) {
        node.classList.add('old')
        needSplitter = true
      }
    })

    if (needSplitter) {
      this.resultElement.querySelectorAll('hr').forEach((node) => {
        node.classList.add('old')
      })

      this.resultElement.innerHTML += '<hr />'
    }
  }
}

module.exports = Console