const fs = require('fs')
const {
  Template
} = require('./template.js')

const {
  Data
} = require('./data.js')

const {
  Parser
} = require('json2csv');

class Main {
  constructor() {
    let log4js = require('log4js')
    log4js.configure({
      appenders: {
        console: {
          type: 'console'
        }
      },
      categories: {
        default: {
          appenders: ['console'],
          level: 'info'
        }
      }
    })
    this.log = log4js.getLogger()
    this.templateFile = './test/template.xlsx'
    this.sourceFile = './test/data.xlsx'
    this.outputFile = './test/output.csv'
  }

  isValid() {
    return true
  }

  syntax() {}

  processRequest() {
    let output = []
    this.data = new Data(this.log, this.sourceFile)
    this.template = new Template(this.log, this.templateFile)
    this.template.load()
    this.data.load()
    this.data.getRows().forEach(row => {
      this.template.build(row, output)
    })

    this.writeCSV(this.outputFile, output)
  }

  writeCSV(file, list) {
    const json2csvParser = new Parser()
    const csv = json2csvParser.parse(list)

    fs.writeFile(file, csv, 'UTF-8', (err) => {
      if (err) {
        this.log.error(`failed writing ${file}`, err)
      } else {
        this.log.info(`${file}`)
      }
    })
  }

  run() {
    if (this.isValid()) {
      this.processRequest()
    } else {
      this.syntax()
    }
  }
}

module.exports = {
  Main
}