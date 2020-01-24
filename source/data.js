let XLSX = require('xlsx')
let {
  Utility
} = require('./util')

class Data {
  constructor(log, source) {
    this.log = log
    this.source = source
    this.data
    this.skip = 1
    this.tab = 0
    this.rows = []
    this.util = new Utility()
  }

  load() {
    let workbook = XLSX.readFile(this.source);
    let keys = Object.keys(workbook.Sheets)
    this.data = workbook.Sheets[keys[this.tab]];
    this.rows = this.util.sheet2Array(this.data, this.skip)
    return this.rows
  }

  getRows() {
    return this.rows
  }

  getCellValue(cell) {
    return cell ? cell.v : undefined;
  }
}

module.exports = {
  Data
}