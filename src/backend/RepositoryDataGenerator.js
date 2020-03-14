const CSV = require("csv-string");
var spawn = require("child_process").spawnSync;
fs = require("fs");
var appRoot = require("app-root-path");

class RepositoryDataGenerator {
  constructor() {}

  EXTRACT_GIT_CMD(path, after_date) {
    return `git -C ${path} log --all --numstat --date=short --pretty=format:--%h--%ad--%aN --no-renames --after=${after_date}`;
  }

  EXTRACT_CODE_MAAT_CMD(pathToLogFile) {
    return `java -jar resources/code-maat.jar -l ${pathToLogFile} -c git2`;
  }

  EXTRACT_LINE_OF_CODES_CMD(filePath) {
    return `cloc ${filePath} --by-file --json --quiet`;
  }

  writeOutputToFile(path, content, errCallback) {
    fs.writeFileSync(path, content, err => errCallback(err));
  }

  doExtractLineOfCode(path) {
    return this.executeCommand(this.EXTRACT_LINE_OF_CODES_CMD(path));
  }

  doExtractGitLogcmd(result) {
    return this.executeCommand(
      this.EXTRACT_GIT_CMD(result.repository_path, result.after_date)
    );
  }

  doRunCodeMaatOnExtractedGitLogCmd(pathToLogfile) {
    return this.executeCommand(this.EXTRACT_CODE_MAAT_CMD(pathToLogfile));
  }

  /**
   * Call Code Maat command to extract a log file containing the commits.
   * Use the given filterFunction to filter out files and process the remaining files by
   * calling Code Maat command to get number of revisions, number of authors and call Cloc commmand to get number of lines of code
   *
   * @param {Array} result An array of array containing information about n-author, n-revision and n-loc
   * @param {Function} filterFunction A function that takes in each line
   * and determine wether the corresponding file will be processed.
   * It should be specified to increase performance.
   * If left unspecified, it defaults to removing lines with extension svg, png, jpg, md.
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
    let output = {
      name: "hierarchy",
      children: []
    };

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
          this.generateHierarchicalData(output, value);
        }
      }
    }
    return output;
  }

  /**
   * Assumes that currentElement is an array containing:
   *  * First element is a string represents the path to file
   *  * The rest is arbitrary primitive objects
   *
   * This method will build a nested structure (refer to`../../test/fixtures/flare.json`)
   * from currentElememnt which puts the given primitive objects into the deepest layer
   *
   * @param {JSON} output
   * @param {Array} currentElement
   */
  generateHierarchicalData(output, currentElement) {
    var current = output["children"];
    const paths = currentElement[0].split("/");
    for (let index = 0; index < paths.length; index++) {
      let segment = paths[index];
      if (segment !== "") {
        if (!current) {
          current = [];
        }
        const firstEle = current.find(curr => curr["name"] == segment);
        if (!firstEle) {
          if (index != paths.length - 1) {
            current.push({
              name: segment,
              children: []
            });
          } else {
            current.push({
              name: segment,
              "n-authors": currentElement[1],
              "n-revisions": currentElement[2],
              loc: currentElement[3]
            });
          }
        } else {
          current = firstEle;
        }
        current = current["children"];
      }
    }
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

module.exports.RepositoryDataGenerator = RepositoryDataGenerator;
