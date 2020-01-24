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
    this.rows = this.util.sheet2Array(this.data, this.skip,true)
    return this.rows
  }

  build(row, output) {
    let lastEpic = ''
    let lastStory = ''

    this.rows.forEach(templateRow => {
      this.id++
      let issue = {
        "Issue ID": this.id,
        "Issue Type": templateRow['Type'],
        "Summary": this.format(templateRow['Summary'],row),
        "Description": this.format(templateRow['Summary'],row),
        "Labels": this.format(templateRow["Labels"],row)
      }
      if (templateRow['Assignee']) {
        issue['Assignee'] = templateRow['Assignee']
      }
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
        case 'Subtask':
          issue["Parent ID"] = lastStory
          issue["Issue Type"] = "Subtask"
          break
      }
      output.push(issue)
    })
  }

  format(form,row) {
    let rc = form
    let keys = Object.keys(row)
    let reg = null
    keys.forEach(k => {
      reg = new RegExp(`{{${k}}}`,'g')
      rc = rc.replace(reg,row[k])
    })

    reg = new RegExp('{{[A-Z]+}}','g')
    rc = rc.replace(reg,'undefined')
    return rc
  }
}

module.exports = {
  Template
}