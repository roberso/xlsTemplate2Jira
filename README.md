# xlsTemplate2Jira
This tool takes a template input and a spreadsheet of items and builds a CSV ready to import into Jira.  

## Build Locally
To build/run the tool locally on your system you will need to do the following:
- have node installed, see https://nodejs.org
- clone the repo locally
- open a terminal / command prompt and switch to the directory where the repo was cloned to
- run `npm i` to install needed libraries
- run `npm i -g pkg' needed to build executable

## Run locally
- use the data in the ./test directory as examples of what the format of the template and data spreadsheets should look like
- to run locally do something like this from the command prompt / terminal
  `node app -i ./test/data.xlsx -t ./test/template.xlsx -o ./test/output.csv`

### Template File
See ./test/template.xlsx for a sample template file.  Basically the template is the set of jira issues
that will be created into the output csv file for each row in the data input xlsx.  A few items of note:
- You must have a `Issue Type` and `Summary` column.  Please use mixed case as in the example template in the test directory.
    - `Issue Type` and `Summary` must not be blank
    - `Issue Type` should be a valid value based on Jira CSV import guidelines (Ex: Epic, Story, Sub-task, ...)
- use the {{column letter}} format to specify data to insert into the resulting jira items in the output csv.  Example:
    - `{{E}} - {{D}}` tells the processer to take the contents of columns E and D respectively for a specific row and replace the strings `{{E}}` and `{{D}}` in the template
    - So if the row had column E=`Hello` and D=`Alma`.  The string of `{{E}} - {{D}}` would be converted into `Hello - Alma`
    - Empty cells will be treated as blanks when doing the replacement
- If you have an `Issue Type` of `Epic` in your template, you will need to make sure that the `Summary` generates a unique string since it will be used as the `Epic Link` column in the output csv

### Importing into Jira
The resulting output CSV file is targeted to be imported using the instructions found at https://confluence.atlassian.com/adminjiraserver/importing-data-from-csv-938847533.html.
  
## Build Executables
- open a terminal / command prompt and switch to the directory where the repo was cloned to
- run `npm run build`
- output will be in the `./bin` directory
