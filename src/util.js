const util = {
  closestElement: (startElement, className) => {
    while (startElement) {
      if (startElement.classList.contains(className)) {
        return startElement
      }
      startElement = startElement.parentElement
    }

    return null
  }
}

module.exports = util