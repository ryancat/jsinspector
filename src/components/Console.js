import Base from './Base'

class Console extends Base {
  constructor () {
    super()
    this.resultElement = document.getElementById('evalResult');
  }
}

module.exports = Console