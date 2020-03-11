const CSV = require("csv-string");
var spawn = require("child_process").spawnSync;
fs = require("fs");

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

  doExtractGitLogcmd(result) {
    return executeCommand(
      extractGitLogCmd(result.repository_path, result.after_date)
    );
  }

  doRunCodeMaatOnExtractedGitLogCmd(pathToLogfile) {
    return executeCommand(runCodeMaatOnExtractedGitLogCmd(pathToLogfile));
  }

  generateComplexityData(result) {
    var logCmdOutput = doExtractGitLogcmd(result);
    writeOutputToFile("log/logfile.log", logCmdOutput, err => {
      console.log("error: " + err);
    });
    const codeMaatOutput = doRunCodeMaatOnExtractedGitLogCmd(
      __dirname + "/fixtures/code-maat/result.txt"
    );
    const arr = CSV.parse(codeMaatOutput);
    // Remove the header
    arr.shift();
    // Append Code Maat's result with output from Cloc
    arr.forEach(value => {
      const clocOutput = executeCommand(
        countNumberOfLinesCmd(result.repository_path + "/" + value[0])
      );
      value.push(clocOutput.stdout.toString());
    });
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
