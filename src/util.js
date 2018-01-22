const util = {
  closestElement: (startElement, className, endElement = document.body) => {
    while (startElement !== endElement.parentElement) {
      if (startElement.classList.contains(className)) {
        return startElement
      }
      startElement = startElement.parentElement
    }

    return null
  }
}

module.exports = util