let XLSX = require('xlsx')
let {
  Utility
} = require('./util')

class Template {
  constructor(log, source) {
    this.log = log
    this.source = source
    this.data = null
    this.id = 1
    this.rows = []
    this.skip = 1
    this.util = new Utility()
  }

  load() {
    let workbook = XLSX.readFile(this.source);
    let keys = Object.keys(workbook.Sheets)
    this.data = workbook.Sheets[keys[0]];
    this.rows = this.util.sheet2Array(this.data, this.skip, true)
    this.validate(this.rows)
    return this.rows
  }

  validate(rows) {
    let col = Object.keys(rows[0])
    if(!col.includes("Issue Type")) {
      this.log.error("Missing 'Issue Type' column in template, please correct and rerun tool.")
      process.exit(8)
    } else if(!col.includes("Summary")) {
      this.log.error("Missing 'Summary' column in template, please correct and rerun tool.")
      process.exit(8)     
    }
  }

  build(row, output) {
    let lastEpic = ''
    let lastStory = ''

    this.rows.forEach(templateRow => {
      try {
        this.id++
        let issue = {
          "Issue ID": this.id,
        }

        let keys = Object.keys(templateRow)
        keys.forEach(t => {
          issue[t] = this.format(templateRow[t],row)
        })

        switch (issue['Issue Type'].toLowerCase()) {
          case 'epic':
            issue["Epic Name"] = issue["Summary"]
            issue["Issue Type"] = "Epic"
            lastEpic = issue["Summary"]
            break
          case 'story':
            lastStory = this.id
            issue["Epic Link"] = lastEpic
            issue["Issue Type"] = "Story"
            break
          case 'sub-task':
          case 'subtask':
            issue["Parent ID"] = lastStory
            issue["Issue Type"] = "Sub-task"
            break
        }
        output.push(issue)
      } catch (err) {
        this.log.error(`trying to build for row`, err)
      }
    })

  }

  format(form, row) {
    let rc = form
    if (form) {
      let keys = Object.keys(row)
      let reg = null
      keys.forEach(k => {
        reg = new RegExp(`{{${k}}}`, 'g')
        let v = row[k]
        if(!v) {
          v = ''
        }
        rc = rc.replace(reg, v)
      })

      reg = new RegExp('{{[A-Z]+}}', 'g')
      rc = rc.replace(reg, '')
    } else {
      rc = ''
    }
    return rc
  }
}

module.exports = {
  Template
}