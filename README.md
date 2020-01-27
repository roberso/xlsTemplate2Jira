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
  
## Build Executables
- open a terminal / command prompt and switch to the directory where the repo was cloned to
- run `npm run build`
- output will be in the `./bin` directory
