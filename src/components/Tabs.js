import Base from './Base'
import util from '../util'

class Tabs extends Base {
  constructor (options = {}) {
    super()

    this.element = options.container
    this.app = options.app
    this.tabCount = 0
    this.listen()
  }

  listen () {
    this.element.addEventListener('click', this.handleSwitchTabs.bind(this))
  }

  /**
   * When click on tabs, we need to switch view of files
   */
  handleSwitchTabs (e) {
    let tab = util.closestElement(e.target, 'tab', this.element)
    if (!tab) {
      // Didn't click on a tab
      return
    }

    this.selectTab(tab)
    // TODO: use event bus for this
    this.fire('tabs.selectId', tab.dataset.forId, this)
  }

  addTab (id, label) {
    let editorTab = document.createElement('button')

    editorTab.className = 'editorTab tab'
    editorTab.textContent = label
    editorTab.dataset.forId = id

    this.element.appendChild(editorTab)
    this.tabCount++
  }

  selectTab (tab) {
    // Show selected state for corresponding tab
    let editorTabs = this.element.querySelectorAll('.editorTab')
    
    for (let editorTab of editorTabs) {
      editorTab === tab ? editorTab.classList.add('selected') : editorTab.classList.remove('selected')
    }
  }

  selectTabWithId (id) {
    if (typeof id === 'undefined' || id === null) {
      return
    }

    let editorTabs = this.element.querySelectorAll('.editorTab')

    for (let editorTab of editorTabs) {
      editorTab.dataset.forId === id 
      ? editorTab.classList.add('selected') : editorTab.classList.remove('selected')
    }
  }
}

module.exports = Tabs