let convert = require('number-converter-alphabet')

class Utility {
  getCellValue(cell) {
    return cell ? cell.v : undefined;
  }

  sheet2Array(sheet, skip, useFirstRow = false, emptyMax = 10) {
    let rc = []
    let altHeader = null
    if (useFirstRow) {
      altHeader = this.buildHeader(sheet, 1)
    }
    let done = false
    let row = skip
    while (!done) {
      row++
      let key = this.getCellValue(sheet[`A${row}`])
      if (key == '') {
        // skip
      } else if (key == undefined) {
        done = true
      } else {
        rc.push(this.buildRow(row, sheet, emptyMax, altHeader))
      }
    }
    return rc
  }

  buildHeader(sheet, row) {
    let done = false
    let i = 0
    let rc = []
    while (!done) {
      let letter = this.getCell(i).toUpperCase()
      let cell = `${letter}${row}`
      let val = this.getCellValue(sheet[cell])
      if (val) {
        rc.push(val)
      } else {
        done = true
      }
      i++
    }
    return rc
  }

  buildRow(row, sheet, emptyMax, altHeader) {
    let done = false
    let i = 0
    let empty = 0
    let rc = {}
    while (!done) {
      let offset = i
      let letter = this.getCell(i).toUpperCase()
      let cell = `${letter}${row}`
      let val = this.getCellValue(sheet[cell])
      if (val) {
        let col = letter
        if (altHeader) {
          col = altHeader[offset]
          if (!col) {
            col = letter
          }
        }
        rc[col] = val
        if(typeof val == 'string') {
          rc[col] = val.trim()
        }
        empty = 0
      } else {
        empty++
      }

      if (empty >= emptyMax) {
        done = true
      } else {
        i++
      }
    }
    return rc
  }

  getCell(i) {
    return convert.default(i, convert.ALPHABET_ASCII, {
      implicitLeadingZero: false
    })
  }
}

module.exports = {
  Utility
}