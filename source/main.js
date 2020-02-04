const fs = require('fs')
const {
  Template
} = require('./template.js')

const {
  Data
} = require('./data.js')

const {
  Parser
} = require('json2csv')

let appInfo = require('../package.json')
let commandLineArgs = require("command-line-args")
const commandLineUsage = require('command-line-usage')

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

    this.optionDefinitions = [{
        name: 'input',
        alias: 'i',
        type: String,
        description: `The location of the imput spreadsheet that contains the data that will be applied to the template in order to build the jira import csv.  Example {bold -i ./test/data.xlsx}`,
        typeLabel: '{underline input}'
      },
      {
        name: 'template',
        alias: 't',
        type: String,
        description: 'The location of the template xlsx file that defines the structure of the jira items to create.  Example {bold -i ./test/template.xlsx}',
        typeLabel: '{underline template}'
      },
      {
        name: 'output',
        alias: 'o',
        type: String,
        description: 'The name of the file where you want the output CSV written.  Example {bold -i ./test/output.csv}',
        typeLabel: '{underline output}'
      },

      {
        name: 'help',
        alias: 'h',
        type: Boolean,
        description: '(optional) Prints the help for the tool',
        typeLabel: '',
        defaultValue: false
      }
    ]

    let cmd = 'xlsTemplate2Jira'
    if (process.platform == 'darwin') {
      cmd = './xlsTemplate2Jira'
    }

    this.usage = [{
        header: `${appInfo.name} v${appInfo.version} by ${appInfo.author}`,
        content: appInfo.description
      }, {
        header: 'Options',
        optionList: this.optionDefinitions
      },
      {
        header: 'Example',
        content: `${cmd} -i ./test/data.xlsx -t ./test/template.xlsx -o ./test/output.csv`
      }
    ]
    this.validHeader = [this.usage[0]]
    this.options = commandLineArgs(this.optionDefinitions)
    this.jiraMax = 800
  }

  isValid() {
    let isValid = false
    if ((this.options.input != undefined) && (this.options.output != undefined) && (this.options.template != undefined)) {
      isValid = true
      this.templateFile = this.options.template
      this.sourceFile = this.options.input
      this.outputFile = this.options.output
    }
    return isValid
  }

  syntax() {
    const usage = commandLineUsage(this.usage)
    console.log(usage)
  }

  printHeader() {
    const usage = commandLineUsage(this.validHeader)
    console.log(usage)
  }

  processRequest() {
    return new Promise((resolve, reject) => {
      let output = []
      this.data = new Data(this.log, this.sourceFile)
      this.template = new Template(this.log, this.templateFile)
      this.log.info(`loading template ${this.options.template}...`)
      this.template.load()
      this.log.info(`loading input data ${this.options.input}...`)
      this.data.load()
      this.log.info(`combining information...`)
      let rows = this.data.getRows()
      rows.forEach(row => {
        this.template.build(row, output)
      })

      this.log.info(`writing output...`)
      let segements = this.splitOutput(output)
      let promises = []
      segements.forEach(seg => {
        promises.push(this.writeCSV(seg))
      })
      Promise.all(promises).then(data => {
        resolve(true)
      }).catch(err => {
        reject(err)
      })
    })
  }

  splitOutput(outputList) {
    let rc = []

    // if can do in one pass (i.e., less than max then use list)
    if (outputList.length < this.jiraMax) {
      rc.push({
        id: '',
        list: outputList
      })
    } else {
      let id = 0
      let done = false
      let list = outputList
      while (!done) {
        id++
        let splitId = this.findSplit(list)
        if (splitId == -1) {
          rc.push({
            "id": `-part-${id}`,
            "list": list
          })
          done = true
        } else {
          rc.push({
            "id": `-part-${id}`,
            "list": list.slice(0, splitId)
          })
          list = list.slice(splitId);
        }
      }
    }

    return rc
  }

  findSplit(list) {
    let id = -1
    if (list.length > this.jiraMax) {
      for (let i = this.jiraMax; i > 0 && id == -1; i--) {
        if (list[i]["Issue Type"] == "Epic") {
          id = i
        }
      }
    }
    return id
  }

  buildCSVFileName(filePostFix) {
    let rc = this.options.output
    if (filePostFix.length > 0) {
      let idx = rc.toLowerCase().lastIndexOf(".csv")
      rc = `${rc.substring(0,idx)}${filePostFix}.csv`
    }
    return rc
  }

  writeCSV(seg) {
    return new Promise((resolve, reject) => {
      const file = this.buildCSVFileName(seg.id)
      const json2csvParser = new Parser()
      const csv = json2csvParser.parse(seg.list)

      fs.writeFile(file, csv, 'UTF-8', (err) => {
        if (err) {
          this.log.error(`failed writing ${file}`, err)
          reject(err)
        } else {
          this.log.info(`  ${file}`)
          resolve(true)
        }
      })
    })
  }

  run() {
    if (this.isValid()) {
      this.printHeader()
      this.processRequest().then(() => {
        this.log.info('done')
      }).catch(() => {
        this.log.error('errors detected')
      })
    } else {
      this.syntax()
    }
  }
}

module.exports = {
  Main
}