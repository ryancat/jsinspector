class EventBus {

  constructor (options = {}) {
    this.id = options.id || -1
    this.parentId = options.parentId || null
    this.children = []

    // Events map that belongs to this event bus
    this.events = {}
  }

  subscribe (event = '', callback) {
    this.events[event] = this.events[event] || []
    if (this.events[event].indexOf(callback) !== -1) {
      // We already have this callback subscribed
      return
    }

    this.events[event].push(callback)
  }

  publish (event, ...data) {
    let callbacks = this.events[event]
    if (!callbacks) {
      // Do nothing if there is no such event subscribed
      return
    }

    callbacks.forEach(callback => callback(...data))
  }
}

module.exports = EventBus