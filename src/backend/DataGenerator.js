const CSV = require("csv-string");
var spawn = require("child_process").spawnSync;
fs = require("fs");
var appRoot = require("app-root-path");

class DataGenerator {
  constructor() {}

  extractGitLogCmd(path, after_date) {
    return `git -C ${path} log --all --numstat --date=short --pretty=format:--%h--%ad--%aN --no-renames --after=${after_date}`;
  }

  runCodeMaatOnExtractedGitLogCmd(pathToLogFile) {
    return `java -jar resources/code-maat.jar -l ${pathToLogFile} -c git2`;
  }

  countNumberOfLinesCmd(filePath) {
    return `cloc ${filePath} --by-file --json --quiet`;
  }

  writeOutputToFile(path, content, errCallback) {
    fs.writeFileSync(path, content, err => errCallback(err));
  }

  doExtractLineOfCode(path) {
    return this.executeCommand(this.countNumberOfLinesCmd(path));
  }

  doExtractGitLogcmd(result) {
    return this.executeCommand(
      this.extractGitLogCmd(result.repository_path, result.after_date)
    );
  }

  doRunCodeMaatOnExtractedGitLogCmd(pathToLogfile) {
    return this.executeCommand(
      this.runCodeMaatOnExtractedGitLogCmd(pathToLogfile)
    );
  }

  /**
   * Call Code Maat command to extract a log file containing the commits.
   * Use the given filterFunction to filter out files and process the remaining files by
   * calling Code Maat command to get number of revisions, number of authors and call Cloc commmand to get number of lines of code
   *
   * @param {Array} result An array of array containing information about n-author, n-revision and n-loc
   * @param {Function} filterFunction A function that takes in each line and determine wether the corresponding file will be processed
   * .If left unspecified, it defaults to removing lines with extension svg, png, jpg, md. It should be specified to increase performance
   *
   */
  async generateComplexityData(result, filterFunction) {
    var logCmdOutput = await this.doExtractGitLogcmd(result);
    this.writeOutputToFile(appRoot + "/log/logfile.log", logCmdOutput, err => {
      console.log("error: " + err);
    });
    const codeMaatOutput = await this.doRunCodeMaatOnExtractedGitLogCmd(
      appRoot + "/log/logfile.log"
    );
    const arr = CSV.parse(codeMaatOutput);
    // Remove the header
    arr.shift();
    const complexityData = [];
    let excludedExtensions = [".svg", ".png", ".jpg", ".md"];
    // Prepare filter function
    filterFunction = filterFunction
      ? filterFunction
      : value =>
          !excludedExtensions.filter(ext => {
            return value[0].endsWith(ext);
          }).length;
    // Build the final result
    for (const value of arr) {
      let clocOutput;
      let jsonLineOfCodeExtracted;
      if (filterFunction(value)) {
        try {
          jsonLineOfCodeExtracted = await this.doExtractLineOfCode(
            result.repository_path + "/" + value[0]
          );
          clocOutput = JSON.parse(jsonLineOfCodeExtracted);
        } catch (e) {
          // Do nothing here
        }
        const lineOfCode =
          clocOutput && clocOutput["SUM"] && clocOutput["SUM"]["code"];
        if (lineOfCode) {
          value.push(lineOfCode);
          complexityData.push(value);
        }
      }
    }
    return complexityData;
  }

  /**
   *
   * @param {String} command The command will be splited by space and trim.
   * The first element will be used as the target program and the rest will be the arguments
   */
  async executeCommand(command) {
    const splitted = command.split(" ").map(item => item.trim());
    const program = splitted[0];
    splitted.shift();
    return spawn(program, splitted).stdout.toString();
  }
}

module.exports.DataGenerator = DataGenerator;
