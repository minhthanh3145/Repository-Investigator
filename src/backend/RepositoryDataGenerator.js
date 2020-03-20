const CSV = require("csv-string");
const CommandUtil = require("./CommandUtil").CommandUtil;
const Constants = require("./Constants").Constants;
fs = require("fs");
var appRoot = require("app-root-path");

class RepositoryDataGenerator {
  _hierarchicalDataGenerator;

  constructor(hierarchicalDataGenerator) {
    this._hierarchicalDataGenerator = hierarchicalDataGenerator;
  }

  writeOutputToFile(path, content, errCallback) {
    fs.writeFileSync(path, content, err => errCallback(err));
  }

  doExtractGitLogcmd(result) {
    return CommandUtil.executeCommand(
      Constants.EXTRACT_GIT_CMD(result.repository_path, result.after_date)
    );
  }

  doRunCodeMaatOnExtractedGitLogCmd(pathToLogfile) {
    return CommandUtil.executeCommand(
      Constants.EXTRACT_CODE_MAAT_CMD(pathToLogfile)
    );
  }

  /**
   * Call Code Maat command to extract a log file containing the commits.
   * Use the given filterFunction to filter out files and process the remaining files by
   * delegating the task to the given hierarchical data generator
   *
   * @param {Array} result An array of array containing information about n-author, n-revision and n-loc
   * @param {Function} filterFunction A function that takes in each line
   * and determine wether the corresponding file will be processed.
   * It should be specified to increase performance.
   * If left unspecified, it defaults to removing lines with extension svg, png, jpg, md.
   *
   */
  async generateComplexityData(result) {
    var logCmdOutput = await this.doExtractGitLogcmd(result);
    this.writeOutputToFile(appRoot + "/log/logfile.log", logCmdOutput, err => {
      console.log("error: " + err);
    });
    const rawCodeMaatOutput = await this.doRunCodeMaatOnExtractedGitLogCmd(
      appRoot + "/log/logfile.log"
    );
    const codeMaatOutput = CSV.parse(rawCodeMaatOutput);
    // Remove the header
    codeMaatOutput.shift();
    return await this._hierarchicalDataGenerator.generateHierarchicalData(
      codeMaatOutput,
      result.repository_path
    );
  }
}

module.exports.RepositoryDataGenerator = RepositoryDataGenerator;
