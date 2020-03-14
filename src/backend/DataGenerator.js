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
   * Call Code Maat and Cloc commands to get number of authors, number of revisions and number of line of code.
   * Remove lines that match the excludedExtensions parameter and return the aggregated result
   * @param {Array} result An array of array containing information about n-author, n-revision and n-loc
   * @param {Array} excludedExtensions An array of excluded extensions, default to [".svg", ".png", ".jpg", ".md"]
   */
  async generateComplexityData(result, excludedExtensions) {
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
    excludedExtensions = excludedExtensions
      ? excludedExtensions
      : [".svg", ".png", ".jpg", ".md"];
    for (const value of arr) {
      let clocOutput;
      let jsonLineOfCodeExtracted;
      if (
        !excludedExtensions.filter(ext => {
          return value[0].endsWith(ext);
        }).length
      ) {
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
