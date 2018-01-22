import EventBus from '../EventBus'

// TODO: we only have one global event bus now.
// When the app gets more complicated, it's better
// to have multiple layers of event buses
let _eventBus = new EventBus()

/**
 * The base component that provides fundamental component
 * methods
 * 
 * - Event bus
 */
class Base {
  constructor () {
  }

  fire (event, ...data) {
    _eventBus.publish(event, ...data)
  }

  on (event, callback) {
    _eventBus.subscribe(event, callback)
  }
}

module.exports = Base