const prompt = require("prompt");
const CSV = require("csv-string");
var spawn = require("child_process").spawnSync;
fs = require("fs");

class DataGenerator {
  extractGitLogCmd(path, after_date) {
    return `git -C ${path} log --all --numstat --date=short --pretty=format:--%h--%ad--%aN --no-renames --after=${after_date}`;
  }

  runCodeMaatOnExtractedGitLogCmd(pathToLogFile) {
    return `java -jar resources/code-maat.jar -l ${pathToLogFile} -c git2`;
  }

  countNumberOfLinesCmd(filePath) {
    `cloc ${filePath} --by-file --json`;
  }

  writeOutputToFile(path, content, errCallback) {
    fs.writeFileSync(path, content, err => errCallback(err));
  }

  generateComplexityData(result) {
    var logCmdOutput = executeCommand(
      extractGitLogCmd(result.repository_path, result.after_date)
    );

    writeOutputToFile(
      "log/logfile.log",
      logCmdOutput.stdout.toString(),
      err => {
        console.log("error: " + err);
      }
    );

    const codeMaatOutput = executeCommand(runCodeMaatOnExtractedGitLogCmd());

    const arr = CSV.parse(codeMaatOutput.toString());
    // Remove the header
    arr.shift();

    arr.forEach(value => {
      const clocOutput = executeCommand(
        countNumberOfLinesCmd(result.repository_path + "/" + value[0])
      );
      value.push(clocOutput.toString());
    });

    console.log(arr);
  }

  /**
   *
   * @param {String} command The command will be splited by space and trim.
   * The first element will be used as the target program and the rest will be the arguments
   */
  executeCommand(command) {
    var splitted = command.split(" ").map(item => item.trim());
    var program = splitted[0];
    splitted.shift();
    return spawn(program, splitted);
  }
}

module.exports = DataGenerator;
