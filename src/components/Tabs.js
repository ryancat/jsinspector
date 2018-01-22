import Base from './Base'
import util from '../util'

class Tabs extends Base {
  constructor (options = {}) {
    super()

    this.app = options.app
    this.element = options.container
    this.tabContainer = document.createElement('div')
    this.tabContainer.classList.add('tabContainer')
    this.element.appendChild(this.tabContainer)

    if (options.createTab) {
      this.createTab = document.createElement('button')
      this.createTab.className = 'tab toCreateTab'
      this.createTab.textContent = options.createTab.label || 'Add New'
      this.element.appendChild(this.createTab)
    }
    
    this.tabCount = 0

    this.listen()
  }

  listen () {
    this.tabContainer.addEventListener('click', this.handleSwitchTabs.bind(this))
    if (this.createTab) {
      this.createTab.addEventListener('click', this.handleCreateTab.bind(this))
    }
  }

  /**
   * When click on tabs, we need to switch view of files
   */
  handleSwitchTabs (e) {
    let tab = util.closestElement(e.target, 'tab', this.tabContainer)
    if (!tab) {
      // Didn't click on a tab
      return
    }

    this.selectTab(tab)
    // TODO: use event bus for this
    this.fire('tabs.selectId', tab.dataset.forId, this)
  }

  handleCreateTab () {
    // We need external information to create a tab, hence
    // here we are simply firing events to let external logic
    // to handle it
    this.fire('tabs.createTab')
  }

  addTab (id, label) {
    let editorTab = document.createElement('button')

    editorTab.className = 'tab'
    editorTab.textContent = label
    editorTab.dataset.forId = id

    this.tabContainer.appendChild(editorTab)
    this.tabCount++
  }

  selectTab (tab) {
    // Show selected state for corresponding tab
    let editorTabs = this.tabContainer.querySelectorAll('.tab')
    
    for (let editorTab of editorTabs) {
      editorTab === tab ? editorTab.classList.add('selected') : editorTab.classList.remove('selected')
    }
  }

  selectTabWithId (id) {
    if (typeof id === 'undefined' || id === null) {
      return
    }

    let editorTabs = this.tabContainer.querySelectorAll('.tab')

    for (let editorTab of editorTabs) {
      editorTab.dataset.forId === id 
      ? editorTab.classList.add('selected') : editorTab.classList.remove('selected')
    }
  }
}

module.exports = Tabs